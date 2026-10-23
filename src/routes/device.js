const express = require('express');
const router = express.Router();
const DeviceApiController = require('../controllers/deviceApiController');
const CommandApiController = require('../controllers/commandApiController');
const { verifyDeviceApiKey } = require('../middleware/auth');
const { commandLimiter } = require('../middleware/rateLimiter');

// Device status
router.get('/status', DeviceApiController.getStatus);

// Command API
router.post('/command', commandLimiter, CommandApiController.submitCommand);
router.get('/command', verifyDeviceApiKey, CommandApiController.pollCommand);
router.post('/ack', verifyDeviceApiKey, CommandApiController.acknowledgeCommand);

// Telemetry & settings
router.post('/heartbeat', verifyDeviceApiKey, DeviceApiController.recordHeartbeat);
router.put('/settings', DeviceApiController.updateSettings);

module.exports = router;
