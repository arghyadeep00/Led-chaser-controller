const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// Ensure test environment uses in-memory DB or test DB
process.env.DATABASE_PATH = './database/test_glowcontrol.sqlite';
process.env.NODE_ENV = 'test';

const CommandService = require('../src/services/commandService');
const CommandModel = require('../src/models/commandModel');
const db = require('../src/config/database');

describe('Command Validation & Queue Integrity Tests', () => {

  beforeEach(() => {
    // Clear commands table before each test
    db.exec('DELETE FROM commands');
  });

  describe('1. Command Input Validation', () => {
    it('should validate allowed basic commands (on, off, next, previous, reset, lock, unlock, automode)', () => {
      const basicCommands = ['on', 'off', 'next', 'previous', 'reset', 'lock', 'unlock', 'auto_on', 'auto_off', 'automode'];
      for (const cmd of basicCommands) {
        const result = CommandService.validateCommand(cmd, null);
        assert.equal(result.valid, true, `Expected command '${cmd}' to be valid`);
        assert.equal(result.command, cmd);
      }
    });

    it('should validate effect command within 1 to 50 range', () => {
      const validCases = [1, 25, 50, '1', '50'];
      for (const val of validCases) {
        const result = CommandService.validateCommand('effect', val);
        assert.equal(result.valid, true, `Expected effect ${val} to be valid`);
        assert.equal(typeof result.value, 'number');
        assert.equal(result.value, parseInt(val, 10));
      }
    });

    it('should reject effect command outside 1 to 50 range', () => {
      const invalidCases = [0, 51, -5, 100, 'abc', null, ''];
      for (const val of invalidCases) {
        const result = CommandService.validateCommand('effect', val);
        assert.equal(result.valid, false, `Expected effect ${val} to be invalid`);
        assert.match(result.error, /Effect value must be an integer between 1 and 50/);
      }
    });

    it('should validate speed command within 20 ms to 2000 ms range', () => {
      const validSpeeds = [20, 150, 500, 2000, '20', '2000'];
      for (const spd of validSpeeds) {
        const result = CommandService.validateCommand('speed', spd);
        assert.equal(result.valid, true, `Expected speed ${spd} to be valid`);
        assert.equal(result.value, parseInt(spd, 10));
      }
    });

    it('should reject speed command outside 20 ms to 2000 ms range', () => {
      const invalidSpeeds = [10, 19, 2001, 5000, -100, 'fast', null];
      for (const spd of invalidSpeeds) {
        const result = CommandService.validateCommand('speed', spd);
        assert.equal(result.valid, false, `Expected speed ${spd} to be invalid`);
        assert.match(result.error, /Speed value must be an integer between 20 ms and 2000 ms/);
      }
    });

    it('should reject unknown command names', () => {
      const result = CommandService.validateCommand('super_chase', null);
      assert.equal(result.valid, false);
      assert.match(result.error, /Invalid command 'super_chase'/);
    });
  });

  describe('2. Command Delivery & Protection Against Duplicate Processing', () => {
    it('should enqueue a command with pending status', () => {
      const cmd = CommandService.submitCommand({
        command: 'effect',
        value: 14,
        origin: 'web_dashboard'
      });

      assert.ok(cmd.id);
      assert.equal(cmd.command, 'effect');
      assert.equal(cmd.value, '14');
      assert.equal(cmd.status, 'pending');
      assert.ok(cmd.created_at);
      assert.equal(cmd.delivered_at, null);
      assert.equal(cmd.acknowledged_at, null);
    });

    it('should fetch and deliver pending command, preventing duplicate delivery on subsequent polls', () => {
      // 1. Enqueue two commands
      const cmd1 = CommandService.submitCommand({ command: 'effect', value: 5 });
      const cmd2 = CommandService.submitCommand({ command: 'speed', value: 200 });

      // 2. First ESP32 poll should deliver cmd1
      const polled1 = CommandService.pollNextCommand();
      assert.ok(polled1);
      assert.equal(polled1.id, cmd1.id);
      assert.equal(polled1.status, 'delivered');
      assert.ok(polled1.delivered_at);

      // 3. Second ESP32 poll should deliver cmd2 (NOT cmd1 again!)
      const polled2 = CommandService.pollNextCommand();
      assert.ok(polled2);
      assert.equal(polled2.id, cmd2.id);
      assert.equal(polled2.status, 'delivered');

      // 4. Third poll should return null (queue is clear, no repeated commands)
      const polled3 = CommandService.pollNextCommand();
      assert.equal(polled3, null, 'Expected no duplicate commands when queue is exhausted');
    });

    it('should correctly acknowledge command execution by ESP32', () => {
      const cmd = CommandService.submitCommand({ command: 'on' });
      const delivered = CommandService.pollNextCommand();
      assert.equal(delivered.id, cmd.id);

      const acked = CommandService.acknowledgeCommand(cmd.id, { success: true });
      assert.ok(acked);
      assert.equal(acked.status, 'acknowledged');
      assert.ok(acked.acknowledged_at);

      // Verify in DB directly
      const fromDb = CommandModel.findById(cmd.id);
      assert.equal(fromDb.status, 'acknowledged');
    });
  });

  describe('3. Command Queue Expiration Policy', () => {
    it('should expire stale commands older than the timeout threshold', () => {
      // Create a command artificially in the past
      const id = 'cmd_stale_test';
      const pastTime = new Date(Date.now() - 120 * 1000).toISOString(); // 120 seconds ago

      db.prepare(`
        INSERT INTO commands (id, command, value, status, origin, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, 'effect', '7', 'pending', 'test', pastTime);

      // Run expiration with 60s threshold
      const expiredCount = CommandModel.expireStaleCommands(60);
      assert.equal(expiredCount, 1);

      const staleCmd = CommandModel.findById(id);
      assert.equal(staleCmd.status, 'expired');
      assert.match(staleCmd.error_message, /expired in queue/i);

      // Polling should NOT return expired commands
      const polled = CommandService.pollNextCommand();
      assert.equal(polled, null);
    });
  });

});
