const SFTPClient = require("ssh2-sftp-client");
const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");

const sftp = new SFTPClient();

const SFTP_CONFIG = {
    host: "172.25.138.157",
    port: 22, // SFTP runs on port 22
    username: "ftpuser",
    password: "Vyoma@123"
};

// async function uploadToSFTP(localFilePath, remoteFileName) {
//     try {
//         console.log("🔌 Connecting to SFTP server...");
//         await sftp.connect(SFTP_CONFIG);
//         console.log("✅ SFTP Connection Established");

//         const remoteFilePath = `/home/ftpuser/${remoteFileName}`;

//         console.log("📤 Uploading file:", localFilePath, "➡", remoteFilePath);
//         await sftp.put(localFilePath, remoteFilePath);

//         console.log("✅ File successfully uploaded to SFTP:", remoteFilePath);

//         return remoteFilePath;
//     } catch (error) {
//         console.error("❌ SFTP Upload Error:", error);
//         return null;
//     } finally {
//         await sftp.end();
//         console.log("🔌 SFTP Connection Closed");
//     }
// }

// Function to download file from SFTP as a stream


async function uploadToSFTP(fileBuffer, remoteFileName) {
    try {
        console.log("🔌 Connecting to SFTP server...");
        await sftp.connect(SFTP_CONFIG);
        console.log("✅ SFTP Connection Established");

        const remoteFilePath = `/home/ftpuser/${remoteFileName}`;

        console.log("📤 Uploading file to SFTP...");
        await sftp.put(fileBuffer, remoteFilePath);

        console.log("✅ File successfully uploaded:", remoteFilePath);
        return remoteFilePath;
    } catch (error) {
        console.error("❌ SFTP Upload Error:", error);
        return null;
    } finally {
        await sftp.end();
        console.log("🔌 SFTP Connection Closed");
    }
}


async function downloadFromSFTP(remoteFilePath, res) {
    try {
        console.log("🔌 Connecting to SFTP server...");
        await sftp.connect(SFTP_CONFIG);
        console.log("✅ SFTP Connection Established");
 
        console.log("📂 Checking if file exists:", remoteFilePath);
        const fileExists = await sftp.exists(remoteFilePath);
 
        if (!fileExists) {
            console.error("❌ File Not Found:", remoteFilePath);
            return res.status(404).json({ message: "File not found on SFTP server" });
        }
 
        console.log("📥 Downloading file as buffer:", remoteFilePath);
 
        // Get the file as a Buffer
        const fileBuffer = await sftp.get(remoteFilePath);
 
        console.log("✅ File buffer received from SFTP:", remoteFilePath);
 
        // Convert the buffer into a readable stream
        const stream = Readable.from(fileBuffer);
 
        // Extract file name and extension
        const fileName = remoteFilePath.split('/').pop();
        const fileExtension = fileName.split('.').pop();
 
        // Set appropriate headers for streaming
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", `application/${fileExtension}`);
 
        // Pipe the readable stream directly to the response
        stream.pipe(res);
    } catch (error) {
        console.error("❌ SFTP Stream Download Error:", error);
        res.status(500).json({ message: "Error streaming file", error: error.message });
    } finally {
        await sftp.end();
        console.log("🔌 SFTP Connection Closed");
    }
}


// base64
// async function downloadFromSFTP(remoteFilePath, res) {
//     try {
//         console.log("🔌 Connecting to SFTP server...");
//         await sftp.connect(SFTP_CONFIG);
//         console.log("✅ SFTP Connection Established");

//         console.log("📥 Downloading file:", remoteFilePath);

//         // Get the file as a buffer
//         const fileBuffer = await sftp.get(remoteFilePath);

//         console.log("✅ File successfully fetched from SFTP");

//         // Convert file buffer to Base64
//         const base64Data = fileBuffer.toString("base64");

//         // Get the file extension
//         const fileExtension = remoteFilePath.split('.').pop();

//         // Set response
//         res.json({
//             filename: remoteFilePath.split('/').pop(),
//             fileType: `image/${fileExtension}`, // Modify if handling PDFs or other types
//             base64: base64Data
//         });

//     } catch (error) {
//         console.error("❌ SFTP Download Error:", error);
//         res.status(500).json({ message: "Error downloading file", error: error.message });
//     } finally {
//         await sftp.end();
//         console.log("🔌 SFTP Connection Closed");
//     }
// }


module.exports = { uploadToSFTP, downloadFromSFTP };