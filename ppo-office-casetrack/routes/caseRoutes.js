const express = require('express');
const CaseController = require('../controllers/caseController');
const upload = require('../middlewares/uploadMiddleware'); // Multer middleware

const router = express.Router();

// Route for creating a case with document upload
router.post('/create', CaseController.createCase);
router.post('/add-case-document',upload.array("documents"), CaseController.addCaseDocuments);
router.post('/caseDetail', upload.single('caseuploadDocumentPath'), CaseController.createCaseDetail);

module.exports = router;

