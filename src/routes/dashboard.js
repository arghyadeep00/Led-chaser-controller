const express = require('express');
const router = express.Router();
const DeviceApiController = require('../controllers/deviceApiController');

router.get('/dashboard', DeviceApiController.getDashboard);

module.exports = router;
