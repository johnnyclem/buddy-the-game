// Game logic — top-down movement, collision, dialogue, item pickup, exits
// Called once per frame at 60 fps (dt = 1/60 s)

const CHAR_SPEED   = 0.04;  // seconds between typewriter character reveals
const INTERACT_RANGE = 52;  // px — how close player must be to trigger NPC talk
const SIT_FRAMES   = 120;   // how long the voice "sit" command holds

function update(dt) {
  applyTiltInput(); // device orientation → state.input

  if (state.mode === 'dialogue') {
    _updateDialogue(dt);
    return;
  }

  if (state.mode !== 'play') return;

  _updatePlayer(dt);
  _updateNPCProximity();
  _checkItems();
  _checkExits();
}

// ── Player ─────────────────────────────────────────────────────────────────────

function _updatePlayer(dt) {
  const p   = state.player;
  const inp = state.input;

  // Tick-down timers
  if (p.interactCooldown > 0) p.interactCooldown--;
  if (p.treatTimer > 0)       p.treatTimer--;
  if (p.sitTimer > 0) {
    p.sitTimer--;
    if (p.sitTimer === 0) p.sitting = false;
  }

  // Consume the one-shot interact flag
  if (inp.interactPressed) {
    inp.interactPressed = false;
    if (p.interactCooldown === 0) {
      _tryInteract();
    }
  }

  if (p.sitting) {
    p.moving = false;
    _animatePlayer(p, dt);
    return;
  }

  // Directional input → velocity
  let dx = 0, dy = 0;
  if (inp.left)  dx -= 1;
  if (inp.right) dx += 1;
  if (inp.up)    dy -= 1;
  if (inp.down)  dy += 1;

  p.moving = (dx !== 0 || dy !== 0);

  // Normalize diagonals
  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

  // Update facing direction (prefer the dominant axis)
  if (p.moving) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      p.dir = dx > 0 ? 'right' : 'left';
    } else {
      p.dir = dy > 0 ? 'down' : 'up';
    }
  }

  const speed = p.speed * (p.treatTimer > 0 ? 1.6 : 1.0) * dt;

  // Resolve collision per axis independently (allows wall-sliding)
  _tryMove(p, dx * speed, 0);
  _tryMove(p, 0, dy * speed);

  _animatePlayer(p, dt);
}

function _tryMove(p, dx, dy) {
  const nx = p.x + dx;
  const ny = p.y + dy;

  if (!_collides(nx, p.y, p.w, p.h)) p.x = nx;
  if (!_collides(p.x, ny, p.w, p.h)) p.y = ny;
}

// AABB tile collision — checks all four corners of the hitbox
function _collides(cx, cy, hw, hh) {
  const tiles = state.room.def.tiles;
  const corners = [
    [cx - hw, cy - hh],
    [cx + hw - 1, cy - hh],
    [cx - hw, cy + hh - 1],
    [cx + hw - 1, cy + hh - 1],
  ];
  for (const [px, py] of corners) {
    const col = Math.floor(px / TS);
    const row = Math.floor(py / TS);
    if (col < 0 || col >= ROOM_COLS || row < 0 || row >= ROOM_ROWS) return true;
    const tile = tiles[row][col];
    if (SOLID_TILES.has(tile)) return true;
  }
  return false;
}

// ── Animation ──────────────────────────────────────────────────────────────────

function _animatePlayer(p, dt) {
  if (!p.moving || p.sitting) {
    p.animFrame = 0;
    p.animTimer = 0;
    return;
  }
  const frameTime = p.treatTimer > 0 ? 0.07 : 0.12;
  p.animTimer += dt;
  if (p.animTimer >= frameTime) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % 4;
  }
}

// ── NPC proximity ─────────────────────────────────────────────────────────────

function _updateNPCProximity() {
  const p = state.player;
  for (const npc of state.room.npcs) {
    const nx = npc.col * TS + TS / 2;
    const ny = npc.row * TS + TS / 2;
    const d  = Math.hypot(p.x - nx, p.y - ny);
    npc._showPrompt = (d < INTERACT_RANGE);
  }
}

// ── Interaction ───────────────────────────────────────────────────────────────

