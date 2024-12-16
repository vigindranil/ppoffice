// routes/routes.js

const express = require('express');
const router = express.Router();


// custom middleware
const authMiddleware = require('../middlewares/authMiddleware'); 

// show all district
const districtController = require('../controllers/districtController');
router.get('/api/alldistrict', authMiddleware.verifyToken, districtController.show);

// show all policestation respect to District
const policeController = require('../controllers/policeController');
router.get('/api/showpoliceBydistrict', authMiddleware.verifyToken,policeController.showallpsBydistrict);

//user login
const authController = require('../controllers/authController');
router.post('/api/authenticate', authController.authenticateUser);



const ppstaffController = require('../controllers/PPstaffController');
router.post('/api/addppstaff', authMiddleware.verifyToken,ppstaffController.createPPStaff); //create ppstaff by ppadmin
router.get('/api/getppstaff', authMiddleware.verifyToken,ppstaffController.showppstaff); // show ppstaff
router.get('/api/getppstaffById', authMiddleware.verifyToken,ppstaffController.ppdetailsbyId); // show ppstaffdetails by Id
router.post('/api/assigncase', authMiddleware.verifyToken,ppstaffController.assignCase); // show ppstaffdetails by Id




// password reset
const passwordfController = require('../controllers/resetpassword');
router.post('/api/changepassword', authMiddleware.verifyToken,passwordfController.resetPassword);

// case assisgn
const CaseController = require('../controllers/caseController');
router.get('/api/getCaseAssign', authMiddleware.verifyToken,CaseController.getCaseAssign);
router.get('/api/getcasetype', authMiddleware.verifyToken,CaseController.getcasetype);
router.get("/api/caseDetailsById",authMiddleware.verifyToken,CaseController.getCaseById);
router.get("/api/showRefferenceDetails",authMiddleware.verifyToken,CaseController.showRefference);
router.post("/api/addCase",authMiddleware.verifyToken,CaseController.createCase); // firsttime create case by ppOffice
router.get("/api/showallCase",authMiddleware.verifyToken,CaseController.showallCase); // firsttime create case by ppOffice



// send email
const EmailController = require("../controllers/emailController");
router.post("/api/send-email", authMiddleware.verifyToken,EmailController.sendEmail);

// psStaff 
const PsController = require("../controllers/psController");
router.post("/api/addpsStaff",authMiddleware.verifyToken,PsController.createPsStaff);
router.get("/api/getpsStaff",authMiddleware.verifyToken,PsController.showpsstaff);

module.exports = router;
