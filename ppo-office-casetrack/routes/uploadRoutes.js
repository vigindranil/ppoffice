const express = require('express');
const CaseController = require('../controllers/caseController');

const router = express.Router();

// Route for creating a case with document upload
router.post('/add-case-document', CaseController.addCaseDocuments);
module.exports = router;

