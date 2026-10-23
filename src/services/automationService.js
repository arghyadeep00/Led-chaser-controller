const SettingsModel = require('../models/settingsModel');
const CommandService = require('./commandService');
const { getTotalEffects } = require('../config/effects');

class AutomationService {
  /**
   * Get current automation configuration and status
   */
  static getAutomationConfig() {
    const settings = SettingsModel.getAll();
    const enabled = settings.auto_switching_enabled === 'true';
    const intervalSeconds = parseInt(settings.auto_interval_seconds, 10) || 10;
    const speedMs = parseInt(settings.default_speed_ms, 10) || 150;
    const currentEffect = parseInt(settings.current_effect, 10) || 1;

    return {
      enabled,
      intervalSeconds,
      speedMs,
      currentEffect,
      totalEffects: getTotalEffects(),
      firmwareCompatibility: {
        nativeHardwareAuto: {
          supported: true,
          description: "ESP32 built-in 10-second automatic effect switching cycle."
        },
        dynamicCustomInterval: {
          supported: false,
          requiresFirmwareUpdate: true,
          description: "Changing the cycle interval dynamically via API requires firmware v1.5+ (command: 'interval')."
        },
        cloudOrchestratedAuto: {
          supported: true,
          description: "Backend can schedule 'next' commands sequentially if device remains connected."
        }
      }
    };
  }

  /**
   * Update automation settings
   */
  static updateConfig({ enabled, intervalSeconds, speedMs }) {
    const updates = {};

    if (enabled !== undefined) {
      const isEnabled = enabled === true || enabled === 'true' || enabled === '1' || enabled === 1;
      updates.auto_switching_enabled = isEnabled ? 'true' : 'false';

      // Submit command for ESP32
      try {
        CommandService.submitCommand({
          command: isEnabled ? 'auto_on' : 'auto_off',
          origin: 'automation'
        });
      } catch (err) {
        console.warn('Could not queue auto command:', err.message);
      }
    }

    if (intervalSeconds !== undefined) {
      const parsedInterval = parseInt(intervalSeconds, 10);
      if (!isNaN(parsedInterval) && parsedInterval >= 3 && parsedInterval <= 300) {
        updates.auto_interval_seconds = String(parsedInterval);
      }
    }

    if (speedMs !== undefined) {
      const parsedSpeed = parseInt(speedMs, 10);
      if (!isNaN(parsedSpeed) && parsedSpeed >= 20 && parsedSpeed <= 2000) {
        updates.default_speed_ms = String(parsedSpeed);
        try {
          CommandService.submitCommand({
            command: 'speed',
            value: parsedSpeed,
            origin: 'automation'
          });
        } catch (err) {
          console.warn('Could not queue speed command:', err.message);
        }
      }
    }

    SettingsModel.setMultiple(updates);
    return this.getAutomationConfig();
  }
}

module.exports = AutomationService;
