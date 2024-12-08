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
router.get('/api/allpolice', authMiddleware.verifyToken,policeController.show);

//user login
const authController = require('../controllers/authController');
router.post('/api/authenticate', authController.authenticateUser);



const ppstaffController = require('../controllers/PPstaffController');
router.post('/api/addppstaff', authMiddleware.verifyToken,ppstaffController.createPPStaff); //create ppstaff by ppadmin
router.get('/api/getppstaff', authMiddleware.verifyToken,ppstaffController.showppstaff); // show ppstaff
router.get('/api/getppstaffById', authMiddleware.verifyToken,ppstaffController.ppdetailsbyId); // show ppstaffdetails by Id



// password reset
const passwordfController = require('../controllers/resetpassword');
router.post('/api/changepassword', authMiddleware.verifyToken,passwordfController.resetPassword);


module.exports = router;
