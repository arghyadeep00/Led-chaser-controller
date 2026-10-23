/**
 * Database Module (Zero SQLite Dependency Shim)
 * Database functionality has been removed per simplification requirements.
 * All state is managed efficiently in-memory.
 */
const CommandModel = require('../models/commandModel');
const SettingsModel = require('../models/settingsModel');

module.exports = {
  isDatabaseEnabled: false,

  // Compatibility execution helper for legacy test calls like DELETE FROM commands
  exec(sql) {
    if (sql && typeof sql === 'string') {
      if (sql.includes('DELETE FROM commands')) {
        CommandModel.clear();
      }
      if (sql.includes('settings')) {
        SettingsModel.reset();
      }
    }
  },

  // Prepared statement compatibility stub
  prepare(sql) {
    return {
      run(...args) {
        if (sql && sql.includes('INSERT INTO commands')) {
          const [id, command, value, status, origin, created_at] = args;
          CommandModel.createDirect({
            id,
            command,
            value,
            status,
            origin,
            created_at
          });
          return { changes: 1 };
        }
        return { changes: 0, lastInsertRowid: 0 };
      },
      get() {
        return null;
      },
      all() {
        return [];
      }
    };
  }
};
