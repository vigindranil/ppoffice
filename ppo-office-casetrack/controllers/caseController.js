const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper
const logger = require('../utils/logger'); // Import the logger

class CaseController {
    // Show all CaseType
    static async getcasetype(req, res) {
        const query = 'CALL sp_CasetypeDropdown()';

        try {
            db.query(query, (err, results) => {
                if (err) {
                    logger.error("Error fetching CaseType:", { error: err });
                    return ResponseHelper.error(res, "An error occurred while fetching CaseType.");
                }
                logger.info("CaseType fetched successfully", { results: results[0] });
                return ResponseHelper.success_reponse(res, "CaseType found successfully", results[0]);
            });
        } catch (error) {
            logger.error("Unexpected error in getcasetype:", { error });
            return ResponseHelper.error(res, "Unexpected error", error);
        }
    }

    static async getCaseById(req, res) {
        const { CaseID } = req.query; // Get the CaseNumber from query parameters

        if (!CaseID) {
            logger.warn("CaseID is missing in the request.");
            return ResponseHelper.error(res, "CaseID is required.");
        }

        try {
            const query = "CALL sp_getCaseDetailsByCaseId(?)";
            const params = [CaseID];

            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        logger.error("SQL Error executing stored procedure:", { error: err });
                        return reject({ sqlError: true, error: err });
                    }
                    resolve(results[0]);
                });
            });

            if (results.length === 0) {
                logger.info("No case assignment found for CaseID", { CaseID });
                return ResponseHelper.error(res, "No case assignment found for CaseID");
            }

            logger.info("Case assignment found for CaseID", { CaseID, results });
            return ResponseHelper.success_reponse(res, "Case assignment found", results);
        } catch (error) {
            if (error.sqlError) {
                logger.error("Database error occurred", { error: error.error });
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
                logger.error("Unexpected error in getCaseById:", { error });
                return ResponseHelper.error(res, "An unexpected error occurred while retrieving the case assignment.");
            }
        }
    }

    static showRefference(req, res) {
        const query = 'CALL sp_showRefference()';
        try {
            db.query(query, (err, results) => {
                if (err) {
                    logger.error("Error fetching reference data:", { error: err });
                    return ResponseHelper.error(res, "An unexpected error occurred while retrieving data.");
                }
                logger.info("Reference data retrieved successfully");
                return ResponseHelper.success_reponse(res, "Reference data found", results[0]);
            });
        } catch (error) {
            logger.error("Unexpected error in showRefference:", { error });
            return ResponseHelper.error(res, "An unexpected error occurred.", error);
        }
    }

    static async createCase(req, res) {
        const {
            CaseNumber,
            EntryUserID,
            CaseDate,
            DistrictID,
            psID,
            caseTypeID,
            ref,
            ipcAct,
            hearingDate,
            sendTo,
            copyTo,
            photocopycaseDiaryExist
        } = req.body;

        if (
            !CaseNumber || !EntryUserID || !CaseDate || !DistrictID || !psID ||
            !caseTypeID || !ref || !ipcAct || !hearingDate || sendTo === undefined ||
            copyTo === undefined || photocopycaseDiaryExist === undefined
        ) {
            logger.warn("Missing required fields in createCase:", { requestData: req.body });
            return ResponseHelper.error(res, "Please entry all required fields.");
        }

        try {
            const query = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const params = [
                CaseNumber,
                EntryUserID,
                CaseDate,
                DistrictID,
                psID,
                caseTypeID,
                ref,
                ipcAct,
                hearingDate,
                sendTo,
                copyTo,
                photocopycaseDiaryExist,
            ];

            await new Promise((resolve, reject) => {
                db.query(query, params, (err) => {
                    if (err) {
                        logger.error("Error executing stored procedure in createCase:", { error: err });
                        return reject(err);
                    }
                    resolve();
                });
            });

            const outputResults = await new Promise((resolve, reject) => {
                db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                    if (outputErr) {
                        logger.error("Error fetching output parameters in createCase:", { error: outputErr });
                        return reject(outputErr);
                    }
                    resolve(results);
                });
            });

            const { CaseID, ErrorCode } = outputResults[0];

            if (ErrorCode === 1) {
                logger.error("Error code 1: Unable to execute procedure.");
                return ResponseHelper.error(res, "An error occurred while executing the procedure.");
            }
            if (ErrorCode === 2) {
                logger.warn("Case already created.", { CaseNumber });
                return ResponseHelper.error(res, "Case already created.");
            }
            if (ErrorCode === 3) {
                logger.warn("Logged-in user lacks permission to create case.");
                return ResponseHelper.error(res, "Logged-in user lacks permission to create case.");
            }

            logger.info("Case created successfully.", { CaseID });
            return res.status(201).json({
                status: 0,
                message: "Case created successfully.",
                data: { CaseID },
            });
        } catch (error) {
            logger.error("Unexpected error in createCase:", { error });
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
        }
    }

    // Additional methods will follow the same logging pattern...
}
module.exports = CaseController;
