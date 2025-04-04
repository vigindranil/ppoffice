const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper
const path = require("path");
import validateFields from '../utils/validators.js';
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
          
            return ResponseHelper.error(res, "Unexpected error",error);

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

                return ResponseHelper.error(res,"No case assignment found for CaseNumber");
               
            }
             // Respond with the case assignment details
            return ResponseHelper.success_reponse(res," case assignment found for CaseNumber",results);
           
           
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
                return ResponseHelper.error(res,"An unexpected error occurred while retrieving the case assignment.");
                
            }
        }
    }
 
    // show Refference Details
    static showRefference(req, res) {
        const query = 'CALL sp_showRefference()';  // Replace with your stored procedure name
    
      try {
        db.query(query, (err, results) => {
          if (err) {
            return ResponseHelper.error(res,"An unexpected error occurred while retrieving Data.",err);
          }
    
          
          // Assuming your stored procedure returns data in results[0]
          return ResponseHelper.success_reponse(res," case assignment found for CaseNumber",results[0]);
    
          
        });

      }
      catch (error) {
        // Handle unexpected errors
        return ResponseHelper.error(res,"An unexpected error occurred.",error);
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
    
            // ✅ Validate required fields using `validateFields`
            try {
                validateFields(req.body, [
                    "CaseNumber",
                    "EntryUserID",
                    "CaseDate",
                    "districtId",
                    "psId",
                    "caseTypeId",
                    "filingDate",
                    "petitionName",
                    "hearingDate"
                ]);
            } catch (error) {
                return res.status(400).json({ status: 1, message: `${error.message}. ErrorCode: ERR_03` });
            }
    
            // ✅ Extract fields from request body
            const {
                CaseNumber,
                EntryUserID,
                CaseDate,
                districtId,
                psId,
                caseTypeId,
                filingDate,
                petitionName,
                hearingDate,
                refferences = [],
                ipcSections = []
            } = req.body;
    
            // ✅ Call sp_Createcase to save the case and get CaseID
            const caseQuery = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const caseParams = [
                CaseNumber,
                CaseDate,
                districtId,
                psId,
                caseTypeId,
                filingDate,
                petitionName,
                hearingDate,
                EntryUserID
            ];
    
            console.log("Executing sp_Createcase with params:", caseParams);
            await db.queryAsync(caseQuery, caseParams);
    
            // ✅ Fetch the output CaseID and ErrorCode
            const caseOutput = await db.queryAsync("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode");
            const { CaseID, ErrorCode } = caseOutput[0];
    
            // ✅ Handle stored procedure errors
            const errorMessages = {
                1: "An error occurred while executing the procedure.",
                2: "Case already exists.",
                3: "User does not have permission to create a case."
            };
            if (ErrorCode && errorMessages[ErrorCode]) {
                return ResponseHelper.error(res, errorMessages[ErrorCode]);
            }
    
            console.log("Case created successfully with CaseID:", CaseID);
    
            // ✅ Save multiple reference numbers
            if (Array.isArray(refferences) && refferences.length > 0) {
                for (const { crmID, refferenceNumber, refferenceyear } of refferences) {
                    console.log("Saving reference:", { crmID, refferenceNumber, refferenceyear });
    
                    const refQuery = "CALL sp_saveRefferenceNumberByCaseId(?, ?, ?, ?, ?, @ErrorCode)";
                    const refParams = [CaseID, crmID, refferenceNumber, refferenceyear, EntryUserID];
    
                    await db.queryAsync(refQuery, refParams);
                }
            }
    
            // ✅ Save multiple IPC sections
            if (Array.isArray(ipcSections) && ipcSections.length > 0) {
                for (const bnsId of ipcSections) {
                    console.log("Saving IPC section for BnsId:", bnsId);
    
                    const ipcQuery = "CALL sp_saveipcsectionBycaseId(?, ?, ?, @ErrorCode)";
                    const ipcParams = [CaseID, bnsId, EntryUserID];
    
                    await db.queryAsync(ipcQuery, ipcParams);
                }
            }
    
            // ✅ Final success response
            return res.status(201).json({
                status: 0,
                message: "Case created successfully with associated reference numbers and IPC sections.",
                data: { CaseID }
            });
    
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
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
                    CaseDescription : caseItem.CaseDescription,
                    CaseRequiredDocument : caseItem.CaseRequiredDocument,
                    SPName: caseItem.SPName,
                    PSName: caseItem.PSName,
                    CaseDate: caseItem.CaseDate,
                    CaseType: caseItem.CaseType,
                    NextHearingDate: caseItem.NextHearingDate,
                    CaseSummaryId: caseItem.CaseSummaryId,
                    Remarks : caseItem.Remarks,
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
    
          
          db.query(query,[is_Assigned],(err, results) => {
            if (err) {
            
              return ResponseHelper.error(res, "An error occurred while fetching data");
            }
    
            // Assuming your stored procedure returns data in results[0]
            return ResponseHelper.success_reponse(res, "Data found", results[0]);
          });
        } catch (error) {
          
          return ResponseHelper.error(res, "An unexpected error occurred",error);
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
    

      static async showallCaseBetweenRange(req, res) {
        try {
            const { startDate, endDate,isAssign } = req.body;
    
            
    
            // SQL query to call the stored procedure
            const query = 'CALL sp_ShowallCaseBetweenRange(?, ?,?)';
    
            db.query(query, [startDate, endDate,isAssign], (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }
    
                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, "Data found", results[0]);
            });
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
            const query = 'CALL sp_DashBoardCount(?)';
    
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
                    // Possibly the SP exited early or returned no data
                    const response = {
                        unassignedCases: 0,
                        assignedCases: 0,
                        totalCases: 0
                    };
                    return ResponseHelper.success_reponse(
                        res,
                        "No data returned from sp_DashBoardCount",
                        response
                    );
                }
    
                // The SP returns exactly one row with columns:
                //    TotalUnassignedCase, TotalAssignedCase, TotalCases
                const spRow = caseData[0];
    
                // Transform that single row into the array structure your loop expects:
                const transformedData = [
                    {
                        caseTypeName: 0,
                        CaseCount: spRow.TotalUnassignedCase || 0
                    },
                    {
                        caseTypeName: 1,
                        CaseCount: spRow.TotalAssignedCase || 0
                    }
                ];
    
                // Use the existing loop logic on the transformed data
                transformedData.forEach(row => {
                    if (row.caseTypeName === 0) {
                        unassignedCases = row.CaseCount;
                    } else if (row.caseTypeName === 1) {
                        assignedCases = row.CaseCount;
                    }
                    totalCases += row.CaseCount;
                });
    
                // Or you can directly take spRow.TotalCases if you trust it:
                // totalCases = spRow.TotalCases || 0;
    
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

}



module.exports = CaseController;
