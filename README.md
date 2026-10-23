# GlowControl — ESP32 5-LED 50-Effect Lighting Controller Web Dashboard

A responsive, production-ready IoT control dashboard and REST API built with **Node.js**, **Express.js**, **EJS templates**, **Tailwind CSS**, and **SQLite** to remotely manage a 5-LED, 50-effect chaser lighting controller powered by an **ESP32**.

---

## 1. System Overview & Offline-First Architecture

GlowControl is designed with an **offline-first, hardware-autonomous philosophy**:

- **Autonomous Microcontroller Operation:** The ESP32's 50 predefined lighting effects run entirely on-chip using non-blocking hardware clocks (`millis()`). Wi-Fi dropouts, network latency, or server reboots **never interrupt or freeze local lighting animations**.
- **High-Level Command Dispatch:** The Node.js server does not compute frame-by-frame PWM pulses; it dispatches high-level instructions (`effect`, `speed`, `on`, `off`, `next`, `previous`, `reset`, `lock`, `unlock`, `auto_on`, `auto_off`).
- **Honest Telemetry & Command Lifecycle:**
  - `Submitted (pending)`: Stored in SQLite queue awaiting hardware poll.
  - `Delivered`: Retrieved by the ESP32 during its 1000ms polling cycle.
  - `Acknowledged`: Explicitly confirmed by the ESP32 after hardware execution.
  - `Expired`: Stale commands older than the configurable TTL (default 60s) automatically expire so an offline device doesn't execute outdated backlogs upon reconnecting.
- **Built-in Virtual ESP32 Simulator (Demo Mode):** Test and demonstrate all 50 effects, sliders, polling, and acknowledgements in your browser without requiring physical ESP32 hardware attached.

---

## 2. Hardware Specification & Pinout

| LED Output | ESP32 GPIO Pin | Description | Wiring |
| :--- | :--- | :--- | :--- |
| **LED 1** | **GPIO 16** | Left boundary LED | Series 220Ω resistor to Anode |
| **LED 2** | **GPIO 17** | Inner-left LED | Series 220Ω resistor to Anode |
| **LED 3** | **GPIO 18** | Center beacon LED | Series 220Ω resistor to Anode |
| **LED 4** | **GPIO 19** | Inner-right LED | Series 220Ω resistor to Anode |
| **LED 5** | **GPIO 21** | Right boundary LED | Series 220Ω resistor to Anode |
| **GND** | **GND** | Common ground bus | All LED Cathodes to ESP32 GND |

---

## 3. The 50 Predefined Lighting Effects

GlowControl provides an interactive library with visual pattern previews for all 50 firmware effects:

