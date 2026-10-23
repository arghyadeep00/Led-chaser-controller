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

// Handle port collision gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[FATAL] Port ${config.PORT} is already in use by another process.`);
    console.error(`Free port ${config.PORT} with: sudo fuser -k ${config.PORT}/tcp`);
    console.error(`Or start on a different port: PORT=${config.PORT + 1} npm start\n`);
    process.exit(1);
  } else {
    throw err;
  }
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
