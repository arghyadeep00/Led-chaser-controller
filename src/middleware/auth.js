const config = require('../config/env');

/**
 * Optional/Configurable authentication for ESP32 hardware endpoints
 * Supports 'X-API-Key' header or query param 'apiKey'
 */
function verifyDeviceApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  // If in strict mode or header is provided, enforce verification
  if (process.env.REQUIRE_DEVICE_AUTH === 'true') {
    if (!apiKey || apiKey !== config.DEVICE_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing device API key in X-API-Key header'
      });
    }
  }

  // Attach auth status to request
  req.isDeviceAuthenticated = apiKey === config.DEVICE_API_KEY;
  next();
}

module.exports = {
  verifyDeviceApiKey
};