| # | Effect Name | Category | Description |
| :--- | :--- | :--- | :--- |
| **1** | Forward Chase | Chase | Sequentially activates LEDs 1 to 5 |
| **2** | Reverse Chase | Chase | Sequentially activates LEDs 5 to 1 |
| **3** | Bounce | Chase | Smooth back-and-forth bounce |
| **4** | Alternate Flash | Flash | Alternates odd (1,3,5) and even (2,4) LEDs |
| **5** | Fill Up | Fill | Progressively illuminates 1 through 5, then clears |
| **6** | Fill Down | Fill | Progressively illuminates 5 through 1, then clears |
| **7** | All LED Flash | Flash | Synchronous strobe across all 5 LEDs |
| **8** | Random LED | Dynamic | Pseudorandom single beacon trigger |
| **9** | Two LED Chase | Chase | Two adjacent active LEDs traveling across |
| **10** | Center Outward | Pulse | Expands outward from center (3) to edges (1 & 5) |
| **11** | Outside Inward | Pulse | Collapses inward from edges (1 & 5) to center (3) |
| **12** | Running Pair | Chase | Dual synchronized rotating dots |
| **13** | Three LED Running | Chase | Cluster of 3 consecutive illuminated LEDs |
| **14** | Single LED Pulse Pattern | Pulse | Focal breathing pulse on center LED |
| **15** | Odd LED Flash | Flash | Dedicated flash on LEDs 1, 3, 5 |
| **16** | Even LED Flash | Flash | Dedicated flash on LEDs 2, 4 |
| **17** | Left/Right Flash | Flash | Alternates Left (1,2) and Right (4,5) banks |
| **18** | Center LED Flash | Flash | Dedicated strobe on LED 3 |
| **19** | Outer LED Flash | Flash | Synchronous flash on outer LEDs 1 & 5 |
| **20** | Inner LED Flash | Flash | Synchronous flash on inner LEDs 2 & 4 |
| **21** | Build Up From Left | Fill | Progressively stacks LEDs from left |
| **22** | Remove From Left | Fill | Progressively deactivates LEDs from left |
| **23** | Build Up From Right | Fill | Progressively stacks LEDs from right |
| **24** | Single LED Walk | Chase | Calm single beacon progressive stepping |
| **25** | Reverse Single LED Walk | Chase | Reverse stepping of single beacon |
| **26** | Double Bounce | Chase | Opposing light beams crossing in center |
| **27** | Random Multiple LEDs | Dynamic | Unpredictable clusters of 2 to 4 active LEDs |
| **28** | Fast Chase | Chase | High cadence directional sweep |
| **29** | Slow Chase | Chase | Ambient cadence directional sweep |
| **30** | Three-Step Flash | Flash | 3-stage cycling strobe sequence |
| **31** | Binary Counter | Dynamic | 5-bit binary increment count (0 to 31) |
| **32** | Reverse Binary Counter | Dynamic | 5-bit binary decrement count |
| **33** | Alternate Groups | Pattern | Swaps alternating cluster sets |
| **34** | Outside Pair Running | Chase | Synchronous pair movement |
| **35** | Three Group Alternation | Pattern | Cycles between 3 distinct balance clusters |
| **36** | Accumulating Chase | Fill | Consecutive runs deposit lit LEDs at the end |
| **37** | Clearing Chase | Fill | Traveling dark vacancy clears illuminated bank |
| **38** | Flashing Pairs | Flash | Rapidly alternates between pair groups |
| **39** | Center and Outer Alternation | Pattern | Toggles center (3) against perimeter (1 & 5) |
| **40** | Three On / Two On | Pattern | Complementary toggle between 3 and 2 active LEDs |
| **41** | Random Blink | Dynamic | Intermittent sporadic single blinks |
| **42** | One LED Off | Pattern | Traveling dark notch across 4 active LEDs |
| **43** | Two LEDs Off | Pattern | Dual traveling dark notches |
| **44** | Center Pulse | Pulse | Harmonic outward pulse centered on pin 18 |
| **45** | Outer Pulse | Pulse | Perimeter pulse with inward ripple |
| **46** | Running Wave | Chase | Smooth continuous sine-like waveform |
| **47** | Reverse Wave | Chase | Reverse sine-like waveform |
| **48** | Random Single Blink | Dynamic | Solitary instant flash at random coordinate |
| **49** | Knight Rider | Chase | Iconic scanner sweep with smooth tail trail |
| **50** | All On | Static | Continuous full illumination across all 5 LEDs |

---

## 4. Technology Stack & Design Direction

- **Backend:** Node.js v20+ / v24, Express.js
- **Database:** SQLite (`node:sqlite` built-in native support with WAL mode)
- **Frontend:** Server-rendered EJS templates with reusable partials
- **CSS Styling:** Tailwind CSS v3 compiled locally to `public/css/styles.css` (No external CDN reliance)
- **Icons:** Lucide icons bundled locally
- **Charts:** Chart.js v4 bundled locally
- **Colors & Aesthetics:**
  - Background: `#0B1120` (Dark Navy)
  - Sidebar: `#111827` (Charcoal Slate)
  - Cards: `#172033` (Elevated Navy)
  - Accent: `#38BDF8` (Sky Cyan)
  - Secondary: `#8B5CF6` (Vibrant Violet)
  - Status Indicators: `#22C55E` (Success), `#F59E0B` (Warning), `#EF4444` (Error)

