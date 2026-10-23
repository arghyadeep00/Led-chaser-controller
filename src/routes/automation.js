const express = require('express');
const router = express.Router();
const AutomationApiController = require('../controllers/automationApiController');

router.get('/automation', AutomationApiController.getConfig);
router.post('/automation', AutomationApiController.updateConfig);

module.exports = router;
