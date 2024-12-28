// routes/routes.js

const express = require('express');
const router = express.Router();


// custom middleware
const authMiddleware = require('../middlewares/authMiddleware'); 

// show all district
const districtController = require('../controllers/districtController');
router.get('/api/alldistrict', authMiddleware.verifyToken, districtController.show);
router.get('/api/showallCasesBydistrictId',authMiddleware.verifyToken,districtController.showallcasesBydistrict);



//user login
const authController = require('../controllers/authController');
router.post('/api/authenticate', authController.authenticateUser);



const ppuserController = require('../controllers/PPuserController');
router.post('/api/addppUser', authMiddleware.verifyToken,ppuserController.createPPUser); //create ppstaff by ppadmin
router.get('/api/getppuser', authMiddleware.verifyToken,ppuserController.showppuser); // show ppuser
router.get('/api/caseDetailsByPPuserId', authMiddleware.verifyToken,ppuserController.caseDetailsByPPuserId); // show ppstaffdetails by Id
router.post('/api/assigncase', authMiddleware.verifyToken,ppuserController.assignCasetoppuser); // show ppstaffdetails by Id
router.get('/api/getppuserDetailsById', authMiddleware.verifyToken,ppuserController.getppuserDetailsById);



// password reset
const passwordfController = require('../controllers/resetpassword');
router.post('/api/changepassword', authMiddleware.verifyToken,passwordfController.resetPassword);

// case assisgn
const CaseController = require('../controllers/caseController');

router.get('/api/getcasetype', authMiddleware.verifyToken,CaseController.getcasetype);
router.get("/api/caseDetailsById",authMiddleware.verifyToken,CaseController.getCaseById);
router.get("/api/showRefferenceDetails",authMiddleware.verifyToken,CaseController.showRefference);
router.post("/api/addCase",authMiddleware.verifyToken,CaseController.createCase); // firsttime create case by ppOffice
router.get("/api/showallCase",authMiddleware.verifyToken,CaseController.showallCase); // firsttime create case by ppOffice
router.post("/api/showallCaseBetweenRange",authMiddleware.verifyToken,CaseController.showallCaseBetweenRange);


// send email
const EmailController = require("../controllers/emailController");
router.post("/api/send-email", authMiddleware.verifyToken,EmailController.sendEmail);
router.post("/api/send-email-pp", authMiddleware.verifyToken,EmailController.sendEmailTO);


// psStaff 
const PsController = require("../controllers/psController");
router.post("/api/addpsStaff",authMiddleware.verifyToken,PsController.createPsStaff);
router.get("/api/getpsStaff",authMiddleware.verifyToken,PsController.showpsstaff);
router.get("/api/showallCasesBypsId",authMiddleware.verifyToken,PsController.showallcasesBypoliceID);
router.post("/api/showpsUserById",authMiddleware.verifyToken,PsController.showpsuserById);
router.get('/api/showpoliceBydistrict', authMiddleware.verifyToken,PsController.showallpsBydistrict);

const superAdmin = require("../controllers/SuperAdminController");
router.post("/api/addppofficeAdmin",authMiddleware.verifyToken,superAdmin.createPPOfficeAdminUser);
router.post("/api/addppHead",authMiddleware.verifyToken,superAdmin.createPPHeadUser);
router.post("/api/showppOfficeAdminUserList",authMiddleware.verifyToken,superAdmin.showppofficeAdminUser);
router.post("/api/showppOfficeHeadUserList",authMiddleware.verifyToken,superAdmin.showppofficeHeadnUser);
router.post("/api/addSP",authMiddleware.verifyToken,superAdmin.createSPUser);
router.post("/api/showspUser",authMiddleware.verifyToken,superAdmin.showspUser);







module.exports = router;
