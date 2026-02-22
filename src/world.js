// World helpers — initialize a room and manage room transitions

// Initialize the active room (deep-copies live state from ROOMS definition)
function initRoom(roomIndex) {
  const def = ROOMS[roomIndex];
  if (!def) return;

  state.room.index = roomIndex;
  state.room.def   = def;

  // Deep-copy NPC list so we can track per-session dialogue state
  state.room.npcs = def.npcs.map(n => Object.assign({}, n, {
    dialogueSeen: false,
    _showPrompt:  false,
  }));

  // Deep-copy item list so we can track collection
  state.room.items = def.items.map(i => Object.assign({}, i, {
    collected: false,
  }));

  // Copy exits (read-only, no mutation needed)
  state.room.exits = def.exits;
}

// Transition player to another room
function enterRoom(roomIndex, targetCol, targetRow) {
  initRoom(roomIndex);
  state.player.x      = targetCol * TS + TS / 2;
  state.player.y      = targetRow * TS + TS / 2;
  state.player.moving = false;
}

// Start a fresh game run
function startGame() {
  state.score    = 0;
  state.treats   = 0;
  state.gameWon  = false;
  state.tick     = 0;
  initRoom(0);

  const start = state.room.def.playerStart;
  state.player.x   = start.col * TS + TS / 2;
  state.player.y   = start.row * TS + TS / 2;
  state.player.dir = 'down';
  state.player.moving          = false;
  state.player.treatTimer      = 0;
  state.player.sitting         = false;
  state.player.sitTimer        = 0;
  state.player.interactCooldown = 0;
  state.player.animFrame       = 0;
  state.player.animTimer       = 0;

  state.dialogue.active = false;
  state.mode = 'play';
}

// Kept for compatibility — no longer used in top-down mode
function createWorld() {}
