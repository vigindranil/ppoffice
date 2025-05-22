const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper
const path = require("path");
const validateFields = require('../utils/validators.js');
// const basePath = `D:\\CaseTrack\\ppoffice\\ppo-office-casetrack\\`;

const basePath = `D:\\git\\ppoffice\\ppo-office-casetrack\\`;

class CaseController {


    // Show all CaseType
    static async getcasetype(req, res) {
        const query = 'CALL sp_CasetypeDropdown()';

        try {
            db.query(query, (err, results) => {
                if (err) {

                    return ResponseHelper.error(res, "An error occurred while fetching CaseType.");
                }

                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, "CaseType found successfully", results[0]);


            });
        } catch (error) {

            return ResponseHelper.error(res, "Unexpected error", error);

        }
    }

    static async getCaseById(req, res) {
        const { CaseID } = req.query; // Get the CaseNumber from query parameters

        // Validate input
        if (!CaseID) {
            return ResponseHelper.error(res, "CaseID is required.");

        }

        try {
            // Call the stored procedure
            const query = "CALL sp_getCaseDetailsByCaseId(?)";
            const params = [CaseID];

            // Execute the query
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.error("SQL Error executing stored procedure:", err);
                        return reject({ sqlError: true, error: err });
                    }
                    resolve(results[0]); // The first result set contains the data
                });
            });

            // Check if any record was found
            if (results.length === 0) {

                return ResponseHelper.error(res, "No case assignment found for CaseNumber");

            }
            // Respond with the case assignment details
            return ResponseHelper.success_reponse(res, " case assignment found for CaseNumber", results);


        } catch (error) {
            if (error.sqlError) {
                // SQL-specific error handling
                return res.status(500).json({
                    status: 1,
                    message: "A database error occurred while processing your request.",
                    error: {
                        sqlState: error.error.sqlState || null,
                        code: error.error.code || null,
                        message: error.error.message || "Unknown SQL error",
                    },
                });
            } else {
                // General error handling
                return ResponseHelper.error(res, "An unexpected error occurred while retrieving the case assignment.");

            }
        }
    }

    // show Refference Details
    static showRefference(req, res) {
        const query = 'CALL sp_showRefference()';  // Replace with your stored procedure name

        try {
            db.query(query, (err, results) => {
                if (err) {
                    return ResponseHelper.error(res, "An unexpected error occurred while retrieving Data.", err);
                }


                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, " case assignment found for CaseNumber", results[0]);


            });

        }
        catch (error) {
            // Handle unexpected errors
            return ResponseHelper.error(res, "An unexpected error occurred.", error);
        }
    }


    // create Case without Doc
    static async createCase(req, res) {
        try {
            console.log("Request Payload:", req.body); // Debugging log

            const {
                CaseNumber,
                EntryUserID,
                CaseDate,
                districtId,
                psId,
                caseTypeId,
                refNumber,
                ipcAct,
                hearingDate,
                bnsNumber
            } = req.body;

            // Validate required input fields
            if (
                !CaseNumber || !EntryUserID || !CaseDate || !districtId || !psId ||
                !caseTypeId || !refNumber || !ipcAct || !hearingDate
            ) {
                console.error("Validation failed: Missing required fields.");
                return ResponseHelper.error(res, "Please enter all required fields.");
            }

            // ✅ Ensure `bnsNumber` is in a valid format (strip invalid characters)
            const validBnsNumber = typeof bnsNumber === "string" ? bnsNumber.replace(/[^\d]/g, "") : bnsNumber;

            // ✅ Define the stored procedure call (matching your SP parameters)
            const query = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const params = [
                CaseNumber,
                CaseDate,
                districtId,
                psId,
                caseTypeId,
                refNumber,
                ipcAct,
                validBnsNumber,
                hearingDate,
                EntryUserID
            ];

            console.log("Executing Stored Procedure with params:", params);

            // Execute the stored procedure
            await new Promise((resolve, reject) => {
                db.query(query, params, (err) => {
                    if (err) {
                        console.error("Error executing stored procedure:", err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            // Fetch the output parameters `CaseID` and `ErrorCode`
            const outputResults = await new Promise((resolve, reject) => {
                db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                    if (outputErr) {
                        console.error("Error fetching output parameters:", outputErr);
                        return reject(outputErr);
                    }
                    resolve(results);
                });
            });

            const { CaseID, ErrorCode } = outputResults[0];

            // Handle stored procedure errors
            if (ErrorCode === 1) {
                return ResponseHelper.error(res, "An error occurred while executing the procedure.");
            }
            if (ErrorCode === 2) {
                return ResponseHelper.error(res, "Case already exists.");
            }
            if (ErrorCode === 3) {
                return ResponseHelper.error(res, "Logged-in user does not have permission to create a case.");
            }

            // Success response
            return res.status(201).json({
                status: 0,
                message: "Case created successfully.",
                data: { CaseID }
            });

        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
        }
    }

    static async createCaseV1(req, res) {
        try {
            console.log("Request Payload:", req.body);

            try {
                validateFields(req.body, [
                    "CaseNumber", "EntryUserID", "CaseDate", "districtId", "psId",
                    "caseTypeId",
                    "filingDate",
                    "petitionName",
                    "hearingDate",
                    "CourtCaseDescription"
                ]);
            } catch (error) {
                return res.status(400).json({ status: 1, message: `${error.message}. ErrorCode: ERR_03` });
            }

            // ✅ Extract fields from request body
            const {
                CaseNumber, EntryUserID, CaseDate, districtId, psId, caseTypeId,
                filingDate, petitionName, hearingDate, CourtCaseDescription,
                refferences = [],
                ipcSections = [] // Expecting array of { bnsId: string|number, otherIpcAct: string, otherBnsAct: string }
            } = req.body;

            // ---> Updated validation for ipcSections structure <---
            if (!Array.isArray(ipcSections) || !ipcSections.every(sec =>
                typeof sec === 'object' && sec !== null &&
                'bnsId' in sec &&
                'otherIpcAct' in sec && // Check for new field
                'otherBnsAct' in sec    // Check for new field
            )) {
                return res.status(400).json({ status: 1, message: "Invalid format for ipcSections. Expected array of objects with bnsId, otherIpcAct, and otherBnsAct. ErrorCode: ERR_IPC_FORMAT_V2" });
            }

            // ✅ Call sp_Createcase to save the case and get CaseID
            const caseQuery = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const caseParams = [
                CaseNumber,
                CaseDate,
                districtId,
                psId,
                caseTypeId,
                filingDate,
                petitionName,
                hearingDate,
                CourtCaseDescription,
                EntryUserID
            ];

            console.log("Executing sp_Createcase with params:", caseParams);

            await new Promise((resolve, reject) => {
                db.query(caseQuery, caseParams, (err) => {
                    if (err) {
                        console.error("Error executing stored procedure:", err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            const caseOutput = await new Promise((resolve, reject) => {
                db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                    if (outputErr) {
                        console.error("Error fetching output parameters:", outputErr);
                        return reject(outputErr);
                    }
                    resolve(results);
                });
            });

            // Basic error handling for Case Creation SP (Example)
            if (!caseOutput || caseOutput.length === 0 || !caseOutput[0].CaseID) {
                console.error("Failed to retrieve CaseID after sp_Createcase call.");
                // Check ErrorCode if available from SP for more specific message
                const spErrorCode = caseOutput && caseOutput.length > 0 ? caseOutput[0].ErrorCode : null;
                if (spErrorCode === 2) {
                    return res.status(409).json({ status: 1, message: "Case already exists.", ErrorCode: "ERR_CASE_EXISTS" });
                }
                return res.status(500).json({ status: 1, message: `Failed to create case (SP ErrorCode: ${spErrorCode || 'N/A'}). ErrorCode: ERR_CASE_ID` });
            }

            const { CaseID } = caseOutput[0];

            console.log("Case created successfully with CaseID:", CaseID);

            // ✅ Save multiple reference numbers
            if (Array.isArray(refferences) && refferences.length > 0) {
                for (const { crmID, refferenceNumber, refferenceyear } of refferences) {
                    console.log("Saving reference:", { crmID, refferenceNumber, refferenceyear });

                    const refQuery = "CALL sp_saveRefferenceNumberByCaseId(?, ?, ?, ?, ?, @ErrorCode)";
                    const refParams = [CaseID, crmID, refferenceNumber, refferenceyear, EntryUserID];

                    // await db.query(refQuery, refParams);

                    await new Promise((resolve, reject) => {
                        db.query(refQuery, refParams, (err) => {
                            if (err) {
                                console.error("Error executing stored procedure:", err);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                }
            }

            // ✅ Save multiple IPC sections
            if (Array.isArray(ipcSections) && ipcSections.length > 0) {
                // Updated query to match the new SP signature
                const ipcQuery = "CALL sp_saveipcsectionBycaseId(?, ?, ?, ?, ?, @ErrorCode)";

                for (const section of ipcSections) {
                    // Destructure all required fields from the frontend object
                    const { bnsId, otherIpcAct, otherBnsAct } = section;

                    // Basic validation for the destructured values
                    if (bnsId === undefined || bnsId === null || otherIpcAct === undefined || otherIpcAct === null || otherBnsAct === undefined || otherBnsAct === null) {
                        console.warn("Skipping invalid IPC/BNS section object:", section);
                        continue; // Skip this iteration
                    }

                    console.log("Saving IPC/BNS section for CaseID:", CaseID, "with bnsId:", bnsId, "OtherIPC:", otherIpcAct, "OtherBNS:", otherBnsAct);

                    // Pass parameters in the correct order for the new SP
                    const ipcParams = [CaseID, bnsId, otherIpcAct, otherBnsAct, EntryUserID];

                    await new Promise((resolve, reject) => {
                        db.query(ipcQuery, ipcParams, (err) => {
                            if (err) {
                                console.error("Error executing sp_saveipcsectionBycaseId:", err);
                                // Decide if you want to stop or just log the error
                                // Consider rejecting if a critical save fails: return reject(err);
                            }
                            resolve(); // Resolve even if one fails, depends on requirement
                        });
                    });
                }
            }

            // ✅ Final success response
            return res.status(201).json({
                status: 0,
                message: "Case created successfully with associated reference numbers and IPC/BNS sections.",
                data: { CaseID }
            });

        } catch (error) {
            console.error("Unexpected error in createCaseV1:", error);
            return res.status(500).json({ status: 1, message: "An unexpected error occurred while processing the request. ErrorCode: ERR_UNEXPECTED" });
        }
    }

    static async createCaseV2(req, res) {
        try {
            const payload = req.body;
            console.log("Request Payload (V2):", payload);

            // ✅ Extract and Default IDs
            // CaseId will be present only during updates. Default to 0 for create.
            const InCaseID = payload.CaseId || 0;
            const {
                CaseNumber, EntryUserID, CaseDate, districtId, psId, caseTypeId,
                filingDate, petitionName, hearingDate, CourtCaseDescription,
                refferences = [], // Expecting { InreffeeenceID?, crmID, refferenceNumber, refferenceyear }
                ipcSections = []  // Expecting { InIpcID?, bnsId, otherIpcAct, otherBnsAct }
            } = payload;

            // ✅ Basic Payload Validation (Add more specific checks as needed)
            try {
                // Validate core fields, adapt if payload structure differs slightly for update vs create
                validateFields({ CaseNumber, EntryUserID, CaseDate, districtId, psId, caseTypeId, filingDate, petitionName, hearingDate, CourtCaseDescription }, [
                    "CaseNumber", "EntryUserID", "CaseDate", "districtId", "psId",
                    "caseTypeId", "filingDate", "petitionName", "hearingDate",
                    "CourtCaseDescription"
                ]);

                // Validate structure of reference and section arrays
                if (!Array.isArray(refferences) || !refferences.every(ref => ref && typeof ref === 'object' && 'crmID' in ref && 'refferenceNumber' in ref && 'refferenceyear' in ref)) {
                    throw new Error("Invalid format for refferences array.");
                }
                if (!Array.isArray(ipcSections) || !ipcSections.every(sec => sec && typeof sec === 'object' && 'bnsId' in sec && 'otherIpcAct' in sec && 'otherBnsAct' in sec)) {
                    throw new Error("Invalid format for ipcSections array.");
                }

            } catch (error) {
                return res.status(400).json({ status: 1, message: `${error.message}. ErrorCode: ERR_VALIDATE_V2` });
            }


            // ✅ 1. Call sp_Createcase_v1 (Handles both create and update based on InCaseID)
            const caseQuery = "CALL sp_Createcase_v1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const caseParams = [
                InCaseID, // 0 for create, actual CaseId for update
                CaseNumber, CaseDate, districtId, psId, caseTypeId,
                filingDate, petitionName, hearingDate, CourtCaseDescription, EntryUserID
            ];

            console.log("Executing sp_Createcase_v1 with params:", caseParams);
            let returnedCaseID; // To store the ID returned by the SP
            let spErrorCode;

            try {
                await new Promise((resolve, reject) => {
                    db.query(caseQuery, caseParams, (err) => {
                        if (err) {
                            console.error("Error executing sp_Createcase_v1:", err);
                            return reject(err); // Reject on SP execution error
                        }
                        resolve();
                    });
                });

                // Fetch output parameters @CaseID and @ErrorCode
                const caseOutput = await new Promise((resolve, reject) => {
                    db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                        if (outputErr) {
                            console.error("Error fetching output parameters from sp_Createcase_v1:", outputErr);
                            return reject(outputErr);
                        }
                        if (!results || results.length === 0) {
                            console.error("No output parameters returned from sp_Createcase_v1.");
                            return reject(new Error("Failed to get output from case creation/update."));
                        }
                        resolve(results[0]); // Resolve with the first row containing @CaseID, @ErrorCode
                    });
                });

                returnedCaseID = caseOutput.CaseID;
                spErrorCode = caseOutput.ErrorCode;

                console.log(`sp_Createcase_v1 Result: CaseID=${returnedCaseID}, ErrorCode=${spErrorCode}`);

                // Handle specific errors returned by the SP
                if (spErrorCode !== 0) { // Assuming 0 means success
                    // Map ErrorCode to a meaningful message if possible
                    throw new Error(`Case ${InCaseID === 0 ? 'creation' : 'update'} failed. SP Error Code: ${spErrorCode}`);
                }
                if (!returnedCaseID) {
                    // This shouldn't happen if ErrorCode is 0, but check just in case
                    throw new Error(`Case ${InCaseID === 0 ? 'creation' : 'update'} succeeded but returned no CaseID.`);
                }

            } catch (dbError) {
                console.error("Database error during case save/update:", dbError);
                // Return a more specific error based on dbError if possible
                return res.status(500).json({ status: 1, message: `Database error during case save/update: ${dbError.message}. ErrorCode: ERR_CASE_SP_V1` });
            }

            const finalCaseId = returnedCaseID; // Use the ID returned by the SP
            console.log(`Case ${InCaseID === 0 ? 'created' : 'updated'} successfully with CaseID:`, finalCaseId);

            // ✅ 2. Save/Update References using sp_saveRefferenceNumberByCaseId_v1
            if (Array.isArray(refferences) && refferences.length > 0) {
                const refQuery = "CALL sp_saveRefferenceNumberByCaseId_v1(?, ?, ?, ?, ?, ?, @reffeeenceID, @ErrorCode)";
                for (const ref of refferences) {
                    const InreffeeenceID = ref.InreffeeenceID || 0; // Default to 0 if not provided (new reference)
                    const { crmID, refferenceNumber, refferenceyear } = ref;

                    // Add validation for ref fields if needed
                    if (crmID === undefined || refferenceNumber === undefined || refferenceyear === undefined) {
                        console.warn("Skipping reference due to missing fields:", ref);
                        continue;
                    }


                    console.log(`Saving/Updating reference for CaseID ${finalCaseId}:`, { InreffeeenceID, crmID, refferenceNumber, refferenceyear });
                    const refParams = [InreffeeenceID, finalCaseId, crmID, refferenceNumber, refferenceyear, EntryUserID];

                    try {
                        await new Promise((resolve, reject) => {
                            db.query(refQuery, refParams, (err) => {
                                if (err) {
                                    console.error(`Error executing sp_saveRefferenceNumberByCaseId_v1 for InreffeeenceID ${InreffeeenceID}:`, err);
                                    // Decide whether to continue or stop on error
                                    // return reject(err); // Uncomment to stop on first reference error
                                }
                                // You might want to fetch and check the @ErrorCode here too
                                resolve();
                            });
                        });
                    } catch (refDbError) {
                        console.error(`Database error saving reference InreffeeenceID ${InreffeeenceID}:`, refDbError);
                        // Handle error - maybe collect errors and report at the end
                    }
                }
            }

            // ✅ 3. Save/Update IPC/BNS Sections using sp_saveipcsectionBycaseId_v1
            if (Array.isArray(ipcSections) && ipcSections.length > 0) {
                const ipcQuery = "CALL sp_saveipcsectionBycaseId_v1(?, ?, ?, ?, ?, ?, @IpcID, @ErrorCode)";
                for (const section of ipcSections) {
                    const InIpcID = section.InIpcID || 0; // Default to 0 if not provided (new section)
                    const { bnsId, otherIpcAct, otherBnsAct } = section;

                    // Add validation for section fields if needed
                    if (bnsId === undefined || otherIpcAct === undefined || otherBnsAct === undefined) {
                        console.warn("Skipping section due to missing fields:", section);
                        continue;
                    }

                    console.log(`Saving/Updating section for CaseID ${finalCaseId}:`, { InIpcID, bnsId, otherIpcAct, otherBnsAct });
                    const ipcParams = [InIpcID, finalCaseId, bnsId, otherIpcAct, otherBnsAct, EntryUserID];

                    try {
                        await new Promise((resolve, reject) => {
                            db.query(ipcQuery, ipcParams, (err) => {
                                if (err) {
                                    console.error(`Error executing sp_saveipcsectionBycaseId_v1 for InIpcID ${InIpcID}:`, err);
                                    // Decide whether to continue or stop on error
                                    // return reject(err); // Uncomment to stop on first section error
                                }
                                // You might want to fetch and check the @ErrorCode here too
                                resolve();
                            });
                        });
                    } catch (ipcDbError) {
                        console.error(`Database error saving section InIpcID ${InIpcID}:`, ipcDbError);
                        // Handle error
                    }
                }
            }

            // ✅ 4. Handle Deletions (IMPORTANT - Requires separate logic/SPs)
            // The current SPs only handle insert/update. You'll need logic here (or on the frontend sending delete requests)
            // to handle sections/references that were present before but are removed during the edit.
            // This typically involves:
            //  a) Frontend sending lists of IDs to keep AND IDs to delete.
            //  b) Or, Backend fetching existing IDs for the case and comparing with the incoming list to determine deletions.
            //  c) Calling separate `sp_deleteReferenceById` / `sp_deleteSectionById` procedures.
            // This part is NOT implemented below but is crucial for a full update functionality.
            console.warn("Deletion logic for removed sections/references is not implemented in createCaseV2.");


            // ✅ Final success response
            return res.status(InCaseID === 0 ? 201 : 200).json({ // 201 for created, 200 for updated
                status: 0,
                message: `Case ${InCaseID === 0 ? 'created' : 'updated'} successfully.`,
                data: { CaseID: finalCaseId } // Return the final CaseID
            });

        } catch (error) { // Catch errors from validation or unhandled SP errors
            console.error(`Unexpected error in ${req.body.CaseId ? 'Update' : 'Create'} Case V2:`, error);
            return res.status(500).json({ status: 1, message: error.message || "An unexpected error occurred.", ErrorCode: "ERR_UNEXPECTED_V2" });
        }
    }

    static async createCaseWithDocument(req, res) {
        try {
            // Destructure data from the request body
            const {
                CaseNumber,
                EntryUserID,
                CaseDate,
                DistrictID,
                psID,
                caseTypeID,
                ref,
                ipcAct,
                bnsNumber,
                hearingDate,
                photocopycaseDiaryExist
            } = req.body;

            // Validate required fields
            if (
                !CaseNumber || !EntryUserID || !CaseDate || !DistrictID || !psID || !caseTypeID ||
                !ref || !ipcAct || !bnsNumber || !hearingDate || photocopycaseDiaryExist === undefined
            ) {
                return res.status(400).json({ error: 'All required fields must be provided' });
            }

            // Retrieve uploaded file path
            const caseDocumentPath = req.file ? req.file.path : null;

            // Stored procedure call
            const query = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const params = [
                CaseNumber,
                CaseDate,
                DistrictID,
                psID,
                caseTypeID,
                ref,
                ipcAct,
                bnsNumber,
                hearingDate,
                photocopycaseDiaryExist,
                caseDocumentPath,
                EntryUserID
            ];

            // Execute stored procedure
            await new Promise((resolve, reject) => {
                db.query(query, params, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            // Fetch output parameters (CaseID and ErrorCode)
            const outputResults = await new Promise((resolve, reject) => {
                db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const { CaseID, ErrorCode } = outputResults[0];

            // Handle possible error codes
            if (ErrorCode === 1) return res.status(400).json({ status: 1, error: 'Procedure execution error' });
            if (ErrorCode === 2) return res.status(400).json({ status: 1, message: 'Case already exists' });
            if (ErrorCode === 3) return res.status(400).json({ status: 1, message: 'User lacks permission to create case' });

            // Return success response
            return res.status(201).json({
                status: 0,
                message: 'Case created successfully',
                data: { CaseID }
            });
        } catch (error) {
            // Handle unexpected errors
            return res.status(500).json({
                status: 1,
                message: 'An error occurred while creating the case',
                error: error.message
            });
        }
    }


    static async createCaseDetail(req, res) {
        try {
            // Destructure data from the request body
            const {
                CaseNumber,
                CaseDescription,
                CaseId,
                EntryUserID,
                CaseDate,
                DistrictID,
                psID,
                caseTypeID,
                nexthearingDate,
                requiredDocument,
                additionalRemarks
            } = req.body;

            // Validate required fields
            if (
                !CaseNumber || !EntryUserID || !CaseDate || !DistrictID || !psID || !caseTypeID ||
                !nexthearingDate) {
                return res.status(400).json({ error: 'All required fields must be provided' });
            }

            // Retrieve uploaded file path
            const caseuploadDocumentPath = req.file ? req.file.path : null;

            // Stored procedure call
            const query = "CALL sp_updateCaseDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseSummaryID, @ErrorCode)";
            const params = [
                CaseNumber,
                CaseDescription,
                CaseId,
                EntryUserID,
                CaseDate,
                DistrictID,
                psID,
                caseTypeID,
                nexthearingDate,
                requiredDocument,
                caseuploadDocumentPath,
                additionalRemarks
            ];

            // Execute stored procedure
            await new Promise((resolve, reject) => {
                db.query(query, params, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            // Fetch output parameters (CaseID and ErrorCode)
            const outputResults = await new Promise((resolve, reject) => {
                db.query("SELECT @CaseSummaryID AS CaseSummaryID, @ErrorCode AS ErrorCode", (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const { CaseSummaryID, ErrorCode } = outputResults[0];

            // Handle possible error codes
            if (ErrorCode === 1) return res.status(400).json({ status: 1, error: 'Procedure execution error' });
            if (ErrorCode === 2) return res.status(400).json({ status: 1, message: 'Case already exists' });
            if (ErrorCode === 3) return res.status(400).json({ status: 1, message: 'User lacks permission to create case' });

            // Return success response
            return res.status(201).json({
                status: 0,
                message: 'Case Detils update successfully',
                data: { CaseSummaryID }
            });
        } catch (error) {
            // Handle unexpected errors
            return res.status(500).json({
                status: 1,
                message: 'An error occurred while creating the case',
                error: error.message
            });
        }
    }

    static async showCaseDetail(req, res) {
        try {
            // Extract is_Assigned parameter from the request body
            const { CaseID } = req.body;

            // Stored procedure query and parameters
            const query = "CALL sp_ShowCaseDetailSummaryById(?)";
            const params = [CaseID];

            // Execute the stored procedure
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            // Process the results
            const casesDetail = results[0]; // The first result set contains the data

            if (!casesDetail || casesDetail.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No cases found.",
                });
            }

            // Format the cases for response
            const formattedCases = casesDetail.map((caseItem) => ({
                CaseNumber: caseItem.CaseNumber,
                CaseDescription: caseItem.CaseDescription,
                CaseRequiredDocument: caseItem.CaseRequiredDocument,
                SPName: caseItem.SPName,
                PSName: caseItem.PSName,
                CaseDate: caseItem.CaseDate,
                CaseType: caseItem.CaseType,
                NextHearingDate: caseItem.NextHearingDate,
                CaseSummaryId: caseItem.CaseSummaryId,
                Remarks: caseItem.Remarks,
                Document: caseItem?.Document ? `${basePath}${caseItem?.Document}` : null,
            }));

            return res.status(200).json({
                success: 0,
                data: formattedCases,
            });

        } catch (error) {
            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                error: "Unexpected error occurred.",
                details: error.message,
            });
        }
    }

    // show all case with out Doc
    static async showallCase(req, res) {
        try {

            const is_Assigned = req.query.is_Assigned;



            // SQL query to call the stored procedure 
            const query = 'CALL sp_ShowallCase(?)';


            db.query(query, [is_Assigned], (err, results) => {
                if (err) {

                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }

                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, "Data found", results[0]);
            });
        } catch (error) {

            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }

    // show all case with  Doc  

    static async showallCaseWithDOC(req, res) {
        try {
            // Extract is_Assigned parameter from the request body
            const { is_Assigned } = req.body;

            // Stored procedure query and parameters
            const query = "CALL sp_ShowallCasev1(?)";
            const params = [is_Assigned];

            // Execute the stored procedure
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            // Process the results
            const cases = results[0]; // The first result set contains the data

            // Handle logic based on is_Assigned
            if (is_Assigned === null || is_Assigned === undefined) {
                // When is_Assigned is NULL: Return the total number of cases
                const totalCaseCount = cases[0]?.TotalCases || 0; // TotalCases is returned from the stored procedure
                return res.status(200).json({
                    success: true,
                    TotalCaseCount: totalCaseCount,
                });
            } else {
                // When is_Assigned is 1 or 0: Return the cases along with the total count
                if (!cases || cases.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "No cases found.",
                    });
                }

                // Extract TotalCaseCount from the first case
                const { TotalCaseCount } = cases[0];

                // Format the cases for response
                const formattedCases = cases.map((caseItem) => ({
                    PPuserName: caseItem.PPuserName,
                    CaseNumber: caseItem.CaseNumber,
                    SpName: caseItem.SpName,
                    PsName: caseItem.PsName,
                    CaseDate: caseItem.CaseDate,
                    CaseType: caseItem.CaseType,
                    CaseHearingDate: caseItem.CaseHearingDate,
                    IPCSection: caseItem.IPCSection,
                    ReferenceNumber: caseItem.ReferenceNumber,
                    CaseId: caseItem.CaseId,
                    BeginReferenceName: caseItem.BeginReferenceName,
                    IsAssigned: caseItem.IsAssigned,
                    Document: caseItem?.Document ? `${basePath}${caseItem?.Document}` : null,
                }));

                return res.status(200).json({
                    success: true,
                    TotalCaseCount, // Include the total count once
                    data: formattedCases,
                });
            }
        } catch (error) {
            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                error: "Unexpected error occurred.",
                details: error.message,
            });
        }
    }


    // static async showallCaseBetweenRange(req, res) {
    //     try {
    //         const { startDate, endDate, isAssign } = req.body;



    //         // SQL query to call the stored procedure
    //         const query = 'CALL sp_ShowallCaseBetweenRange(?, ?,?)';

    //         db.query(query, [startDate, endDate, isAssign], (err, results) => {
    //             if (err) {
    //                 console.error("Error executing stored procedure:", err);
    //                 return ResponseHelper.error(res, "An error occurred while fetching data");
    //             }

    //             // Assuming your stored procedure returns data in results[0]
    //             return ResponseHelper.success_reponse(res, "Data found", results[0]);
    //         });
    //     } catch (error) {
    //         console.error("Unexpected error:", error);
    //         return ResponseHelper.error(res, "An unexpected error occurred", error);
    //     }
    // }

    static async showallCaseBetweenRange(req, res) {
        try {
            const { startDate, endDate, isAssign, EntryUserID } = req.body;

            const mainQuery = "CALL sp_ShowallCaseBetweenRange(?, ?, ?, ?)";
            const mainParams = [startDate, endDate, isAssign, EntryUserID];

            // Step 1: Fetch all cases
            const [caseResults] = await new Promise((resolve, reject) => {
                db.query(mainQuery, mainParams, (err, results) => {
                    if (err) {
                        console.error("Error executing sp_ShowallCaseBetweenRange:", err);
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            // Step 2: For each case, fetch its references and IPC sections
            const enrichedCases = await Promise.all(
                caseResults.map(async (caseItem) => {
                    const { CaseId, UserId } = caseItem;

                    // Fetch references
                    const references = await new Promise((resolve, reject) => {
                        db.query("CALL sp_getRefferenceNumberByCaseId(?, ?)", [CaseId, UserId], (err, results) => {
                            if (err) return reject(err);
                            resolve(results[0]);
                        });
                    });

                    // Fetch IPC sections
                    const ipcSections = await new Promise((resolve, reject) => {
                        db.query("CALL sp_getIpcSectionByCaseId(?, ?)", [CaseId, UserId], (err, results) => {
                            if (err) return reject(err);
                            resolve(results[0]);
                        });
                    });

                    return {
                        ...caseItem,
                        references,
                        ipcSections
                    };
                })
            );

            return ResponseHelper.success_reponse(res, "Data found", enrichedCases);
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }

    static async getDashboardCounts(req, res) {
        try {
            const { EntryuserID } = req.body;

            // Validate input
            if (!EntryuserID) {
                return ResponseHelper.error(res, "EntryuserID is required");
            }

            // Call the stored procedure
            const query = 'CALL sp_DashBoardCount_V1(?)';

            db.query(query, [EntryuserID], (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }

                // The SP returns data in results[0], typically an array of rows
                const caseData = results[0];

                // Initialize counts
                let unassignedCases = 0;
                let assignedCases = 0;
                let totalCases = 0;

                // Check if we got at least one row from the SP
                if (!caseData || !caseData.length) {
                    // Handle the case where the stored procedure returns no data.
                    //  This is important, as the SP might return an empty result set
                    //  in some scenarios.  Return 0 for all counts.
                    const response = {
                        unassignedCases: 0,
                        assignedCases: 0,
                        totalCases: 0
                    };
                    return ResponseHelper.success_reponse(
                        res,
                        "No data returned from sp_DashBoardCount_V1",
                        response
                    );
                }

                // The SP now returns a single row with the counts.  Access the properties directly.
                const spRow = caseData[0];  // Get the first (and only) row.

                // Extract the counts from the row.  Use 0 as a default in case any value is null.
                unassignedCases = spRow.TotalUnassignedCase || 0;
                assignedCases = spRow.TotalAssignedCase || 0;
                totalCases = spRow.TotalCases || 0;


                // Prepare the final response
                const response = {
                    unassignedCases,
                    assignedCases,
                    totalCases
                };

                // Send the response
                return ResponseHelper.success_reponse(
                    res,
                    "Counts retrieved successfully",
                    response
                );
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }


    static async addCaseDocuments(req, res) {
        try {
            console.log("🔥 Received Request Body:", req.body);
            console.log("🔥 Received Files:", req.files);

            const { CaseID, EntryUserID } = req.body;
            const files = req.files; // ✅ Extract files from request

            // ✅ Validate input fields
            if (!CaseID || !EntryUserID || !files || files.length === 0) {
                return ResponseHelper.error(res, "Invalid input: Provide CaseID, EntryUserID, and at least one document.");
            }

            for (const file of files) {
                const filePath = `/uploads/${file.filename}`; // Simulate file storage path

                console.log("✅ Saving document:", filePath); // Debugging

                const query = "CALL sp_createcaseDocument(?, ?, ?, @ErrorCode)";
                const params = [CaseID, filePath, EntryUserID];

                // ✅ Execute the stored procedure
                await new Promise((resolve, reject) => {
                    db.query(query, params, (err) => {
                        if (err) {
                            console.error("❌ Error executing stored procedure:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                });

                // ✅ Fetch the output parameter `ErrorCode`
                const outputResults = await new Promise((resolve, reject) => {
                    db.query("SELECT @ErrorCode AS ErrorCode", (outputErr, results) => {
                        if (outputErr) {
                            console.error("❌ Error fetching output parameters:", outputErr);
                            return reject(outputErr);
                        }
                        resolve(results);
                    });
                });

                const { ErrorCode } = outputResults[0];

                // ✅ Handle stored procedure errors
                if (ErrorCode === 1) {
                    return ResponseHelper.error(res, "An error occurred while executing the procedure.");
                }
                if (ErrorCode === 3) {
                    return ResponseHelper.error(res, "Logged-in user does not have permission to add case documents.");
                }
            }

            // ✅ Success response
            return res.status(201).json({
                status: 0,
                message: "All case documents added successfully.",
            });

        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
        }
    }


    static async getCaseDocuments(req, res) {
        try {
            console.log("🔥 Request Params:", req.body); // Debugging

            const { caseId } = req.body;

            // ✅ Validate required input
            if (!caseId) {
                console.error("❌ Validation failed: Missing caseId.");
                return ResponseHelper.error(res, "Please provide a valid caseId.");
            }

            // ✅ Define the stored procedure call
            const query = "CALL sp_getDocumentlistByCaseId(?)";
            const params = [caseId];

            console.log("🛠️ Executing Stored Procedure with params:", params);

            // ✅ Execute the stored procedure
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, result) => {
                    if (err) {
                        console.error("❌ Error executing stored procedure:", err);
                        return reject(err);
                    }
                    resolve(result[0]); // ✅ First array contains result set
                });
            });

            // ✅ Check if any documents are found
            if (!results || results.length === 0) {
                return ResponseHelper.error(res, "No documents found for the given caseId.");
            }

            // ✅ Success response
            return res.status(200).json({
                status: 0,
                message: "Case documents retrieved successfully.",
                data: results
            });

        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
        }
    }

    static async getCrmListByCaseId(req, res) {
        try {
            console.log("🔥 Request Params:", req.body); // Debugging

            const { caseId } = req.body;

            // ✅ Validate required input fields
            if (!caseId) {
                return res.status(400).json({
                    status: 1,
                    message: "caseId is required.",
                });
            }

            // ✅ Call stored procedure
            const query = "CALL sp_getCrmListByCaseId(?)";
            db.query(query, [caseId], (err, results) => {
                if (err) {
                    console.error("❌ Error executing stored procedure:", err);
                    return res.status(500).json({
                        status: 1,
                        message: "Error retrieving CRM list.",
                    });
                }

                // ✅ Extract result set
                const crmList = results[0];

                if (!crmList || crmList.length === 0) {
                    return res.status(404).json({
                        status: 1,
                        message: "No CRM records found for the given caseId.",
                    });
                }

                // ✅ Respond with success
                return res.status(200).json({
                    status: 0,
                    message: "CRM list retrieved successfully.",
                    data: crmList,
                });
            });

        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return res.status(500).json({
                status: 1,
                message: "An unexpected error occurred.",
                error: error.message,
            });
        }
    }

    static async showRefferenceNumberByCaseId(req, res) {
        try {
            const { CaseId, EntryUserID } = req.body;

            // console.log(req.body);
            if (!CaseId) {
                return ResponseHelper.error(res, "CaseId is required in the request body");
            }
            if (!EntryUserID) {
                return ResponseHelper.error(res, "EntryUserID is required in the request body");
            }

            const [results] = await db.promise().query('CALL sp_getRefferenceNumberByCaseId( ?, ?)', [CaseId, EntryUserID]);

            if (!results || results.length === 0) {
                return ResponseHelper.success_reponse(res, "No Data found", []);
            }

            return ResponseHelper.success_reponse(res, "Data found", results[0]);
        } catch (error) {
            console.error('Error in showRefferenceNumberByCaseId:', error);
            return ResponseHelper.error(res, "An error occurred while fetching data");
        }
    }

    static async showSectionsByCaseId(req, res) {
        try {
            const { CaseId, UserId } = req.body;

            // console.log(req.body);
            if (!CaseId) {
                return ResponseHelper.error(res, "CaseId is required in the request body");
            }
            if (!UserId) {
                return ResponseHelper.error(res, "UserId is required in the request body");
            }

            const [results] = await db.promise().query('CALL sp_getIpcSectionByCaseId( ?, ?)', [CaseId, UserId]);

            if (!results || results.length === 0) {
                return ResponseHelper.success_reponse(res, "No Data found", []);
            }

            return ResponseHelper.success_reponse(res, "Data found", results[0]);
        } catch (error) {
            console.error('Error in showSectionsByCaseId:', error);
            return ResponseHelper.error(res, "An error occurred while fetching data");
        }
    }

    static async saveCrr(req, res) {
        try {
            console.log("Request Payload (saveCrr):", req.body);

            const {
                crmID,              // Reference Type ID
                caseTypeID,         // CRR Case Type ID
                filingDate,
                petitionName,
                hearingDate,
                CourtCaseDescription,
                refferenceNumber,   // Reference Number for the selected type
                refferenceyear,     // Reference Year for the selected type
                EntryUserID,
                ipcSections = [],
            } = req.body;

            try {
                validateFields({
                    crmID, caseTypeID, filingDate, petitionName, hearingDate,
                    CourtCaseDescription, refferenceNumber, refferenceyear, EntryUserID
                }, [
                    // List required fields from the frontend payload
                    "crmID", "caseTypeID", "filingDate", "petitionName", "hearingDate",
                    "CourtCaseDescription", "refferenceNumber", "refferenceyear", "EntryUserID"
                ]);

                // Validate structure of IPC sections array
                if (!Array.isArray(ipcSections) || !ipcSections.every(sec =>
                    typeof sec === 'object' && sec !== null &&
                    'bnsId' in sec &&
                    'otherIpcAct' in sec &&
                    'otherBnsAct' in sec
                )) {
                    throw new Error("Invalid format for ipcSections array.");
                }
                // Add validation: At least one section must be provided
                if (ipcSections.length === 0) {
                    throw new Error("At least one IPC/BNS section must be added.");
                }

            } catch (error) {
                return res.status(400).json({ status: 1, message: `${error.message}. ErrorCode: ERR_CRR_VALIDATE` });
            }

            const IncaseID = 0;
            const InreffeeenceID = 0;

            // ✅ Call sp_saveCRR to save the crr and get reffeeenceID, caseID
            const crrQuery = "CALL sp_saveCRR(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @reffeeenceID, @caseID, @Errorcode)";
            const crrParams = [
                IncaseID,           // Always 0 for new CRR
                InreffeeenceID,     // Always 0 for new CRR reference
                crmID,
                caseTypeID,
                filingDate,
                petitionName,
                hearingDate,
                CourtCaseDescription,
                refferenceNumber,
                refferenceyear,
                EntryUserID
            ];

            console.log("Executing sp_saveCRR with params:", crrParams);

            // let crrOutput;

            await new Promise((resolve, reject) => {
                db.query(crrQuery, crrParams, (err) => {
                    if (err) {
                        console.error("Error executing sp_saveCRR:", err);
                        return reject(new Error(`Database error executing sp_saveCRR: ${err.message || err.code}`));
                    }
                    resolve();
                });
            });

            const crrOutput = await new Promise((resolve, reject) => {
                // Select @reffeeenceID aliased as CrrID
                db.query("SELECT @reffeeenceID AS CrrID, @caseID AS CaseID, @Errorcode AS ErrorCode", (outputErr, results) => {
                    if (outputErr) {
                        console.error("Error fetching output parameters from sp_saveCRR:", outputErr);
                        return reject(new Error(`Database error fetching SP output: ${outputErr.message || outputErr.code}`));
                    }
                    if (!results || results.length === 0) {
                        console.error("No output parameters returned from sp_saveCRR.");
                        return reject(new Error("Failed to get output from CRR creation."));
                    }
                    resolve(results[0]);
                });
            });

            const { CrrID, CaseID, ErrorCode } = crrOutput;

            console.log(`sp_saveCRR Result: CrrID=${CrrID}, CaseID=${CaseID}, ErrorCode=${ErrorCode}`);

            if (ErrorCode === 2) {
                return res.status(409).json({ status: 1, message: "CRR already exists.", ErrorCode: "ERR_CASE_EXISTS" });
            }

            if (ErrorCode !== 0) {
                throw new Error(`CRR creation failed. SP Error Code: ${ErrorCode}`);
            }
            if (CrrID === undefined || CrrID === null) { throw new Error("CRR creation succeeded but failed to return the CRR ID."); }
            if (CaseID === undefined || CaseID === null) { throw new Error("CRR creation succeeded but failed to return the associated Case ID."); }

            const ipcQuery = "CALL sp_saveipcsectionBycaseId(?, ?, ?, ?, ?, ?, @IpcID, @ErrorCode)";
            for (const section of ipcSections) {
                const InIpcID = 0;
                const { bnsId, otherIpcAct, otherBnsAct } = section;

                if (bnsId === undefined || otherIpcAct === undefined || otherBnsAct === undefined) {
                    console.warn("Skipping section due to missing fields:", section);
                    continue;
                }

                console.log(`Saving section for CaseID ${CaseID}:`, { InIpcID, bnsId, otherIpcAct, otherBnsAct });
                const ipcParams = [InIpcID, CaseID, bnsId, otherIpcAct, otherBnsAct, EntryUserID];

                try {
                    await new Promise((resolve, reject) => {
                        db.query(ipcQuery, ipcParams, (err) => {
                            if (err) {
                                console.error(`Error executing sp_saveipcsectionBycaseId for CaseID ${CaseID}, BnsID ${bnsId}:`, err);
                            }
                            resolve();
                        });
                    });
                } catch (ipcDbError) {
                    console.error(`Database error saving section for CaseID ${CaseID}:`, ipcDbError);
                }
            }

            console.log(`Document upload logic would be triggered here for CaseID: ${CaseID}`);

            return res.status(201).json({
                status: 0,
                message: "CRR and associated sections created successfully.",
                data: { CrrID, CaseID }
            });

        } catch (error) {
            console.error("Unexpected error in saveCrr:", error);
            return res.status(500).json({
                status: 1,
                message: error.message || "An unexpected error occurred while processing the request.",
                ErrorCode: "ERR_CRR_UNEXPECTED"
            });
        }
    }

    static async saveCran(req, res) {
        try {
            console.log("Request Payload (saveCran):", req.body);

            const InccnId = "0" || req.body.InccnId;
            const {
                caseId,              // Reference Type ID
                refferenceId,         // CRR Case Type ID
                cranNumber,
                cranYear,
                EntryUserID,
            } = req.body;

            try {
                validateFields({
                    caseId, refferenceId, cranNumber, cranYear, EntryUserID
                }, [
                    // List required fields from the frontend payload
                    "caseId", "refferenceId", "cranNumber", "cranYear", "EntryUserID"
                ]);

            } catch (error) {
                return res.status(400).json({ status: 1, message: `${error.message}. ErrorCode: ERR_CRR_VALIDATE` });
            }

            // ✅ Call sp_saveCRR to save the crr and get reffeeenceID, caseID
            const cranQuery = "CALL sp_saveCranNumber(?, ?, ?, ?, ?, ?, @ccnId, @ErrorCode)";
            const cranParams = [
                InccnId,           // Always 0 for new Cran
                caseId,
                refferenceId,
                cranNumber,
                cranYear,
                EntryUserID
            ];

            console.log("Executing sp_saveCranNumber with params:", cranParams);

            await new Promise((resolve, reject) => {
                db.query(cranQuery, cranParams, (err) => {
                    if (err) {
                        console.error("Error executing sp_saveCranNumber:", err);
                        return reject(new Error(`Database error executing sp_saveCranNumber: ${err.message || err.code}`));
                    }
                    resolve();
                });
            });

            const cranOutput = await new Promise((resolve, reject) => {
                db.query("SELECT @ccnId AS CranID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                    if (outputErr) {
                        console.error("Error fetching output parameters from sp_saveCranNumber:", outputErr);
                        return reject(new Error(`Database error fetching SP output: ${outputErr.message || outputErr.code}`));
                    }
                    if (!results || results.length === 0) {
                        console.error("No output parameters returned from sp_saveCranNumber.");
                        return reject(new Error("Failed to get output from Cran creation."));
                    }
                    resolve(results[0]);
                });
            });

            const { CranID, ErrorCode } = cranOutput;

            console.log(`sp_saveCRR Result: ErrorCode=${ErrorCode}`);

            if (ErrorCode === 2) {
                return res.status(409).json({ status: 1, message: "CRan already exists.", ErrorCode: "ERR_CRAN_EXISTS" });
            }

            if (ErrorCode !== 0) {
                throw new Error(`Cran creation failed. SP Error Code: ${ErrorCode}`);
            }
            if (CranID === undefined || CranID === null) { throw new Error("Cran creation succeeded but failed to return the Cran ID."); }

            // console.log(`Document upload logic would be triggered here for CranID: ${CranID}`);

            return res.status(201).json({
                status: 0,
                message: "Cran created successfully.",
                data: { CranID }
            });

        } catch (error) {
            console.error("Unexpected error in saveCran:", error);
            return res.status(500).json({
                status: 1,
                message: error.message || "An unexpected error occurred while processing the request.",
                ErrorCode: "ERR_CRAN_UNEXPECTED"
            });
        }
    }

    static async showallCaseBetweenRangeV2(req, res) {
        try {
            const { startDate = null, endDate = null, isAssign = 2, EntryUserID, p_ps_id = null, p_district_id = null, p_case_number = "" } = req.body;

            const mainQuery = "CALL sp_ShowallCaseBetweenRange_v2(?, ?, ?, ?, ?, ?, ?)";
            const mainParams = [startDate, endDate, isAssign, EntryUserID, p_ps_id, p_district_id, p_case_number];

            // Step 1: Fetch all cases
            const [caseResults] = await new Promise((resolve, reject) => {
                db.query(mainQuery, mainParams, (err, results) => {
                    if (err) {
                        console.error("Error executing sp_ShowallCaseBetweenRange_v2:", err);
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            // Step 2: For each case, fetch its references and IPC sections
            // const enrichedCases = await Promise.all(
            //     caseResults.map(async (caseItem) => {
            //         const { CaseId, UserId } = caseItem;

            //         // Fetch references
            //         const references = await new Promise((resolve, reject) => {
            //             db.query("CALL sp_getRefferenceNumberByCaseId(?, ?)", [CaseId, UserId], (err, results) => {
            //                 if (err) return reject(err);
            //                 resolve(results[0]);
            //             });
            //         });

            //         // Fetch IPC sections
            //         const ipcSections = await new Promise((resolve, reject) => {
            //             db.query("CALL sp_getIpcSectionByCaseId(?, ?)", [CaseId, UserId], (err, results) => {
            //                 if (err) return reject(err);
            //                 resolve(results[0]);
            //             });
            //         });

            //         return {
            //             ...caseItem,
            //             references,
            //             ipcSections
            //         };
            //     })
            // );

            return ResponseHelper.success_reponse(res, "Data found", caseResults);
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }

    static async showallCaseBetweenRangeV3(req, res) {
        try {
            const { startDate, endDate, isAssign, EntryUserID } = req.body;

            const mainQuery = "CALL sp_ShowallCaseBetweenRange(?, ?, ?, ?)";
            const mainParams = [startDate, endDate, isAssign, EntryUserID];

            // Step 1: Fetch all cases
            const [caseResults] = await new Promise((resolve, reject) => {
                db.query(mainQuery, mainParams, (err, results) => {
                    if (err) {
                        console.error("Error executing sp_ShowallCaseBetweenRange:", err);
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            // Step 2: For each case, fetch its references and IPC sections
            const enrichedCases = await Promise.all(
                caseResults.map(async (caseItem) => {
                    const { CaseId, UserId } = caseItem;

                    // Fetch references
                    const references = await new Promise((resolve, reject) => {
                        db.query("CALL sp_getReferenceNumberByCaseId_v1(?, ?)", [CaseId, UserId], (err, results) => {
                            if (err) return reject(err);
                            resolve(results[0]);
                        });
                    });

                    // Fetch IPC sections
                    const ipcSections = await new Promise((resolve, reject) => {
                        db.query("CALL sp_getIpcSectionByCaseId_v1(?, ?)", [CaseId, UserId], (err, results) => {
                            if (err) return reject(err);
                            resolve(results[0]);
                        });
                    });

                    return {
                        ...caseItem,
                        references,
                        ipcSections
                    };
                })
            );

            return ResponseHelper.success_reponse(res, "Data found", enrichedCases);
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }

    static async createCaseV3(req, res) {
        try {
            const payload = req.body;
            console.log("Request Payload (V3):", payload);

            const InCaseID = payload.CaseId || 0;
            const {
                caseNumber, CaseDate, districtId, psId, caseTypeId,
                filingDate, petitionName, hearingDate, CourtCaseDescription,
                EntryUserID, crmID, refferenceNumber, refferenceyear,
                removedSections = [],
                ipcSections = []  // Expecting { bnsId, otherIpcAct, otherBnsAct }
            } = payload;

            // ✅ Basic Payload Validation (Add more specific checks as needed)
            try {
                // Validate core fields, adapt if payload structure differs slightly for update vs create
                validateFields({ caseNumber, EntryUserID, CaseDate, districtId, psId, caseTypeId, filingDate, petitionName, hearingDate, CourtCaseDescription, crmID, refferenceNumber, refferenceyear }, [
                    "caseNumber", "EntryUserID", "CaseDate", "districtId", "psId",
                    "caseTypeId", "filingDate", "petitionName", "hearingDate",
                    "CourtCaseDescription", "crmID", "refferenceNumber", "refferenceyear",
                ]);

                if (!Array.isArray(ipcSections) || !ipcSections.every(sec => sec && typeof sec === 'object' && 'bnsId' in sec && 'otherIpcAct' in sec && 'otherBnsAct' in sec)) {
                    throw new Error("Invalid format for ipcSections array.");
                }

            } catch (error) {
                return res.status(400).json({ status: 1, message: `${error.message}. ErrorCode: ERR_VALIDATE_V3` });
            }


            // ✅ 1. Call sp_Createcase_v1 (Handles both create and update based on InCaseID)
            const caseQuery = "CALL sp_Createcase_v4(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode, @Out_crmID)";
            const caseParams = [
                InCaseID, // 0 for create, actual CaseId for update
                caseNumber, CaseDate, districtId, psId, caseTypeId,
                filingDate, petitionName, hearingDate, CourtCaseDescription,
                EntryUserID, crmID, refferenceNumber, refferenceyear,
            ];

            console.log("Executing sp_Createcase_v4 with params:", caseParams);
            let returnedCaseID;
            let spErrorCode;
            let returnedCrmID;

            try {
                await new Promise((resolve, reject) => {
                    db.query(caseQuery, caseParams, (err) => {
                        if (err) {
                            console.error("Error executing sp_Createcase_v4:", err);
                            return reject(err); // Reject on SP execution error
                        }
                        resolve();
                    });
                });

                // Fetch output parameters @CaseID and @ErrorCode
                const caseOutput = await new Promise((resolve, reject) => {
                    db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode, @Out_crmID AS CrmID", (outputErr, results) => {
                        if (outputErr) {
                            console.error("Error fetching output parameters from sp_Createcase_v4:", outputErr);
                            return reject(outputErr);
                        }
                        if (!results || results.length === 0) {
                            console.error("No output parameters returned from sp_Createcase_v4.");
                            return reject(new Error("Failed to get output from case creation/update."));
                        }
                        resolve(results[0]); // Resolve with the first row containing @CaseID, @ErrorCode
                    });
                });

                returnedCaseID = caseOutput.CaseID;
                spErrorCode = caseOutput.ErrorCode;
                returnedCrmID = caseOutput.CrmID;

                console.log(`sp_Createcase_v4 Result: CaseID=${returnedCaseID}, ErrorCode=${spErrorCode}, CrmID=${returnedCrmID}`);

                // Handle specific errors returned by the SP
                if (spErrorCode !== 0) { // 0 means success
                    // Map ErrorCode to a meaningful message if possible
                    throw new Error(`Case ${InCaseID === 0 ? 'creation' : 'update'} failed. SP Error Code: ${spErrorCode}`);
                }
                if (!returnedCaseID) {
                    // This shouldn't happen if ErrorCode is 0, but check just in case
                    throw new Error(`Case ${InCaseID === 0 ? 'creation' : 'update'} succeeded but returned no CaseID.`);
                }

            } catch (dbError) {
                console.error("Database error during case save/update:", dbError);
                // Return a more specific error based on dbError if possible
                return res.status(500).json({ status: 1, message: `Database error during case save/update: ${dbError.message}. ErrorCode: ERR_CASE_SP_V1` });
            }

            const finalCaseId = returnedCaseID; // Use the ID returned by the SP
            const finalCrmId = returnedCrmID;
            console.log(`Case ${InCaseID === 0 ? 'created' : 'updated'} successfully with CaseID:`, finalCaseId);

            // ✅ 2. Handle Deletions for IPC sections
            if (Array.isArray(removedSections) && removedSections.length > 0) {
                const deleteQuery = "CALL sp_deleteIpcSectionById(?, ?, @ErrorCode)";

                for (const cisId of removedSections) {
                    if (!cisId || isNaN(cisId)) {
                        console.warn("Skipping invalid CisID in removedSections:", cisId);
                        continue;
                    }

                    console.log(`Deleting IPC Section with CisID: ${cisId}`);

                    await new Promise((resolve, reject) => {
                        db.query(deleteQuery, [cisId, EntryUserID], (err) => {
                            if (err) {
                                console.error(`Error executing sp_deleteIpcSectionById for CisID ${cisId}:`, err);
                                // Optional: reject if deletions are critical
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                }
            }

            // ✅ 3. Save/Update IPC/BNS Sections using sp_saveipcsectionBycaseId_v1

            if (Array.isArray(ipcSections) && ipcSections.length > 0) {
                // Updated query to match the new SP signature
                const ipcQuery = "CALL sp_saveipcsectionBycaseId(?, ?, ?, ?, ?, @ErrorCode)";

                for (const section of ipcSections) {
                    // Destructure all required fields from the frontend object
                    const { bnsId, otherIpcAct, otherBnsAct } = section;

                    // Basic validation for the destructured values
                    if (bnsId === undefined || bnsId === null || otherIpcAct === undefined || otherIpcAct === null || otherBnsAct === undefined || otherBnsAct === null) {
                        console.warn("Skipping invalid IPC/BNS section object:", section);
                        continue; // Skip this iteration
                    }

                    console.log("Saving IPC/BNS section for CaseID:", finalCaseId, "with bnsId:", bnsId, "OtherIPC:", otherIpcAct, "OtherBNS:", otherBnsAct);

                    // Pass parameters in the correct order for the new SP
                    const ipcParams = [finalCaseId, bnsId, otherIpcAct, otherBnsAct, EntryUserID];

                    await new Promise((resolve, reject) => {
                        db.query(ipcQuery, ipcParams, (err) => {
                            if (err) {
                                console.error("Error executing sp_saveipcsectionBycaseId:", err);
                                // Decide if you want to stop or just log the error
                                // Consider rejecting if a critical save fails: return reject(err);
                            }
                            resolve(); // Resolve even if one fails, depends on requirement
                        });
                    });
                }
            }


            // ✅ Final success response
            return res.status(InCaseID === 0 ? 201 : 200).json({ // 201 for created, 200 for updated
                status: 0,
                message: `Case ${InCaseID === 0 ? 'created' : 'updated'} successfully.`,
                data: { CaseID: finalCaseId, CrmID: finalCrmId }
            });

        } catch (error) { // Catch errors from validation or unhandled SP errors
            console.error(`Unexpected error in ${req.body.CaseId ? 'Update' : 'Create'} Case V3:`, error);
            return res.status(500).json({ status: 1, message: error.message || "An unexpected error occurred.", ErrorCode: "ERR_UNEXPECTED_V3" });
        }
    }

    static async getCaseSearchByParam(req, res) {
        try {
            function emptyToNull(val) {
                return val === '' ? null : val;
            }
            let {
                SearchType,
                CaseNumber,
            } = req.body;

            function emptyToZero(val) {
                return val === '' ? '0' : val;
            }

            let CaseDate = emptyToNull(req.body.CaseDate);
            let RefferenceId = emptyToZero(req.body.RefferenceId);
            let RefferenceNumber = emptyToZero(req.body.RefferenceNumber);
            let RefferenceYear = emptyToZero(req.body.RefferenceYear);

            const mainQuery = "CALL sp_getCaseSearchByparam(?, ?, ?, ?, ?, ?)";
            const mainParams = [SearchType, CaseNumber, CaseDate, RefferenceId, RefferenceNumber, RefferenceYear];

            const [caseResults] = await new Promise((resolve, reject) => {
                db.query(mainQuery, mainParams, (err, results) => {
                    if (err) {
                        console.error("Error executing sp_getCaseSearchByparam:", err);
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            return ResponseHelper.success_reponse(res, "Data found", caseResults);
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }

}



module.exports = CaseController;
