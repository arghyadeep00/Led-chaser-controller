const DeviceService = require('../services/deviceService');
const CommandService = require('../services/commandService');
const AutomationService = require('../services/automationService');
const { EFFECTS, GPIO_MAP } = require('../config/effects');
const SettingsModel = require('../models/settingsModel');

class PageController {
  /**
   * GET / — Overview dashboard
   */
  static async renderOverview(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      res.render('pages/overview', {
        title: 'Overview — GlowControl Dashboard',
        currentPage: 'overview',
        ...data,
        gpioMap: GPIO_MAP
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /controller — Interactive LED control page
   */
  static async renderController(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      res.render('pages/controller', {
        title: 'LED Controller — GlowControl',
        currentPage: 'controller',
        device: data.device,
        effects: EFFECTS,
        gpioMap: GPIO_MAP
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /effects — 50-effect library
   */
  static async renderEffects(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      const categories = ['All', 'Chase', 'Flash', 'Fill', 'Pulse', 'Pattern', 'Dynamic', 'Static'];
      res.render('pages/effects', {
        title: 'Effects Library (50 Effects) — GlowControl',
        currentPage: 'effects',
        effects: EFFECTS,
        categories,
        device: data.device,
        gpioMap: GPIO_MAP
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /automation — Automation settings
   */
  static async renderAutomation(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      const automation = AutomationService.getAutomationConfig();
      res.render('pages/automation', {
        title: 'Automation & Scheduling — GlowControl',
        currentPage: 'automation',
        device: data.device,
        automation
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /history — Command history and lifecycle
   */
  static async renderHistory(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      const page = parseInt(req.query.page, 10) || 1;
      const status = req.query.status || 'all';
      const search = req.query.search || '';

      const historyData = CommandService.getHistory({
        page,
        status,
        search,
        limit: 12
      });

      res.render('pages/history', {
        title: 'Command History — GlowControl',
        currentPage: 'history',
        device: data.device,
        history: historyData,
        currentFilter: status,
        searchQuery: search
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /settings — Device settings & firmware integration
   */
  static async renderSettings(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      const settings = SettingsModel.getAll();
      res.render('pages/settings', {
        title: 'Device Settings & Integration — GlowControl',
        currentPage: 'settings',
        device: data.device,
        settings,
        gpioMap: GPIO_MAP
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PageController;
