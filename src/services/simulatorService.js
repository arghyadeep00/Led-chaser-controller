const SettingsModel = require('../models/settingsModel');
const CommandService = require('./commandService');
const DeviceStateModel = require('../models/deviceStateModel');
const { EFFECTS, getTotalEffects } = require('../config/effects');

class SimulatorService {
  constructor() {
    this.intervalHandle = null;
    this.frameIndex = 0;
    this.lastFrameTime = 0;
    this.lastAutoSwitchTime = Date.now();
    this.virtualLeds = [0, 0, 0, 0, 0];
  }

  /**
   * Check if simulator is currently enabled in settings
   */
  isEnabled() {
    return SettingsModel.get('simulator_enabled') === 'true';
  }

  /**
   * Start or resume simulation loop
   */
  start() {
    if (this.intervalHandle) return;

    SettingsModel.set('simulator_enabled', 'true');
    console.log('[Simulator] Virtual ESP32 started (Demo Mode)');

    // Virtual ESP32 poll loop (runs every 1000ms just like real firmware)
    this.intervalHandle = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Stop simulation loop
   */
  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    SettingsModel.set('simulator_enabled', 'false');
    console.log('[Simulator] Virtual ESP32 stopped');
  }

  /**
   * Toggle simulator state
   */
  toggle() {
    if (this.isEnabled()) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  /**
   * Single simulation tick (executes polling, command execution, LED stepping)
   */
  tick() {
    try {
      const settings = SettingsModel.getAll();
      let currentEffectId = parseInt(settings.current_effect, 10) || 1;
      let speedMs = parseInt(settings.default_speed_ms, 10) || 150;
      let isLocked = settings.is_locked === 'true';
      let autoMode = settings.auto_switching_enabled === 'true';
      let autoInterval = (parseInt(settings.auto_interval_seconds, 10) || 10) * 1000;
      const totalEffects = getTotalEffects();

      // 1. Poll for pending commands (simulating ESP32 HTTP GET /api/device/command)
      const command = CommandService.pollNextCommand();

      if (command) {
        console.log(`[Simulator] ESP32 received command: ${command.command} (value: ${command.value || 'none'})`);

        // Execute command
        switch (command.command) {
          case 'on':
            this.virtualLeds = [1, 1, 1, 1, 1];
            isLocked = true;
            break;
          case 'off':
            this.virtualLeds = [0, 0, 0, 0, 0];
            isLocked = true;
            break;
          case 'next':
            currentEffectId = currentEffectId >= totalEffects ? 1 : currentEffectId + 1;
            this.frameIndex = 0;
            break;
          case 'previous':
            currentEffectId = currentEffectId <= 1 ? totalEffects : currentEffectId - 1;
            this.frameIndex = 0;
            break;
          case 'effect':
            if (command.value) {
              currentEffectId = parseInt(command.value, 10);
              this.frameIndex = 0;
            }
            break;
          case 'reset':
            currentEffectId = 1;
            this.frameIndex = 0;
            isLocked = false;
            break;
          case 'lock':
            isLocked = true;
            break;
          case 'unlock':
            isLocked = false;
            break;
          case 'speed':
            if (command.value) {
              speedMs = parseInt(command.value, 10);
            }
            break;
          case 'auto_on':
            autoMode = true;
            this.lastAutoSwitchTime = Date.now();
            break;
          case 'auto_off':
            autoMode = false;
            break;
          case 'automode':
            autoMode = !autoMode;
            this.lastAutoSwitchTime = Date.now();
            break;
        }

        // 2. Acknowledge command execution
        CommandService.acknowledgeCommand(command.id, {
          success: true
        });
      }

      // 3. Auto switching logic
      const now = Date.now();
      if (autoMode && !isLocked && now - this.lastAutoSwitchTime >= autoInterval) {
        currentEffectId = currentEffectId >= totalEffects ? 1 : currentEffectId + 1;
        this.frameIndex = 0;
        this.lastAutoSwitchTime = now;
      }

      // 4. Update virtual LED states based on active effect pattern
      if (!isLocked) {
        const effectMeta = EFFECTS.find(e => e.id === currentEffectId);
        if (effectMeta && effectMeta.frames && effectMeta.frames.length > 0) {
          this.frameIndex = (this.frameIndex + 1) % effectMeta.frames.length;
          this.virtualLeds = effectMeta.frames[this.frameIndex];
        }
      }

      // 5. Record simulated telemetry
      DeviceStateModel.recordTelemetry({
        deviceId: settings.device_id || 'ESP32_SIMULATOR',
        wifiConnected: 1,
        currentEffect: currentEffectId,
        speedMs: speedMs,
        autoMode: autoMode ? 1 : 0,
        isLocked: isLocked ? 1 : 0,
        ledStates: this.virtualLeds,
        freeHeap: 215000 + Math.floor(Math.sin(now / 5000) * 1500),
        rssi: -58 + Math.floor(Math.cos(now / 10000) * 4),
        isSimulated: 1
      });
    } catch (err) {
      console.error('[Simulator] Tick error:', err);
    }
  }
}

// Singleton instance
const simulatorInstance = new SimulatorService();

// Resume if was enabled previously
if (SettingsModel.get('simulator_enabled') === 'true') {
  simulatorInstance.start();
}

module.exports = simulatorInstance;
