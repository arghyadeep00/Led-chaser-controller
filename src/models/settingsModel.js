const config = require('../config/env');

// Default initial settings
const defaultSettings = {
  device_name: 'ESP32 Living Room Chaser',
  device_id: config.DEVICE_ID || 'ESP32_CHASER_01',
  auto_switching_enabled: 'false',
  auto_interval_seconds: '10',
  default_speed_ms: '150',
  current_effect: '1',
  is_locked: 'false',
  firmware_version: 'v1.4.2-chaser',
  simulator_enabled: 'false',
  last_device_poll: '',
  last_device_ack: '',
  led_states: '[0,0,0,0,0]'
};

// In-Memory Settings Store (Zero Database Dependency)
let inMemorySettings = { ...defaultSettings };

class SettingsModel {
  /**
   * Get single setting value
   */
  static get(key, defaultValue = null) {
    return inMemorySettings[key] !== undefined ? inMemorySettings[key] : defaultValue;
  }

  /**
   * Set single setting value
   */
  static set(key, value) {
    const stringValue = String(value);
    inMemorySettings[key] = stringValue;
    return stringValue;
  }

  /**
   * Get all settings as an object map
   */
  static getAll() {
    return { ...inMemorySettings };
  }

  /**
   * Update multiple settings in one call
   */
  static setMultiple(updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null) {
        inMemorySettings[key] = String(value);
      }
    }
    return { ...inMemorySettings };
  }

  /**
   * Reset settings to initial defaults
   */
  static reset() {
    inMemorySettings = { ...defaultSettings };
    return { ...inMemorySettings };
  }
}

module.exports = SettingsModel;
