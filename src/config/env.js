require('dotenv').config();

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEVICE_API_KEY: process.env.DEVICE_API_KEY || 'esp32_glow_secret_key_9281',
  DEVICE_ID: process.env.DEVICE_ID || 'ESP32_CHASER_01',
  COMMAND_TIMEOUT_SECONDS: parseInt(process.env.COMMAND_TIMEOUT_SECONDS, 10) || 60,
  OFFLINE_THRESHOLD_SECONDS: parseInt(process.env.OFFLINE_THRESHOLD_SECONDS, 10) || 15,
  DATABASE_PATH: process.env.DATABASE_PATH || './database/glowcontrol.sqlite',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
};
