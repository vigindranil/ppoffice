const express = require('express');
const router = express.Router();


const authMiddleware = require('../middlewares/authMiddleware'); 

// show all bns section
const ipcBnsMasterController = require('../controllers/ipcBnsMasterController');
router.post('/api/showBnsSection', authMiddleware.verifyToken, ipcBnsMasterController.showBnsSection);
router.post('/api/showIpcByBns', authMiddleware.verifyToken, ipcBnsMasterController.showIpcByBns);


module.exports = router;

// -mr