// Shared DOM references
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

// Game state — mutate properties; never reassign the object itself
const state = {
  mode:  'menu', // 'menu' | 'play' | 'over'
  world: null,
  tick:  0,

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