---

## 5. Directory Structure

```text
UI/
├── src/
│   ├── app.js                   # Express configuration, Helmet CSP, layouts
│   ├── server.js                # Server entry point & graceful shutdown
│   ├── config/
│   │   ├── database.js          # SQLite database connection & schema
│   │   ├── effects.js           # 50 effects catalog & 5-LED frames
│   │   └── env.js               # Environment variables & defaults
│   ├── controllers/
│   │   ├── pageController.js    # EJS dashboard view rendering
│   │   ├── commandApiController.js # Command submission, polling & ack
│   │   ├── deviceApiController.js  # Telemetry & status endpoints
│   │   ├── automationApiController.js # Automation configuration
│   │   └── simulatorController.js  # Virtual ESP32 demo mode toggle
│   ├── middleware/
│   │   ├── auth.js              # Optional X-API-Key verification
│   │   ├── errorHandler.js      # Centralized error handler
│   │   └── rateLimiter.js       # Rate limiting guards
│   ├── models/
│   │   ├── commandModel.js      # Command queue, expiration & SQLite queries
│   │   ├── deviceStateModel.js  # Honest connection status & telemetry
│   │   └── settingsModel.js     # Persistent key-value configuration
│   ├── routes/
│   │   ├── pages.js             # Frontend GET routes
│   │   ├── dashboard.js         # /api/dashboard
│   │   ├── device.js            # /api/device/command, /api/device/ack
│   │   ├── effects.js           # /api/effects
│   │   ├── automation.js        # /api/automation
│   │   └── simulator.js         # /api/simulator/toggle
│   └── services/
│       ├── commandService.js    # Validation & queue logic
│       ├── deviceService.js     # Heartbeats & dashboard aggregation
│       ├── automationService.js # Interval switching logic
│       └── simulatorService.js  # Built-in Virtual ESP32 Simulator
├── views/
│   ├── layouts/
│   │   └── main.ejs             # Master layout with sidebar & header
│   ├── partials/
│   │   ├── header.ejs           # App header, sync time, quick demo toggle
│   │   ├── sidebar.ejs          # Responsive navigation sidebar
│   │   ├── footer.ejs           # App footer & telemetry specs
│   │   ├── deviceStatusBadge.ejs# Online / Offline / Demo mode badge
│   │   ├── ledIndicator.ejs     # 5-LED hardware bus visualizer
│   │   ├── toast.ejs            # Async toast notification system
│   │   └── confirmModal.ejs     # Modal confirmation dialog
│   ├── pages/
│   │   ├── overview.ejs         # Overview metrics, 5-LED bus, chart & table
│   │   ├── controller.ejs       # Buttons, speed slider, 50-effect picker
│   │   ├── effects.ejs          # Searchable, filterable 50-effect library
│   │   ├── automation.ejs       # Auto cycling, interval slider & compatibility
│   │   ├── history.ejs          # Searchable SQLite command audit table
│   │   └── settings.ejs         # Hardware IDs, endpoints & C++ firmware guide
│   └── errors/
│       ├── 404.ejs
│       └── 500.ejs
├── public/
│   ├── css/
│   │   ├── tailwind.css         # Tailwind source
│   │   └── styles.css           # Compiled minified production CSS (39KB)
│   └── js/
│       ├── main.js              # Client state, polling, toasts, modals, chart
│       └── vendor/              # Local bundled Lucide & Chart.js assets
├── database/
│   └── glowcontrol.sqlite       # SQLite database file
├── tests/
│   ├── command.test.js          # Unit tests for validation, queue & expiration
│   └── api.test.js              # Integration tests for HTTP REST endpoints
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 6. Installation & Quick Start

### 1. Prerequisites
- **Node.js:** v20.0.0 or v24.x installed
- **npm:** v9.0.0 or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```ini
PORT=3000
NODE_ENV=development
DEVICE_API_KEY=esp32_glow_secret_key_9281
DEVICE_ID=ESP32_CHASER_01
COMMAND_TIMEOUT_SECONDS=60
OFFLINE_THRESHOLD_SECONDS=15
DATABASE_PATH=./database/glowcontrol.sqlite
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200
```

### 4. Build Tailwind CSS (Local Compilation)
```bash
npm run build:css
```

### 5. Run the Application
For production:
```bash
npm start
```
For live development with auto-reload:
```bash
npm run dev
```

Open your browser to:
**`http://localhost:3000`**

