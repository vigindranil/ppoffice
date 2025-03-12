const uploadToFTP = require("../utils/ftpUploader");
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
    
            for (const file of files) {
                const localFilePath = file.path; // Temporary local file
                const remoteFilePath = await uploadToFTP(localFilePath, file.filename);
                console.log("sajkdasj",remoteFilePath);
                if (!remoteFilePath) {
                    console.error("❌ FTP Upload Failed");
                    continue; // Skip file processing if FTP upload fails
                }
    
                console.log("✅ File uploaded to FTP:", remoteFilePath);
    
                // const query = "CALL sp_createcaseDocument(?, ?, ?, @ErrorCode)";
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
    
                // Delete the temporary local file
                fs.unlinkSync(localFilePath);
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
    
        await uploadToFTP.downloadFromSFTP(remoteFilePath, res);
    }

}
    
module.exports = uploadController;