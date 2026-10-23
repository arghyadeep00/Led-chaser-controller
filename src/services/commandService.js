const CommandModel = require('../models/commandModel');
const SettingsModel = require('../models/settingsModel');
const { getEffectById, getTotalEffects } = require('../config/effects');

const VALID_COMMANDS = [
  'on',
  'off',
  'next',
  'previous',
  'effect',
  'reset',
  'lock',
  'unlock',
  'speed',
  'auto_on',
  'auto_off',
  'automode'
];

class CommandService {
  /**
   * Validate command payload
   */
  static validateCommand(command, value) {
    if (!command || typeof command !== 'string') {
      return { valid: false, error: 'Command name is required and must be a string' };
    }

    const normalizedCmd = command.trim().toLowerCase();
    if (!VALID_COMMANDS.includes(normalizedCmd)) {
      return {
        valid: false,
        error: `Invalid command '${command}'. Allowed: ${VALID_COMMANDS.join(', ')}`
      };
    }

    let parsedValue = null;

    if (normalizedCmd === 'effect') {
      const effectNum = parseInt(value, 10);
      const total = getTotalEffects();
      if (isNaN(effectNum) || effectNum < 1 || effectNum > total) {
        return {
          valid: false,
          error: `Effect value must be an integer between 1 and ${total}`
        };
      }
      parsedValue = effectNum;
    } else if (normalizedCmd === 'speed') {
      const speedNum = parseInt(value, 10);
      if (isNaN(speedNum) || speedNum < 20 || speedNum > 2000) {
        return {
          valid: false,
          error: 'Speed value must be an integer between 20 ms and 2000 ms'
        };
      }
      parsedValue = speedNum;
    } else if (value !== null && value !== undefined && value !== '') {
      parsedValue = String(value);
    }

    return {
      valid: true,
      command: normalizedCmd,
      value: parsedValue
    };
  }

  /**
   * Submit a new command
   */
  static submitCommand({ command, value = null, origin = 'web_dashboard', customId = null }) {
    const validation = this.validateCommand(command, value);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const created = CommandModel.create({
      command: validation.command,
      value: validation.value,
      origin,
      customId
    });

    // Update in-memory state optimistically for immediate UI responsiveness
    const totalEffects = getTotalEffects();
    const currentEffect = parseInt(SettingsModel.get('current_effect', '1'), 10) || 1;

    switch (validation.command) {
      case 'on':
        SettingsModel.setMultiple({
          is_locked: 'true',
          led_states: '[1,1,1,1,1]'
        });
        break;
      case 'off':
        SettingsModel.setMultiple({
          is_locked: 'true',
          led_states: '[0,0,0,0,0]'
        });
        break;
      case 'next': {
        const nextEffect = currentEffect >= totalEffects ? 1 : currentEffect + 1;
        SettingsModel.setMultiple({
          current_effect: String(nextEffect),
          is_locked: 'false'
        });
        break;
      }
      case 'previous': {
        const prevEffect = currentEffect <= 1 ? totalEffects : currentEffect - 1;
        SettingsModel.setMultiple({
          current_effect: String(prevEffect),
          is_locked: 'false'
        });
        break;
      }
      case 'reset':
        SettingsModel.setMultiple({
          current_effect: '1',
          is_locked: 'false',
          auto_switching_enabled: 'false'
        });
        break;
      case 'lock':
        SettingsModel.set('is_locked', 'true');
        break;
      case 'unlock':
        SettingsModel.set('is_locked', 'false');
        break;
      case 'auto_on':
        SettingsModel.set('auto_switching_enabled', 'true');
        break;
      case 'auto_off':
        SettingsModel.set('auto_switching_enabled', 'false');
        break;
      case 'automode': {
        const isAuto = SettingsModel.get('auto_switching_enabled') === 'true';
        SettingsModel.set('auto_switching_enabled', isAuto ? 'false' : 'true');
        break;
      }
      case 'effect':
        if (validation.value) {
          SettingsModel.setMultiple({
            current_effect: String(validation.value),
            is_locked: 'false'
          });
        }
        break;
      case 'speed':
        if (validation.value) {
          SettingsModel.set('default_speed_ms', String(validation.value));
        }
        break;
    }

    return created;
  }

  /**
   * ESP32 Polling Handler:
   * Returns the next pending command, marks it delivered, or returns null/empty.
   */
  static pollNextCommand() {
    return CommandModel.fetchAndDeliverNextPending();
  }

  /**
   * ESP32 Acknowledgement Handler:
   * Acknowledges command receipt & execution by the ESP32.
   */
  static acknowledgeCommand(id, { success = true, errorMessage = null, deviceState = null } = {}) {
    if (!id) {
      throw new Error('Command ID is required for acknowledgement');
    }

    const command = CommandModel.acknowledge(id, { success, errorMessage });
    if (!command) {
      return null;
    }

    const now = new Date().toISOString();
    SettingsModel.set('last_device_ack', now);

    // Update settings if command executed successfully
    if (success) {
      const totalEffects = getTotalEffects();
      const currentEffect = parseInt(SettingsModel.get('current_effect', '1'), 10) || 1;

      if (command.command === 'effect' && command.value) {
        SettingsModel.set('current_effect', String(command.value));
      } else if (command.command === 'speed' && command.value) {
        SettingsModel.set('default_speed_ms', String(command.value));
      } else if (command.command === 'lock') {
        SettingsModel.set('is_locked', 'true');
      } else if (command.command === 'unlock') {
        SettingsModel.set('is_locked', 'false');
      } else if (command.command === 'auto_on') {
        SettingsModel.set('auto_switching_enabled', 'true');
      } else if (command.command === 'auto_off') {
        SettingsModel.set('auto_switching_enabled', 'false');
      } else if (command.command === 'automode') {
        const isAuto = SettingsModel.get('auto_switching_enabled') === 'true';
        SettingsModel.set('auto_switching_enabled', isAuto ? 'false' : 'true');
      } else if (command.command === 'reset') {
        SettingsModel.set('current_effect', '1');
        SettingsModel.set('is_locked', 'false');
      } else if (command.command === 'next') {
        const nextEffect = currentEffect >= totalEffects ? 1 : currentEffect + 1;
        SettingsModel.set('current_effect', String(nextEffect));
      } else if (command.command === 'previous') {
        const prevEffect = currentEffect <= 1 ? totalEffects : currentEffect - 1;
        SettingsModel.set('current_effect', String(prevEffect));
      } else if (command.command === 'on') {
        SettingsModel.setMultiple({ is_locked: 'true', led_states: '[1,1,1,1,1]' });
      } else if (command.command === 'off') {
        SettingsModel.setMultiple({ is_locked: 'true', led_states: '[0,0,0,0,0]' });
      }
    }

    return command;
  }

  /**
   * Get command history with pagination & filters
   */
  static getHistory(options) {
    return CommandModel.list(options);
  }

  /**
   * Get dashboard summary stats
   */
  static getStats() {
    return CommandModel.getStats();
  }
}

module.exports = CommandService;