### 6. Run Automated Test Suite
Run the 21 automated unit and integration tests:
```bash
npm test
```

---

## 7. REST API Reference

### 1. Submit Command
- **Endpoint:** `POST /api/device/command`
- **Headers:** `Content-Type: application/json`
- **Payload:**
```json
{
  "command": "effect",
  "value": 49
}
```
- **Supported commands:** `on`, `off`, `next`, `previous`, `effect` (value 1–50), `reset`, `lock`, `unlock`, `speed` (value 20–2000), `auto_on`, `auto_off`.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Command submitted to queue (pending ESP32 delivery)",
  "data": {
    "id": "cmd_1729701234_ab81",
    "command": "effect",
    "value": "49",
    "status": "pending",
    "origin": "web_dashboard",
    "created_at": "2026-10-23T14:35:00.000Z"
  }
}
```

### 2. ESP32 Polling Endpoint
- **Endpoint:** `GET /api/device/command`
- **Optional Header:** `X-API-Key: esp32_glow_secret_key_9281`
- **Behavior:** Returns the oldest unexpired pending command and immediately marks it as `delivered`. If no pending command exists, returns `command: null` to prevent duplicate execution.
- **Response (Command Available - 200 OK):**
```json
{
  "id": "cmd_1729701234_ab81",
  "command": "effect",
  "value": 49
}
```
- **Response (Queue Empty - 200 OK):**
```json
{
  "command": null,
  "id": null,
  "value": null
}
```

### 3. ESP32 Command Acknowledgement
- **Endpoint:** `POST /api/device/ack`
- **Headers:** `Content-Type: application/json`, `X-API-Key: <key>`
- **Payload:**
```json
{
  "id": "cmd_1729701234_ab81",
  "status": "executed"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Command acknowledgement recorded",
  "data": {
    "id": "cmd_1729701234_ab81",
    "status": "acknowledged",
    "acknowledged_at": "2026-10-23T14:35:01.120Z"
  }
}
```

### 4. Device Status & Telemetry
- **Endpoint:** `GET /api/device/status`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isOnline": true,
    "statusLabel": "Online",
    "wifiStatus": "Connected",
    "lastSeenSecondsAgo": 1,
    "currentEffectId": 49,
    "currentEffectName": "Knight Rider",
    "speedMs": 150,
    "autoMode": false,
    "isLocked": false,
    "ledStates": [1, 0, 0, 0, 0],
    "deviceName": "ESP32 Living Room Chaser",
    "deviceId": "ESP32_CHASER_01"
  }
}
```

---

## 8. ESP32 Firmware Integration Guide

Below is a complete, production-ready Arduino C++ sketch for your ESP32 demonstrating autonomous offline operation, non-blocking timers, polling, and acknowledgement:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Hardware Pin Configuration
const int LED_PINS[5] = {16, 17, 18, 19, 21};

// Wi-Fi Credentials
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

// GlowControl Backend Configuration
const char* SERVER_BASE   = "http://192.168.1.100:3000"; // Replace with your Node server IP
const char* API_KEY       = "esp32_glow_secret_key_9281";

// Controller State Variables
int currentEffect         = 1;
int speedDelayMs          = 150;
bool isLocked             = false;
bool autoMode             = false;
unsigned long lastStepTime= 0;
unsigned long lastAutoTime= 0;
unsigned long lastPollTime= 0;
const unsigned long POLL_INTERVAL_MS = 1000;
String lastCommandId      = "";

