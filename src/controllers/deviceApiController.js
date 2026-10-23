const DeviceService = require('../services/deviceService');
const DeviceStateModel = require('../models/deviceStateModel');
const { EFFECTS, GPIO_MAP } = require('../config/effects');

class DeviceApiController {
  /**
   * GET /api/dashboard
   * Full aggregated dashboard state
   */
  static getDashboard(req, res, next) {
    try {
      const data = DeviceService.getDashboardStatus();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/device/status
   * Real-time connectivity and telemetry status
   */
  static getStatus(req, res, next) {
    try {
      const status = DeviceStateModel.getStatus();
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/effects
   * List all 50 effects
   */
  static getEffects(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        total: EFFECTS.length,
        data: EFFECTS,
        gpioMap: GPIO_MAP
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/device/heartbeat
   * Hardware telemetry reporting (optional extension for ESP32 firmware)
   */
  static recordHeartbeat(req, res, next) {
    try {
      const {
        deviceId,
        wifiConnected = 1,
        currentEffect = 1,
        speedMs = 150,
        autoMode = 0,
        isLocked = 0,
        ledStates = [0, 0, 0, 0, 0],
        freeHeap = 210000,
        rssi = -65
      } = req.body;

      DeviceStateModel.recordTelemetry({
        deviceId,
        wifiConnected,
        currentEffect,
        speedMs,
        autoMode,
        isLocked,
        ledStates,
        freeHeap,
        rssi,
        isSimulated: 0
      });

      res.status(200).json({
        success: true,
        message: 'Telemetry heartbeat recorded successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/device/settings
   * Update device settings
   */
  static updateSettings(req, res, next) {
    try {
      const updated = DeviceService.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: 'Device settings updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DeviceApiController;
