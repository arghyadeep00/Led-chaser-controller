const simulator = require('../services/simulatorService');
const DeviceStateModel = require('../models/deviceStateModel');

class SimulatorController {
  /**
   * POST /api/simulator/toggle
   * Toggle virtual ESP32 demo mode
   */
  static toggle(req, res, next) {
    try {
      const isRunning = simulator.toggle();
      const status = DeviceStateModel.getStatus();

      res.status(200).json({
        success: true,
        isSimulated: isRunning,
        message: isRunning
          ? 'Virtual ESP32 Simulator started (Demo Mode active)'
          : 'Virtual ESP32 Simulator stopped (Real device polling awaited)',
        data: status
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/simulator/status
   */
  static getStatus(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        isSimulated: simulator.isEnabled()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SimulatorController;
