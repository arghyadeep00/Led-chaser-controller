const CommandService = require('../services/commandService');
const DeviceService = require('../services/deviceService');

class CommandApiController {
  /**
   * POST /api/device/command
   * Submit new command from dashboard or external client
   */
  static submitCommand(req, res, next) {
    try {
      const { command, value, id: customId, origin = 'web_dashboard' } = req.body;

      if (!command) {
        return res.status(400).json({
          success: false,
          error: "Missing required 'command' field in request body"
        });
      }

      const created = CommandService.submitCommand({
        command,
        value,
        origin,
        customId
      });
      
      res.status(201).json({
        success: true,
        message: 'Command submitted to queue (pending ESP32 delivery)',
        data: created
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * GET /api/device/command
   * Polling endpoint called by ESP32 firmware every 1000ms
   */
  static pollCommand(req, res, next) {
    try {
      // Record poll activity from hardware
      DeviceService.recordPollHeartbeat();

      const pendingCommand = CommandService.pollNextCommand();

      if (!pendingCommand) {
        // Return explicit empty response to prevent firmware re-executing stale commands
        return res.status(200).json({
          command: null,
          id: null,
          value: null
        });
      }

      // Format response according to ESP32 firmware expectations
      let parsedValue = pendingCommand.value;
      if (parsedValue !== null && !isNaN(Number(parsedValue))) {
        parsedValue = Number(parsedValue);
      }

      res.status(200).json({
        id: pendingCommand.id,
        command: pendingCommand.command,
        value: parsedValue
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/device/ack
   * ESP32 acknowledgement endpoint after executing a command
   */
  static acknowledgeCommand(req, res, next) {
    try {
      const { id, status, success = true, errorMessage = null } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Missing required 'id' field for command acknowledgement"
        });
      }

      const isSuccess = success === true || status === 'executed' || status === 'success';

      const acknowledged = CommandService.acknowledgeCommand(id, {
        success: isSuccess,
        errorMessage
      });

      if (!acknowledged) {
        return res.status(404).json({
          success: false,
          error: `Command with ID '${id}' not found in database`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Command acknowledgement recorded',
        data: acknowledged
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/commands
   * Filtered & paginated command history for live dashboard polling
   */
  static getCommandHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const status = req.query.status || 'all';
      const search = req.query.search || '';
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = CommandService.getHistory({ page, status, search, limit });
      const stats = CommandService.getStats();

      res.status(200).json({
        success: true,
        data: result,
        stats
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/commands/expired
   * Purge expired commands
   */
  static purgeExpired(req, res, next) {
    try {
      const CommandModel = require('../models/commandModel');
      const count = CommandModel.purgeExpired();
      res.status(200).json({
        success: true,
        purgedCount: count
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CommandApiController;
