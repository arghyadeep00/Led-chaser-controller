const DeviceStateModel = require('../models/deviceStateModel');
const SettingsModel = require('../models/settingsModel');
const CommandModel = require('../models/commandModel');
const config = require('../config/env');

class DeviceService {
  /**
   * Get full dashboard overview status
   */
  static getDashboardStatus() {
    const deviceStatus = DeviceStateModel.getStatus();
    const commandStats = CommandModel.getStats();
    const recentCommands = CommandModel.getRecent(6);
    const telemetryHistory = DeviceStateModel.getTelemetryHistory(15);

    return {
      device: deviceStatus,
      commandStats,
      recentCommands,
      telemetryHistory,
      serverTime: new Date().toISOString(),
      offlineThresholdSeconds: config.OFFLINE_THRESHOLD_SECONDS
    };
  }

  /**
   * Record polling heartbeat from ESP32
   */
  static recordPollHeartbeat() {
    const now = new Date().toISOString();
    SettingsModel.set('last_device_poll', now);
  }

  /**
   * Update device settings
   */
  static updateSettings(settingsUpdates) {
    const allowedKeys = [
      'device_name',
      'device_id',
      'auto_interval_seconds',
      'default_speed_ms',
      'firmware_version'
    ];

    const safeUpdates = {};
    for (const key of allowedKeys) {
      if (settingsUpdates[key] !== undefined) {
        safeUpdates[key] = String(settingsUpdates[key]);
      }
    }

    return SettingsModel.setMultiple(safeUpdates);
  }
}

module.exports = DeviceService;
