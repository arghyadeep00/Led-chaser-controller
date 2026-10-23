const AutomationService = require('../services/automationService');

class AutomationApiController {
  /**
   * GET /api/automation
   */
  static getConfig(req, res, next) {
    try {
      const config = AutomationService.getAutomationConfig();
      res.status(200).json({
        success: true,
        data: config
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/automation
   */
  static updateConfig(req, res, next) {
    try {
      const { enabled, intervalSeconds, speedMs } = req.body;
      const updated = AutomationService.updateConfig({ enabled, intervalSeconds, speedMs });
      res.status(200).json({
        success: true,
        message: 'Automation settings updated',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AutomationApiController;
