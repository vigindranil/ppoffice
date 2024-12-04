// routes/routes.js

const express = require('express');
const router = express.Router();

// Import the ShowController
const ShowController = require('../controllers/showController');

// Define the GET route for /show, using the ShowController
router.get('/api/alldistrict', ShowController.show);



// Define other routes as needed
// router.get('/otherRoute', ShowController.anotherMethod);

module.exports = router;
