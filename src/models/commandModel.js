const config = require('../config/env');
const crypto = require('crypto');

// In-Memory Commands Storage (Zero Database Dependency)
let commands = [];

class CommandModel {
  /**
   * Create a new command in the in-memory queue
   */
  static create({ command, value = null, origin = 'web_dashboard', customId = null }) {
    const id = customId || `cmd_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const stringValue = value !== null && value !== undefined ? String(value) : null;

    const newCommand = {
      id,
      command,
      value: stringValue,
      status: 'pending',
      origin,
      error_message: null,
      created_at: now,
      delivered_at: null,
      acknowledged_at: null
    };

    commands.push(newCommand);

    // Keep reasonable history size in memory (last 200 commands)
    if (commands.length > 200) {
      commands = commands.slice(-200);
    }

    return { ...newCommand };
  }

  /**
   * Direct creation with explicit fields (used for tests and migrations)
   */
  static createDirect({ id, command, value = null, status = 'pending', origin = 'test', created_at = null }) {
    const stringValue = value !== null && value !== undefined ? String(value) : null;
    const cmd = {
      id: id || `cmd_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      command,
      value: stringValue,
      status: status || 'pending',
      origin: origin || 'test',
      error_message: null,
      created_at: created_at || new Date().toISOString(),
      delivered_at: null,
      acknowledged_at: null
    };
    commands.push(cmd);
    return { ...cmd };
  }

  /**
   * Find a command by unique ID
   */
  static findById(id) {
    const found = commands.find(c => c.id === id);
    return found ? { ...found } : null;
  }

  /**
   * Expire stale pending commands older than timeout threshold
   */
  static expireStaleCommands(timeoutSeconds = config.COMMAND_TIMEOUT_SECONDS) {
    const cutoffTime = Date.now() - timeoutSeconds * 1000;
    let expiredCount = 0;

    for (const cmd of commands) {
      if (cmd.status === 'pending' && new Date(cmd.created_at).getTime() < cutoffTime) {
        cmd.status = 'expired';
        cmd.error_message = 'Command expired in queue: device was offline or did not poll in time';
        expiredCount++;
      }
    }

    return expiredCount;
  }

  /**
   * Fetch the next pending command for ESP32 polling.
   * Marks it as 'delivered' so it won't be returned repeatedly.
   */
  static fetchAndDeliverNextPending() {
    this.expireStaleCommands();

    const pending = commands.find(c => c.status === 'pending');
    if (!pending) {
      return null;
    }

    const now = new Date().toISOString();
    pending.status = 'delivered';
    pending.delivered_at = now;

    return { ...pending };
  }

  /**
   * Acknowledge command execution from ESP32
   */
  static acknowledge(id, { success = true, errorMessage = null } = {}) {
    const cmd = commands.find(c => c.id === id);
    if (!cmd) {
      return null;
    }

    const now = new Date().toISOString();
    cmd.status = success ? 'acknowledged' : 'failed';
    cmd.acknowledged_at = now;
    cmd.error_message = errorMessage || null;

    return { ...cmd };
  }

  /**
   * Get recent commands for dashboard overview
   */
  static getRecent(limit = 6) {
    return [...commands].reverse().slice(0, limit);
  }

  /**
   * Filter and paginate commands for history page
   */
  static list({ status = null, search = null, page = 1, limit = 10 } = {}) {
    this.expireStaleCommands();

    let filtered = [...commands].reverse();

    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(c =>
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.command && c.command.toLowerCase().includes(q)) ||
        (c.value && c.value.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    const items = filtered.slice(offset, offset + limitNum);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  /**
   * Aggregate statistics for charts & telemetry cards
   */
  static getStats() {
    let acknowledged = 0;
    let delivered = 0;
    let pending = 0;
    let expired = 0;
    let failed = 0;

    for (const c of commands) {
      if (c.status === 'acknowledged') acknowledged++;
      else if (c.status === 'delivered') delivered++;
      else if (c.status === 'pending') pending++;
      else if (c.status === 'expired') expired++;
      else if (c.status === 'failed') failed++;
    }

    return {
      total: commands.length,
      acknowledged,
      delivered,
      pending,
      expired,
      failed
    };
  }

  /**
   * Purge expired commands
   */
  static purgeExpired() {
    const before = commands.length;
    commands = commands.filter(c => c.status !== 'expired');
    return before - commands.length;
  }

  /**
   * Clear all commands (used by tests & resets)
   */
  static clear() {
    commands = [];
  }
}

module.exports = CommandModel;