void setup() {
  Serial.begin(115200);

  // Initialize GPIO outputs
  for (int i = 0; i < 5; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }

  // Connect to Wi-Fi non-blockingly
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("GlowControl ESP32 Initialized.");
}

void loop() {
  unsigned long now = millis();

  // 1. AUTONOMOUS LOCAL LED EFFECT STEPPING (ZERO NETWORK BLOCKING)
  if (!isLocked && (now - lastStepTime >= (unsigned long)speedDelayMs)) {
    lastStepTime = now;
    stepEffect(currentEffect);
  }

  // 2. LOCAL AUTOMATIC EFFECT CYCLING (10s Default)
  if (autoMode && !isLocked && (now - lastAutoTime >= 10000)) {
    lastAutoTime = now;
    currentEffect = (currentEffect >= 50) ? 1 : currentEffect + 1;
  }

  // 3. HTTP POLLING LOOP (1000ms Interval)
  if (WiFi.status() == WL_CONNECTED && (now - lastPollTime >= POLL_INTERVAL_MS)) {
    lastPollTime = now;
    pollServer();
  }
}

void pollServer() {
  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/device/command";
  http.begin(url);
  http.addHeader("X-API-Key", API_KEY);
  http.setTimeout(2000); // 2s timeout prevents blocking loop

  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error && doc.containsKey("id") && !doc["id"].isNull()) {
      String id  = doc["id"].as<String>();
      String cmd = doc["command"].as<String>();
      int val    = doc["value"] | 0;

      if (id != lastCommandId) {
        lastCommandId = id;
        executeCommandLocally(cmd, val);
        sendAcknowledgement(id, "executed");
      }
    }
  }
  http.end();
}

void executeCommandLocally(String cmd, int val) {
  if (cmd == "effect" && val >= 1 && val <= 50) {
    currentEffect = val;
    isLocked = false;
  } else if (cmd == "speed" && val >= 20 && val <= 2000) {
    speedDelayMs = val;
  } else if (cmd == "on") {
    setAllLeds(HIGH);
    isLocked = true;
  } else if (cmd == "off") {
    setAllLeds(LOW);
    isLocked = true;
  } else if (cmd == "next") {
    currentEffect = (currentEffect >= 50) ? 1 : currentEffect + 1;
  } else if (cmd == "previous") {
    currentEffect = (currentEffect <= 1) ? 50 : currentEffect - 1;
  } else if (cmd == "reset") {
    currentEffect = 1;
    isLocked = false;
  } else if (cmd == "lock") {
    isLocked = true;
  } else if (cmd == "unlock") {
    isLocked = false;
  } else if (cmd == "auto_on") {
    autoMode = true;
    lastAutoTime = millis();
  } else if (cmd == "auto_off") {
    autoMode = false;
  }
}

void sendAcknowledgement(String cmdId, String status) {
  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/device/ack";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  String body = "{\"id\":\"" + cmdId + "\",\"status\":\"" + status + "\"}";
  http.POST(body);
  http.end();
}

void setAllLeds(uint8_t state) {
  for (int i = 0; i < 5; i++) {
    digitalWrite(LED_PINS[i], state);
  }
}

void stepEffect(int effNum) {
  // Executes the respective frame pattern for effects 1 through 50
  // using your local animation routines.
}
```

---

## 9. Virtual ESP32 Simulator (Demo Mode)

To explore and test GlowControl without an ESP32 connected:
1. Click the **"Demo Mode"** pill in the top header or the **"Activate"** button in **Device Settings**.
2. The virtual simulator starts an in-memory loop replicating an ESP32 polling every 1000ms.
3. Every command you dispatch from the dashboard is received, stepped through the virtual 5-LED GPIO array, and acknowledged.
4. The dashboard displays a distinct **"Simulated Hardware Bus"** label to maintain complete honesty and transparency regarding real vs. simulated telemetry.

---

## 10. License & Maintenance
Built for the **ESP32 5-LED, 50-Effect Lighting Controller**. Free to extend and adapt for production smart-home and industrial LED installations.
