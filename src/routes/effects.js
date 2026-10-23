const express = require('express');
const router = express.Router();
const DeviceApiController = require('../controllers/deviceApiController');

router.get('/effects', DeviceApiController.getEffects);

module.exports = router;
