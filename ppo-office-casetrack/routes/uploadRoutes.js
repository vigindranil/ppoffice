const express = require('express');
const UploadController = require('../controllers/uploadController');
const upload = require('../middlewares/uploadftpMiddleware');

const router = express.Router();

router.post("/add-ftp-case-document",UploadController.addCaseDocuments);
router.post("/add-ftp-case-document-v1",UploadController.addCaseDocumentsV1);

// Route to download a file from SFTP
router.get("/download", UploadController.downloadFTPDoc);
module.exports = router;

