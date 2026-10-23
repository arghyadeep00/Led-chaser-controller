const express = require('express');
const router = express.Router();
const PageController = require('../controllers/pageController');

router.get('/', PageController.renderOverview);
router.get('/controller', PageController.renderController);
router.get('/effects', PageController.renderEffects);
router.get('/automation', PageController.renderAutomation);
router.get('/history', PageController.renderHistory);
router.get('/settings', PageController.renderSettings);

module.exports = router;
