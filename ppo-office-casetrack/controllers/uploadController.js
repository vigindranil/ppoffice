const { uploadToSFTP, downloadFromSFTP } = require("../utils/ftpUploader");
const fs = require("fs");
const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper
const path = require("path");
// const basePath = `D:\\CaseTrack\\ppoffice\\ppo-office-casetrack\\`;

const basePath = `D:\\git\\ppoffice\\ppo-office-casetrack\\`;

class uploadController {

    static async addCaseDocuments(req, res) {
        try {
            console.log("🔥 Received Request Body:", req.body);
            console.log("🔥 Received Files:", req.files);
    
            const { CaseID, EntryUserID } = req.body;
            const files = req.files;

            if (!CaseID || !EntryUserID || !files || files.length === 0) {
                return ResponseHelper.error(res, "Invalid input: Provide CaseID, EntryUserID, and at least one document.");
            }
    
            console.log("files", files);
            
            for (const file of files) {
                const remoteFilePath = await uploadToSFTP(file.buffer, file.originalname);
                // console.log("sddddd",remoteFilePath);
                if (!remoteFilePath) {
                    console.error("❌ FTP Upload Failed");
                    continue; // Skip file processing if FTP upload fails
                }
    
                console.log("✅ File uploaded to FTP:", remoteFilePath);
    
                const query = "CALL sp_createcaseDocument(?, ?, ?, @ErrorCode)";
                console.log("CaseID", CaseID);
                console.log("remoteFilePath", remoteFilePath);
                console.log("EntryUserID", EntryUserID);
                
                
                
                
                const params = [CaseID, remoteFilePath, EntryUserID];
    
                await new Promise((resolve, reject) => {
                    db.query(query, params, (err) => {
                        if (err) {
                            console.error("❌ Database Error:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                });
    
            }
    
            return res.status(201).json({
                status: 0,
                message: "All case documents uploaded to FTP and saved successfully.",
            });
    
        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
        }
    }

    static async addCaseDocumentsV1(req, res) {
        try {
            console.log("🔥 Received Request Body:", req.body);
            console.log("🔥 Received Files:", req.files);

            const InDOCID = "0" || req.body.InDOCID;
            const { CaseID, RefferenceID, CranID, EntryUserID } = req.body;
            const files = req.files;

            if (!CaseID || !EntryUserID || !RefferenceID || !CranID || !files || files.length === 0) {
                return ResponseHelper.error(res, "Invalid input: Provide CaseID, RefferenceID, CranID, EntryUserID, and at least one document.");
            }
    
            console.log("files", files);
            
            for (const file of files) {
                const remoteFilePath = await uploadToSFTP(file.buffer, file.originalname);
                // console.log("sddddd",remoteFilePath);
                if (!remoteFilePath) {
                    console.error("❌ FTP Upload Failed");
                    continue; // Skip file processing if FTP upload fails
                }
    
                console.log("✅ File uploaded to FTP:", remoteFilePath);
    
                const query = "CALL sp_createcaseDocument_v1(?, ?, ?, ?, ?, ?, @DOCID, @ErrorCode)";
                console.log("CaseID", CaseID);
                console.log("remoteFilePath", remoteFilePath);
                console.log("EntryUserID", EntryUserID);
                
                
                
                
                const params = [InDOCID, CaseID, RefferenceID, CranID, remoteFilePath, EntryUserID];
    
                await new Promise((resolve, reject) => {
                    db.query(query, params, (err) => {
                        if (err) {
                            console.error("❌ Database Error:", err);
                            return reject(err);
                        }
                        resolve();
                    });
                });
    
            }
    
            return res.status(201).json({
                status: 0,
                message: "All case documents uploaded to FTP and saved successfully.",
            });
    
        } catch (error) {
            console.error("❌ Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
        }
    }

    static async downloadFTPDoc (req, res) {
        const { filename } = req.query;
    
        if (!filename) {
            return res.status(400).json({ message: "Filename is required" });
        }
    
        const remoteFilePath = `/home/ftpuser/${filename}`; // Adjust path as per your FTP structure
    
        console.log(`🔥 Download request for: ${remoteFilePath}`);
    
        await downloadFromSFTP(remoteFilePath, res);
    }

}
    
module.exports = uploadController;