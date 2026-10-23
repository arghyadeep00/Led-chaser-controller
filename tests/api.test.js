const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.PORT = '3099';
process.env.DATABASE_PATH = './database/test_api_glowcontrol.sqlite';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
let server;

function makeRequest(path, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3099,
      path,
      method,
      headers: {
        ...headers
      }
    };

    if (body) {
      if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
      }
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          text: rawData
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

describe('HTTP REST API Integration Tests', () => {
  before((done) => {
    server = app.listen(3099, done);
  });

  after((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  it('GET / should render the Overview HTML page', async () => {
    const res = await makeRequest('/');
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /GlowControl/);
    assert.match(res.text, /5-LED Hardware Bus/);
  });

  it('GET /controller should render the LED Controller HTML page', async () => {
    const res = await makeRequest('/controller');
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Hardware Control Panel/);
    assert.match(res.text, /Animation Speed/);
  });

  it('GET /effects should render the Effects Library HTML page', async () => {
    const res = await makeRequest('/effects');
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Effects Library/);
    assert.match(res.text, /Knight Rider/);
  });

  it('GET /automation should render the Automation HTML page', async () => {
    const res = await makeRequest('/automation');
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Automation & Scheduling/);
    assert.match(res.text, /Firmware Compatibility Matrix/);
  });

  it('GET /history should render the Command History HTML page', async () => {
    const res = await makeRequest('/history');
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Command History/);
    assert.match(res.text, /Command Lifecycle/);
  });

  it('GET /settings should render the Device Settings HTML page', async () => {
    const res = await makeRequest('/settings');
    assert.equal(res.statusCode, 200);
    assert.match(res.text, /Device Settings/);
    assert.match(res.text, /Firmware Integration Guide/);
  });

  it('GET /api/effects should return all 50 effects in JSON', async () => {
    const res = await makeRequest('/api/effects');
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.total, 50);
    assert.equal(res.data.data.length, 50);

    // Verify first and last effects match prompt specifications
    assert.equal(res.data.data[0].id, 1);
    assert.equal(res.data.data[0].name, 'Forward Chase');
    assert.equal(res.data.data[48].id, 49);
    assert.equal(res.data.data[48].name, 'Knight Rider');
    assert.equal(res.data.data[49].id, 50);
    assert.equal(res.data.data[49].name, 'All On');
  });

  it('POST /api/device/command should validate and queue command', async () => {
    const payload = JSON.stringify({
      command: 'effect',
      value: 49
    });

    const res = await makeRequest('/api/device/command', {
      method: 'POST',
      body: payload
    });

    assert.equal(res.statusCode, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.id);
    assert.equal(res.data.data.command, 'effect');
    assert.equal(res.data.data.value, '49');
    assert.equal(res.data.data.status, 'pending');
  });

  it('GET /api/device/command should poll pending command for ESP32', async () => {
    const res = await makeRequest('/api/device/command');
    assert.equal(res.statusCode, 200);
    assert.ok(res.data.id);
    assert.equal(res.data.command, 'effect');
    assert.equal(res.data.value, 49);

    // Second immediate poll should be empty
    const secondPoll = await makeRequest('/api/device/command');
    assert.equal(secondPoll.statusCode, 200);
    assert.equal(secondPoll.data.command, null);
    assert.equal(secondPoll.data.id, null);
  });

  it('POST /api/device/ack should acknowledge command execution', async () => {
    // First submit and poll a command
    const submitRes = await makeRequest('/api/device/command', {
      method: 'POST',
      body: JSON.stringify({ command: 'speed', value: 350 })
    });
    const cmdId = submitRes.data.data.id;

    // Poll it
    await makeRequest('/api/device/command');

    // Ack it
    const ackRes = await makeRequest('/api/device/ack', {
      method: 'POST',
      body: JSON.stringify({ id: cmdId, status: 'executed' })
    });

    assert.equal(ackRes.statusCode, 200);
    assert.equal(ackRes.data.success, true);
    assert.equal(ackRes.data.data.status, 'acknowledged');
  });

  it('GET /api/device/status should return structured device telemetry', async () => {
    const res = await makeRequest('/api/device/status');
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.deviceName);
    assert.ok(res.data.data.deviceId);
    assert.ok(Array.isArray(res.data.data.ledStates));
    assert.equal(res.data.data.ledStates.length, 5);
  });

  it('Core Controls API: should successfully submit all 8 required functions (on, off, previous, next, reset, lock, unlock, automode)', async () => {
    const coreCommands = ['on', 'off', 'previous', 'next', 'reset', 'lock', 'unlock', 'automode'];
    for (const cmd of coreCommands) {
      const res = await makeRequest('/api/device/command', {
        method: 'POST',
        body: JSON.stringify({ command: cmd })
      });
      assert.equal(res.statusCode, 201, `Failed to post command ${cmd}`);
      assert.equal(res.data.success, true);
      assert.equal(res.data.data.command, cmd);
      assert.equal(res.data.data.status, 'pending');
    }
  });
});
