const express = require('express');
const router = express.Router();
const SimulatorController = require('../controllers/simulatorController');
const CommandApiController = require('../controllers/commandApiController');

// Simulator controls
router.post('/simulator/toggle', SimulatorController.toggle);
router.get('/simulator/status', SimulatorController.getStatus);

// Command queries & management
router.get('/commands', CommandApiController.getCommandHistory);
router.delete('/commands/expired', CommandApiController.purgeExpired);

module.exports = router;
