const config = require('../config/env');
const SettingsModel = require('./settingsModel');
const { getEffectById } = require('../config/effects');

// In-Memory Telemetry History (Zero Database Dependency)
let telemetryHistory = [];

class DeviceStateModel {
  /**
   * Determine device connectivity status and return full telemetry state
   */
  static getStatus() {
    const settings = SettingsModel.getAll();
    const isSimulated = settings.simulator_enabled === 'true';

    const lastPollStr = settings.last_device_poll;
    const lastAckStr = settings.last_device_ack;

    const lastPollTime = lastPollStr ? new Date(lastPollStr).getTime() : 0;
    const lastAckTime = lastAckStr ? new Date(lastAckStr).getTime() : 0;
    const latestCommTime = Math.max(lastPollTime, lastAckTime);

    const now = Date.now();
    const diffSeconds = latestCommTime > 0 ? Math.floor((now - latestCommTime) / 1000) : null;

    let isOnline = false;
    let statusLabel = 'Offline';
    let wifiStatus = 'Disconnected';

    if (isSimulated) {
      isOnline = true;
      statusLabel = 'Simulated Online';
      wifiStatus = 'Connected (Simulated)';
    } else if (diffSeconds !== null && diffSeconds <= config.OFFLINE_THRESHOLD_SECONDS) {
      isOnline = true;
      statusLabel = 'Online';
      wifiStatus = 'Connected';
    } else if (latestCommTime === 0) {
      statusLabel = 'Never Connected';
      wifiStatus = 'Unknown';
    } else {
      statusLabel = 'Offline';
      wifiStatus = 'Disconnected';
    }

    const currentEffectId = parseInt(settings.current_effect, 10) || 1;
    const effectMeta = getEffectById(currentEffectId);

    let ledStates = [0, 0, 0, 0, 0];
    try {
      if (settings.led_states) {
        ledStates = JSON.parse(settings.led_states);
      }
    } catch {
      ledStates = [0, 0, 0, 0, 0];
    }

    return {
      isOnline,
      statusLabel,
      isSimulated,
      wifiStatus,
      lastSeenSecondsAgo: diffSeconds,
      lastCommunicationTime: latestCommTime > 0 ? new Date(latestCommTime).toISOString() : null,
      currentEffectId,
      currentEffectName: effectMeta ? effectMeta.name : 'Unknown Effect',
      currentEffectCategory: effectMeta ? effectMeta.category : 'General',
      speedMs: parseInt(settings.default_speed_ms, 10) || 150,
      autoMode: settings.auto_switching_enabled === 'true',
      autoIntervalSeconds: parseInt(settings.auto_interval_seconds, 10) || 10,
      isLocked: settings.is_locked === 'true',
      firmwareVersion: settings.firmware_version || 'v1.4.2-chaser',
      deviceName: settings.device_name || 'ESP32 Living Room Chaser',
      deviceId: settings.device_id || config.DEVICE_ID,
      ledStates,
      pollingIntervalMs: 1000,
      commandTimeoutSeconds: config.COMMAND_TIMEOUT_SECONDS
    };
  }

  /**
   * Record telemetry update from device or simulator (in memory)
   */
  static recordTelemetry({
    deviceId = config.DEVICE_ID,
    wifiConnected = 1,
    currentEffect = 1,
    speedMs = 150,
    autoMode = 0,
    isLocked = 0,
    ledStates = [0, 0, 0, 0, 0],
    freeHeap = 214500,
    rssi = -65,
    isSimulated = 0
  } = {}) {
    const now = new Date().toISOString();
    const ledJson = Array.isArray(ledStates) ? JSON.stringify(ledStates) : String(ledStates);

    telemetryHistory.push({
      current_effect: currentEffect,
      speed_ms: speedMs,
      free_heap: freeHeap,
      rssi: rssi,
      is_simulated: isSimulated ? 1 : 0,
      timestamp: now
    });

    // Keep last 50 telemetry points in memory
    if (telemetryHistory.length > 50) {
      telemetryHistory = telemetryHistory.slice(-50);
    }

    // Also update settings cache
    SettingsModel.setMultiple({
      current_effect: currentEffect,
      default_speed_ms: speedMs,
      auto_switching_enabled: autoMode ? 'true' : 'false',
      is_locked: isLocked ? 'true' : 'false',
      led_states: ledJson,
      last_device_poll: now
    });
  }

  /**
   * Get historical telemetry points for dashboard activity chart
   */
  static getTelemetryHistory(limit = 20) {
    return telemetryHistory.slice(-limit);
  }

  /**
   * Clear telemetry history (used by tests & resets)
   */
  static clearHistory() {
    telemetryHistory = [];
  }
}

module.exports = DeviceStateModel;
