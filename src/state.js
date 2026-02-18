// Shared DOM references
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

// Game state — mutate properties; never reassign the object itself
const state = {
  mode:  'menu', // 'menu' | 'play' | 'over'
  world: null,
  tick:  0,
  score: 0,

  // Buddy the dog — player character
  player: {
    x: 80,
    y: 0,      // set on world init
    vx: 0,
    vy: 0,
    w: 40,
    h: 32,
    onGround: false,
    facingRight: true,
    sitting: false,
    sitTimer: 0,    // ticks remaining in sit
    jumpPressed: false,  // edge detection — only jump on fresh press
    jumpsLeft: 1,   // 1 normally, 2 with treat (double-jump)
    animFrame: 0,
    animTimer: 0,
    // Treat power-up
    treatTimer: 0,  // ticks remaining of treat effect (0 = no treat)
  },

  // Camera offset (horizontal scroll)
  camera: { x: 0 },

  // Unified input — written by keyboard, touch D-pad, voice, and tilt
  input: {
    left:  false,
    right: false,
    jump:  false,
    sit:   false,
  },

  // Web Speech API state
  voice: {
    supported:     false,
    active:        false,
    transcript:    '',   // last recognised phrase
    reaction:      '',   // Buddy's reaction text
    reactionUntil: 0,    // timestamp when reaction should stop showing
  },

  // DeviceOrientation (tilt) state
  tilt: {
    supported: false,
    enabled:   false,
    gamma:     0,   // degrees — negative = tilted left, positive = tilted right
  },
};
