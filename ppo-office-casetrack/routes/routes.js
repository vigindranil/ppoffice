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







module.exports = router;
