// Shared DOM references
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

// Layout constants
const TS        = 32;  // tile size in pixels
const ROOM_COLS = 30;
const ROOM_ROWS = 15;

// Tile type IDs
const T = {
  GRASS:      0,
  WALL:       1,
  TREE:       2,
  FENCE:      3,
  PATH:       4,
  WATER:      5,
  FLOWERS:    6,
  TALL_GRASS: 7,
  DOGHOUSE:   8,
  HOUSE:      9,
};

// Solid tiles (player cannot walk through)
const SOLID_TILES = new Set([1, 2, 3, 5, 8, 9]);

// Game state — mutate properties; never reassign the object itself
const state = {
  mode:    'menu',  // 'menu' | 'play' | 'dialogue' | 'over'
  tick:    0,
  gameWon: false,

  // Buddy the dog — player character
  player: {
    x: 480,        // pixel position (center of character)
    y: 360,
    w: 8,          // hitbox half-width  (full hitbox = 2w×2h centered on x,y)
    h: 8,          // hitbox half-height
    dir:    'down',  // 'up' | 'down' | 'left' | 'right'
    moving: false,
    speed:  130,    // px/sec (normal)
    animFrame: 0,
    animTimer: 0,
    interactCooldown: 0,  // frames before next interact
    treatTimer: 0,        // frames remaining of treat power-up
    sitting:   false,
    sitTimer:  0,
  },

  // Unified input — written by keyboard, touch, voice, and tilt
  input: {
    left:            false,
    right:           false,
    up:              false,
    down:            false,
    interact:        false,   // held
    interactPressed: false,   // edge-triggered (cleared each frame)
  },

  // Active room state
  room: {
    index: 0,
    def:   null,   // reference to ROOMS[index]
    npcs:  [],     // live NPC instances (with dialogueSeen, _showPrompt added)
    items: [],     // live item instances (with collected flag added)
    exits: [],     // copy of room exit definitions
  },

  // Dialogue system
  dialogue: {
    active:      false,
    npcId:       '',
    lines:       [],
    lineIndex:   0,
    charIndex:   0,
    charTimer:   0,    // seconds until next char reveal
    allRevealed: false,
  },

  // Inventory / score
  score:  0,   // bones collected
  treats: 0,   // treat power-ups collected

  // Web Speech API state
  voice: {
    supported:     false,
    active:        false,
    transcript:    '',
    reaction:      '',
    reactionUntil: 0,
  },

  // DeviceOrientation (tilt)
  tilt: {
    supported: false,
    enabled:   false,
    gamma:     0,
  },

  // Voice command unlock list (kept for voice.js compatibility)
  unlockedCommands: ['get_treat', 'sit', 'spin'],
};
