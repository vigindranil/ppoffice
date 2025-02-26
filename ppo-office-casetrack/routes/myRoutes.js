const express = require('express');
const router = express.Router();


const authMiddleware = require('../middlewares/authMiddleware'); 

// show all bns section
const ipcBnsMasterController = require('../controllers/ipcBnsMasterController');
router.post('/api/showBnsSection', authMiddleware.verifyToken, ipcBnsMasterController.showBnsSection);
router.post('/api/showIpcSection', authMiddleware.verifyToken, ipcBnsMasterController.showIpcSection);
router.post('/api/showIbsByBnsId', authMiddleware.verifyToken, ipcBnsMasterController.showIbsByBnsId);
router.post('/api/search', authMiddleware.verifyToken, ipcBnsMasterController.search);
router.get('/api/advocates/:caseId', authMiddleware.verifyToken, ipcBnsMasterController.getAdvocatesByCaseId);
 

module.exports = router;

// -mr