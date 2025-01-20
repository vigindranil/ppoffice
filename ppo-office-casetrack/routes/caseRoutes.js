const express = require('express');
const CaseController = require('../controllers/caseController');
const upload = require('../middlewares/uploadMiddleware'); // Multer middleware

const router = express.Router();

// Route for creating a case with document upload
router.post('/create', upload.single('caseDocument'), CaseController.createCaseWithDocument);
router.post('/caseDetail', upload.single('caseuploadDocumentPath'), CaseController.createCaseDetail);

module.exports = router;

