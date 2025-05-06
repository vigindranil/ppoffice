// routes/routes.js

const express = require('express');
const router = express.Router();


// custom middleware
const authMiddleware = require('../middlewares/authMiddleware'); 

// show all district
const districtController = require('../controllers/districtController');
router.get('/api/alldistrict', authMiddleware.verifyToken, districtController.show);
router.get('/api/showallCasesBydistrictId',authMiddleware.verifyToken,districtController.showallcasesBydistrict);
router.get('/api/count-by-ps',authMiddleware.verifyToken,districtController.getCaseCountsByPoliceStation);
router.post('/api/count-by-district',authMiddleware.verifyToken,districtController.getCaseCountByDistrict);
router.post('/api/assigned-dept', authMiddleware.verifyToken,districtController.getAssignedDistrictAndPoliceByCaseId); // show assigned dept
// router.post('/api/unassigned-dept', authMiddleware.verifyToken,districtController.getUnassignedAdvocatesByCaseId); 
router.post('/api/alldistrict-case', authMiddleware.verifyToken,districtController.getUnassignedDistrictByCaseId); 
router.post('/api/allps-case-district', authMiddleware.verifyToken,districtController.getUnassignedPoliceStationsByCaseAndDistrict ); 



//user login
const authController = require('../controllers/authController');
router.post('/api/authenticate', authController.authenticateUser);



const ppuserController = require('../controllers/PPuserController');
router.post('/api/addppUser', authMiddleware.verifyToken,ppuserController.createPPUser); //create ppstaff by ppadmin
router.get('/api/getppuser', authMiddleware.verifyToken,ppuserController.showppuser); // show ppuser
router.post('/api/assigned-advocates', authMiddleware.verifyToken,ppuserController.getAssignedAdvocatesByCaseId); // show assigned ppuser
router.post('/api/unassigned-advocates', authMiddleware.verifyToken,ppuserController.getUnassignedAdvocatesByCaseId); // show unassigned ppuser
router.post('/api/caseDetailsByPPuserId', authMiddleware.verifyToken,ppuserController.caseDetailsByPPuserId); // show ppstaffdetails by Id
router.post('/api/assigncase', authMiddleware.verifyToken,ppuserController.assignOrUnAdvocateToCase); // show ppstaffdetails by Id
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
router.post("/api/showallCase", authMiddleware.verifyToken,CaseController.showallCaseWithDOC);
router.post("/api/DashboardCount",authMiddleware.verifyToken,CaseController.getDashboardCounts);
router.post("/api/showCaseDetail", authMiddleware.verifyToken,CaseController.showCaseDetail);
router.post("/api/show-case-document", authMiddleware.verifyToken,CaseController.getCaseDocuments);
router.post("/api/crm-list-case", authMiddleware.verifyToken,CaseController.getCrmListByCaseId);
router.post("/api/show-section-by-case", authMiddleware.verifyToken,CaseController.showSectionsByCaseId);
router.post("/api/show-reference-by-case", authMiddleware.verifyToken,CaseController.showRefferenceNumberByCaseId);
router.post("/api/add-crr", authMiddleware.verifyToken,CaseController.saveCrr);
router.post("/api/add-cran", authMiddleware.verifyToken,CaseController.saveCran);

// send email
const EmailController = require("../controllers/emailController");
router.post("/api/send-email", authMiddleware.verifyToken,EmailController.sendEmail);
router.post("/api/send-email-pp", authMiddleware.verifyToken,EmailController.sendEmailTO);
router.post("/api/send-email-caseDetails", authMiddleware.verifyToken,EmailController.sendCaseUpdatedEmail)

// psStaff 
const PsController = require("../controllers/psController");
router.post("/api/addpsStaff",authMiddleware.verifyToken,PsController.createPsStaff);
router.get("/api/getpsStaff",authMiddleware.verifyToken,PsController.showpsstaff);
router.post("/api/showallCasesBypsId",authMiddleware.verifyToken,PsController.showallcasesBypoliceID);
router.post("/api/showpsUserById",authMiddleware.verifyToken,PsController.showpsuserById);
router.get('/api/showpoliceBydistrict', authMiddleware.verifyToken,PsController.showallpsBydistrict);

const superAdmin = require("../controllers/SuperAdminController");
router.post("/api/addppofficeAdmin",authMiddleware.verifyToken,superAdmin.createPPOfficeAdminUser);
router.post("/api/addppHead",authMiddleware.verifyToken,superAdmin.createPPHeadUser);
router.post("/api/showppOfficeAdminUserList",authMiddleware.verifyToken,superAdmin.showppofficeAdminUser);
router.post("/api/showppOfficeHeadUserList",authMiddleware.verifyToken,superAdmin.showppofficeHeadnUser);
router.post("/api/addSP",authMiddleware.verifyToken,superAdmin.createSPUser);
router.post("/api/showspUser",authMiddleware.verifyToken,superAdmin.showspUser);
router.post("/api/showUserCounts",authMiddleware.verifyToken,superAdmin.getUserCounts);


const notifications = require("../controllers/notificationConroller");
router.post("/api/emailDetails",authMiddleware.verifyToken,notifications.showMailDetailsById);
router.post("/api/emailRead",authMiddleware.verifyToken,notifications.checkMailRead);







module.exports = router;