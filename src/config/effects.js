/**
 * 50 Predefined Effects for ESP32 5-LED Lighting Controller
 * GPIO Pins: 16 (LED 1), 17 (LED 2), 18 (LED 3), 19 (LED 4), 21 (LED 5)
 */

const EFFECTS = [
  {
    id: 1,
    name: "Forward Chase",
    category: "Chase",
    description: "Sequentially activates LEDs from left to right (LED 1 to LED 5).",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ]
  },
  {
    id: 2,
    name: "Reverse Chase",
    category: "Chase",
    description: "Sequentially activates LEDs from right to left (LED 5 to LED 1).",
    frames: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ]
  },
  {
    id: 3,
    name: "Bounce",
    category: "Chase",
    description: "Light moves back and forth across the 5 LEDs with smooth bounce.",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0]
    ]
  },
  {
    id: 4,
    name: "Alternate Flash",
    category: "Flash",
    description: "Alternates between odd LEDs (1, 3, 5) and even LEDs (2, 4).",
    frames: [
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 5,
    name: "Fill Up",
    category: "Fill",
    description: "Progressively turns on LEDs from 1 to 5, then resets.",
    frames: [
      [1, 0, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 6,
    name: "Fill Down",
    category: "Fill",
    description: "Progressively turns on LEDs from 5 to 1, then resets.",
    frames: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 7,
    name: "All LED Flash",
    category: "Flash",
    description: "Synchronous flashing of all 5 LEDs simultaneously.",
    frames: [
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 8,
    name: "Random LED",
    category: "Dynamic",
    description: "Random single LED triggers pseudorandomly.",
    frames: [
      [0, 0, 1, 0, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0]
    ]
  },
  {
    id: 9,
    name: "Two LED Chase",
    category: "Chase",
    description: "Pairs of adjacent LEDs shift across the line.",
    frames: [
      [1, 1, 0, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    id: 10,
    name: "Center Outward",
    category: "Pulse",
    description: "Expands outward from center LED (3) to outer edges (1 & 5).",
    frames: [
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 11,
    name: "Outside Inward",
    category: "Pulse",
    description: "Collapses inward from outer edges (1 & 5) toward center (3).",
    frames: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 12,
    name: "Running Pair",
    category: "Chase",
    description: "Two synchronized dots running with wrap-around.",
    frames: [
      [1, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 1],
      [1, 0, 0, 1, 0],
      [0, 1, 0, 0, 1]
    ]
  },
  {
    id: 13,
    name: "Three LED Running",
    category: "Chase",
    description: "Three consecutive illuminated LEDs move across the bank.",
    frames: [
      [1, 1, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1]
    ]
  },
  {
    id: 14,
    name: "Single LED Pulse Pattern",
    category: "Pulse",
    description: "Rhythmic breathing pulse on a single focal LED.",
    frames: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 15,
    name: "Odd LED Flash",
    category: "Flash",
    description: "Flashes LEDs 1, 3, and 5 together.",
    frames: [
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 16,
    name: "Even LED Flash",
    category: "Flash",
    description: "Flashes LEDs 2 and 4 together.",
    frames: [
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 17,
    name: "Left/Right Flash",
    category: "Flash",
    description: "Alternates between Left (1, 2) and Right (4, 5) clusters.",
    frames: [
      [1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1]
    ]
  },
  {
    id: 18,
    name: "Center LED Flash",
    category: "Flash",
    description: "Dedicated center strobe on LED 3.",
    frames: [
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 19,
    name: "Outer LED Flash",
    category: "Flash",
    description: "Synchronous flashing of outer boundary LEDs (1 & 5).",
    frames: [
      [1, 0, 0, 0, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 20,
    name: "Inner LED Flash",
    category: "Flash",
    description: "Synchronous flashing of inner boundary LEDs (2 & 4).",
    frames: [
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 21,
    name: "Build Up From Left",
    category: "Fill",
    description: "Stacks lit LEDs from left to right until fully illuminated.",
    frames: [
      [1, 0, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1]
    ]
  },
  {
    id: 22,
    name: "Remove From Left",
    category: "Fill",
    description: "Progressively deactivates LEDs from left to right.",
    frames: [
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 23,
    name: "Build Up From Right",
    category: "Fill",
    description: "Stacks lit LEDs from right to left until fully illuminated.",
    frames: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1]
    ]
  },
  {
    id: 24,
    name: "Single LED Walk",
    category: "Chase",
    description: "Slow progressive stepping of a single illuminated beacon.",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ]
  },
  {
    id: 25,
    name: "Reverse Single LED Walk",
    category: "Chase",
    description: "Reverse stepping of single illuminated beacon.",
    frames: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ]
  },
  {
    id: 26,
    name: "Double Bounce",
    category: "Chase",
    description: "Two opposing light beams crossing in the center.",
    frames: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    id: 27,
    name: "Random Multiple LEDs",
    category: "Dynamic",
    description: "Unpredictable clusters of 2 to 4 active LEDs.",
    frames: [
      [1, 0, 1, 1, 0],
      [0, 1, 1, 0, 1],
      [1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1]
    ]
  },
  {
    id: 28,
    name: "Fast Chase",
    category: "Chase",
    description: "High cadence directional chasing sequence.",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ]
  },
  {
    id: 29,
    name: "Slow Chase",
    category: "Chase",
    description: "Calm, ambient speed progressive chase.",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ]
  },
  {
    id: 30,
    name: "Three-Step Flash",
    category: "Flash",
    description: "Three-stage cycling strobe sequence.",
    frames: [
      [1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1]
    ]
  },
  {
    id: 31,
    name: "Binary Counter",
    category: "Dynamic",
    description: "Counts from 0 to 31 in 5-bit binary format.",
    frames: [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 1],
      [0, 0, 1, 1, 0],
      [0, 0, 1, 1, 1],
      [0, 1, 0, 0, 0]
    ]
  },
  {
    id: 32,
    name: "Reverse Binary Counter",
    category: "Dynamic",
    description: "Counts down in 5-bit binary format.",
    frames: [
      [0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1],
      [0, 0, 1, 1, 0],
      [0, 0, 1, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ]
  },
  {
    id: 33,
    name: "Alternate Groups",
    category: "Pattern",
    description: "Swaps alternating grouping sets between cycles.",
    frames: [
      [1, 1, 0, 1, 1],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 34,
    name: "Outside Pair Running",
    category: "Chase",
    description: "Outer pair moves synchronously across the bank.",
    frames: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 35,
    name: "Three Group Alternation",
    category: "Pattern",
    description: "Sequentially shifts between 3 distinct balance clusters.",
    frames: [
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 36,
    name: "Accumulating Chase",
    category: "Fill",
    description: "Each run deposits an illuminated LED at the end.",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 0, 1],
      [0, 0, 1, 0, 1],
      [0, 0, 0, 1, 1]
    ]
  },
  {
    id: 37,
    name: "Clearing Chase",
    category: "Fill",
    description: "A dark dot clears out an otherwise illuminated bank.",
    frames: [
      [0, 1, 1, 1, 1],
      [1, 0, 1, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 0, 1],
      [1, 1, 1, 1, 0]
    ]
  },
  {
    id: 38,
    name: "Flashing Pairs",
    category: "Flash",
    description: "Rapidly alternates between pair groups.",
    frames: [
      [1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1],
      [0, 1, 1, 1, 0]
    ]
  },
  {
    id: 39,
    name: "Center and Outer Alternation",
    category: "Pattern",
    description: "Alternates center LED against outer boundaries.",
    frames: [
      [0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    id: 40,
    name: "Three On / Two On",
    category: "Pattern",
    description: "Toggles between 3-active and 2-active complementary state.",
    frames: [
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 41,
    name: "Random Blink",
    category: "Dynamic",
    description: "Intermittent sporadic blinking across arbitrary positions.",
    frames: [
      [1, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 1],
      [0, 0, 0, 1, 0]
    ]
  },
  {
    id: 42,
    name: "One LED Off",
    category: "Pattern",
    description: "All LEDs ON with a single dark vacancy traveling through.",
    frames: [
      [0, 1, 1, 1, 1],
      [1, 0, 1, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 0, 1],
      [1, 1, 1, 1, 0]
    ]
  },
  {
    id: 43,
    name: "Two LEDs Off",
    category: "Pattern",
    description: "All LEDs ON with two traveling dark vacancies.",
    frames: [
      [0, 0, 1, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 1, 0, 0, 1],
      [1, 1, 1, 0, 0],
      [0, 1, 1, 1, 0]
    ]
  },
  {
    id: 44,
    name: "Center Pulse",
    category: "Pulse",
    description: "Intense harmonic pulses centered on pin 18.",
    frames: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 45,
    name: "Outer Pulse",
    category: "Pulse",
    description: "Outer perimeter pulse with inward ripple.",
    frames: [
      [1, 0, 0, 0, 1],
      [1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 46,
    name: "Running Wave",
    category: "Chase",
    description: "Sine-like waveform flowing smoothly across all 5 LEDs.",
    frames: [
      [1, 1, 0, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    id: 47,
    name: "Reverse Wave",
    category: "Chase",
    description: "Sine-like waveform flowing backwards from right to left.",
    frames: [
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [1, 1, 0, 0, 0],
      [1, 0, 0, 0, 1]
    ]
  },
  {
    id: 48,
    name: "Random Single Blink",
    category: "Dynamic",
    description: "One LED randomly flashes for a solitary instant.",
    frames: [
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ]
  },
  {
    id: 49,
    name: "Knight Rider",
    category: "Chase",
    description: "Iconic scanner sweep with smooth tail trail and edge bounce.",
    frames: [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0]
    ]
  },
  {
    id: 50,
    name: "All On",
    category: "Static",
    description: "Continuous full illumination across all 5 LEDs.",
    frames: [
      [1, 1, 1, 1, 1]
    ]
  }
];

const GPIO_MAP = [
  { pin: 16, label: "LED 1", color: "Cyan" },
  { pin: 17, label: "LED 2", color: "Cyan" },
  { pin: 18, label: "LED 3", color: "Cyan" },
  { pin: 19, label: "LED 4", color: "Cyan" },
  { pin: 21, label: "LED 5", color: "Cyan" }
];

module.exports = {
  EFFECTS,
  GPIO_MAP,
  getEffectById: (id) => EFFECTS.find((e) => e.id === Number(id)) || null,
  getTotalEffects: () => EFFECTS.length
};
