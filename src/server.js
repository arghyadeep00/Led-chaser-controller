const app = require('./app');
const config = require('./config/env');
const simulator = require('./services/simulatorService');

const server = app.listen(config.PORT, () => {
  console.log('====================================================');
  console.log(` GlowControl ESP32 Dashboard Server Running`);
  console.log(` URL: http://localhost:${config.PORT}`);
  console.log(` Environment: ${config.NODE_ENV}`);
  console.log(` Device ID: ${config.DEVICE_ID}`);
  console.log(` Simulator Status: ${simulator.isEnabled() ? 'ACTIVE (Demo Mode)' : 'IDLE (Waiting for device)'}`);
  console.log('====================================================');
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully stopping server...`);
  simulator.stop();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
