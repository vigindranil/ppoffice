const db = require("../config/db");

class CaseModel {
    
    // Get all Case Types
    static async getCaseTypes() {
        const query = 'CALL sp_CasetypeDropdown()';
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    reject("An error occurred while fetching CaseType.");
                } else {
                    resolve(results[0]);
                }
            });
        });
    }

    // Get Case by ID
    static async getCaseById(CaseID) {
        const query = "CALL sp_getCaseDetailsByCaseId(?)";
        const params = [CaseID];
        return new Promise((resolve, reject) => {
            db.query(query, params, (err, results) => {
                if (err) {
                    reject("An error occurred while retrieving the case.");
                } else {
                    resolve(results[0]);
                }
            });
        });
    }

    // Create Case without Document
    static async createCase(data) {
        const query = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
        const params = [
            data.CaseNumber, data.EntryUserID, data.CaseDate, data.DistrictID,
            data.psID, data.caseTypeID, data.ref, data.ipcAct, data.hearingDate,
            data.sendTo, data.copyTo, data.photocopycaseDiaryExist
        ];

        return new Promise((resolve, reject) => {
            db.query(query, params, (err) => {
                if (err) {
                    reject("An error occurred while executing the procedure.");
                } else {
                    // Fetch the output parameters
                    db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                        if (outputErr) {
                            reject("An error occurred while fetching output.");
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    }

    // Create Case with Document
    static async createCaseWithDocument(data, caseDocumentPath) {
        const query = "CALL sp_CreatecaseV1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
        const params = [
            data.CaseNumber, data.EntryUserID, data.CaseDate, data.DistrictID,
            data.psID, data.caseTypeID, data.ref, data.ipcAct, data.hearingDate,
            data.sendTo, data.copyTo, data.photocopycaseDiaryExist, caseDocumentPath
        ];

        return new Promise((resolve, reject) => {
            db.query(query, params, (err) => {
                if (err) {
                    reject("An error occurred while executing the procedure.");
                } else {
                    // Fetch output parameters
                    db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                        if (outputErr) {
                            reject("An error occurred while fetching output.");
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    }

    // Create Case Details
    static async createCaseDetail(data, caseuploadDocumentPath) {
        const query = "CALL sp_updateCaseDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseSummaryID, @ErrorCode)";
        const params = [
            data.CaseNumber, data.CaseDescription, data.CaseId, data.EntryUserID,
            data.CaseDate, data.DistrictID, data.psID, data.caseTypeID, data.nexthearingDate,
            data.requiredDocument, caseuploadDocumentPath, data.additionalRemarks
        ];

        return new Promise((resolve, reject) => {
            db.query(query, params, (err) => {
                if (err) {
                    reject("An error occurred while executing the procedure.");
                } else {
                    // Fetch output parameters
                    db.query("SELECT @CaseSummaryID AS CaseSummaryID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                        if (outputErr) {
                            reject("An error occurred while fetching output.");
                        } else {
                            resolve(results[0]);
                        }
                    });
                }
            });
        });
    }

    // Show Case Detail
    static async showCaseDetail(CaseID) {
        const query = "CALL sp_ShowCaseDetailSummaryById(?)";
        const params = [CaseID];
        return new Promise((resolve, reject) => {
            db.query(query, params, (err, rows) => {
                if (err) {
                    reject("An error occurred while fetching case details.");
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }
}

module.exports = CaseModel;