function _tryInteract() {
  const p = state.player;

  // Find nearest NPC in range
  let nearest = null;
  let nearestDist = INTERACT_RANGE;

  for (const npc of state.room.npcs) {
    const nx = npc.col * TS + TS / 2;
    const ny = npc.row * TS + TS / 2;
    const d  = Math.hypot(p.x - nx, p.y - ny);
    if (d < nearestDist) { nearestDist = d; nearest = npc; }
  }

  if (nearest) {
    _startDialogue(nearest);
    state.player.interactCooldown = 10;
  }
}

function _startDialogue(npc) {
  const d = state.dialogue;
  d.active      = true;
  d.npcId       = npc.id;
  d.lines       = npc.dialogue;
  d.lineIndex   = 0;
  d.charIndex   = 0;
  d.charTimer   = 0;
  d.allRevealed = false;
  state.mode    = 'dialogue';

  // Face player toward NPC
  const p  = state.player;
  const nx = npc.col * TS + TS / 2;
  const ny = npc.row * TS + TS / 2;
  const dx = nx - p.x;
  const dy = ny - p.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    p.dir = dx > 0 ? 'right' : 'left';
  } else {
    p.dir = dy > 0 ? 'down' : 'up';
  }
}

// ── Dialogue advancement ──────────────────────────────────────────────────────

function _updateDialogue(dt) {
  const d   = state.dialogue;
  const inp = state.input;

  // Typewriter effect
  if (!d.allRevealed) {
    d.charTimer += dt;
    if (d.charTimer >= CHAR_SPEED) {
      d.charTimer = 0;
      const line = d.lines[d.lineIndex] || '';
      d.charIndex++;
      if (d.charIndex >= line.length) {
        d.charIndex   = line.length;
        d.allRevealed = true;
      }
    }
    // Holding interact skips to end of line
    if (inp.interact) {
      d.charIndex   = (d.lines[d.lineIndex] || '').length;
      d.allRevealed = true;
    }
  }

  // Edge-triggered advance
  if (inp.interactPressed) {
    inp.interactPressed = false;

    if (!d.allRevealed) {
      // Skip to end of current line
      d.charIndex   = (d.lines[d.lineIndex] || '').length;
      d.allRevealed = true;
    } else {
      // Advance to next line or close
      d.lineIndex++;
      if (d.lineIndex >= d.lines.length) {
        _closeDialogue();
      } else {
        d.charIndex   = 0;
        d.charTimer   = 0;
        d.allRevealed = false;
      }
    }
  }
}

function _closeDialogue() {
  const d   = state.dialogue;
  const npc = state.room.npcs.find(n => n.id === d.npcId);
  if (npc) { npc.dialogueSeen = true; npc._showPrompt = false; }

  // Win condition: finished talking to Mr. Whiskers
  if (d.npcId === 'whiskers') {
    state.gameWon = true;
    state.mode    = 'over';
    return;
  }

  d.active    = false;
  d.npcId     = '';
  state.mode  = 'play';
  state.player.interactCooldown = 30;
}

// ── Item pickup ───────────────────────────────────────────────────────────────

function _checkItems() {
  const p = state.player;
  for (const item of state.room.items) {
    if (item.collected) continue;
    const ix = item.col * TS + TS / 2;
    const iy = item.row * TS + TS / 2;
    if (Math.abs(p.x - ix) < 20 && Math.abs(p.y - iy) < 20) {
      item.collected = true;
      if (item.type === 'bone')  state.score++;
      if (item.type === 'treat') { state.treats++; state.player.treatTimer = 300; }
      // Ball: just collect for fun
    }
  }
}

// ── Room exits ────────────────────────────────────────────────────────────────

function _checkExits() {
  const p  = state.player;
  const pc = Math.floor(p.x / TS);  // player tile column
  const pr = Math.floor(p.y / TS);  // player tile row

  for (const exit of state.room.exits) {
    let triggered = false;
    if (exit.dir === 'south' && pr >= ROOM_ROWS - 1) {
      triggered = pc >= exit.minCol && pc <= exit.maxCol;
    } else if (exit.dir === 'north' && pr <= 0) {
      triggered = pc >= exit.minCol && pc <= exit.maxCol;
    } else if (exit.dir === 'west' && pc <= 0) {
      triggered = pr >= exit.minRow && pr <= exit.maxRow;
    } else if (exit.dir === 'east' && pc >= ROOM_COLS - 1) {
      triggered = pr >= exit.minRow && pr <= exit.maxRow;
    }
    if (triggered) {
      enterRoom(exit.targetRoom, exit.targetCol, exit.targetRow);
      return;
    }
  }
}
