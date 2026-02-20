// Game logic — called once per frame during 'play' mode
// dt: delta time in seconds (fixed at 1/60)

const GRAVITY      = 1400;  // px/s²
const MOVE_SPD     = 220;   // px/s horizontal (normal)
const JUMP_SPD     = 560;   // px/s initial vertical velocity (normal)
const SIT_TICKS    = 36;    // frames Buddy stays sitting after command

const TREAT_MOVE   = 400;   // px/s while hopped up on treats
const TREAT_JUMP   = 740;   // px/s jump while on treats
const TREAT_TICKS  = 420;   // 7 seconds at 60fps

const CRUMBLE_DELAY  = 30;  // frames before crumble platform falls
const DISSOLVE_DELAY = 45;  // frames before dissolve platform vanishes

function update(dt) {
  applyTiltInput(); // map device orientation → state.input before game logic

  state.tick++;

  if (!state.world) return;

  _updatePlayer(dt);
  _updateEnemies(dt);
  _updateMovingPlatforms(dt);
  _updateCrumblePlatforms(dt);
  _updateCamera();
  _checkCollectibles();
  _checkHazards(dt);
  _checkEnemyCollisions();
  _checkGoal();
}

// ── Player ────────────────────────────────────────────────────────────────────

function _updatePlayer(dt) {
  const p   = state.player;
  const inp = state.input;

  // Treat timer countdown
  if (p.treatTimer > 0) p.treatTimer--;

  const hasTreat = p.treatTimer > 0;
  const movSpd   = hasTreat ? TREAT_MOVE : MOVE_SPD;
  const jumpSpd  = hasTreat ? TREAT_JUMP : JUMP_SPD;
  const maxJumps = hasTreat ? 2 : 1;

  // ── Icy physics check ──────────────────────────────────────────────────
  const isIcy = state.world.levelDef && state.world.levelDef.icy;
  const friction = isIcy ? 0.96 : 0.78;

  // ── Sit command ──────────────────────────────────────────────────────────
  if (inp.sit && p.onGround && !hasTreat) {
    p.sitting  = true;
    p.sitTimer = SIT_TICKS;
    inp.sit    = false;
  }
  if (p.sitTimer > 0) {
    p.sitTimer--;
    if (p.sitTimer === 0) p.sitting = false;
  }

  if (p.sitting) {
    p.vx = 0;
    p.vy += GRAVITY * dt;
    _resolveCollisions(p, dt);
    p.animFrame = 3;
    return;
  }

  // ── Horizontal movement ──────────────────────────────────────────────────
  if (inp.left) {
    if (isIcy) {
      p.vx = Math.max(p.vx - movSpd * dt * 8, -movSpd);
    } else {
      p.vx = -movSpd;
    }
    p.facingRight = false;
  } else if (inp.right) {
    if (isIcy) {
      p.vx = Math.min(p.vx + movSpd * dt * 8, movSpd);
    } else {
      p.vx = movSpd;
    }
    p.facingRight = true;
  } else {
    p.vx *= friction;
    if (Math.abs(p.vx) < 4) p.vx = 0;
  }

  // ── Jump (edge-triggered, supports double-jump) ──────────────────────────
  if (inp.jump && !p.jumpPressed) {
    if (p.jumpsLeft > 0) {
      p.vy          = -jumpSpd;
      p.onGround    = false;
      p.jumpsLeft--;
      p.jumpPressed = true;
    }
  }
  if (!inp.jump) {
    p.jumpPressed = false;
  }

  // ── Gravity ──────────────────────────────────────────────────────────────
  p.vy += GRAVITY * dt;

  // ── Move + collide ─────────────────────────────────────────────────────
  _resolveCollisions(p, dt);

  // Restore jumps when landing (resolve sets onGround)
  if (p.onGround) p.jumpsLeft = maxJumps;

  // ── Clamp to left edge ─────────────────────────────────────────────────
  if (p.x < 0) { p.x = 0; p.vx = 0; }

  // ── Fell off bottom — game over (treats make Buddy invincible) ─────────
  if (p.y > 640 && !hasTreat) {
    state.mode = 'over';
    return;
  } else if (p.y > 640 && hasTreat) {
    p.y  = 630;
    p.vy = -TREAT_JUMP * 0.6;
  }

  // ── Animate ───────────────────────────────────────────────────────────
  _animateRun(p, dt);
}

function _resolveCollisions(p, dt) {
  const world = state.world;
  const allPlatforms = _getActivePlatforms();
  p.onGround = false;

  // Move horizontally first
  p.x += p.vx * dt;

  for (const plat of allPlatforms) {
    if (_overlaps(p, plat)) {
      if (p.vx > 0) { p.x = plat.x - p.w; p.vx = 0; }
      else if (p.vx < 0) { p.x = plat.x + plat.w; p.vx = 0; }
    }
  }

  // Move vertically
  p.y += p.vy * dt;

  for (const plat of allPlatforms) {
    if (_overlaps(p, plat)) {
      if (p.vy >= 0) {
        p.y        = plat.y - p.h;
        p.vy       = 0;
        p.onGround = true;

        // Trigger crumble/dissolve on landing
        if (plat.crumble && !plat.crumbled && plat.crumbleTimer === 0) {
          plat.crumbleTimer = CRUMBLE_DELAY;
        }
        if (plat.dissolve && !plat.dissolved && plat.dissolveTimer === 0) {
          plat.dissolveTimer = DISSOLVE_DELAY;
        }
      } else {
        p.y  = plat.y + plat.h;
        p.vy = 0;
      }
    }
  }
}

// Get all collidable platforms (static + moving, excluding crumbled/dissolved)
function _getActivePlatforms() {
  const world = state.world;
  const result = [];

  for (const p of world.platforms) {
    if (p.crumbled || p.dissolved) continue;
    result.push(p);
  }

  for (const mp of world.movingPlatforms) {
    result.push(mp);
  }

  return result;
}

function _overlaps(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// ── Enemies ──────────────────────────────────────────────────────────────────

function _updateEnemies(dt) {
  if (!state.world.enemies) return;

  for (const e of state.world.enemies) {
    if (e.type === 'bat') {
      // Patrol horizontally
      e.x += e.speed * e.dir * dt;
      if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
      if (e.x >= e.maxX) { e.x = e.maxX; e.dir = -1; }
      // Bob up and down
      e.y += Math.sin(state.tick * 0.08) * 0.5;

    } else if (e.type === 'snowball') {
      // Roll along the ground
      e.x += e.speed * e.dir * dt;
      if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
      if (e.x >= e.maxX) { e.x = e.maxX; e.dir = -1; }

    } else if (e.type === 'fire') {
      // Periodic geyser — active for half the period
      e._active = ((state.tick + (e.offset || 0)) % (e.period || 180)) < ((e.period || 180) / 2);
    }
  }
}

function _checkEnemyCollisions() {
  if (!state.world.enemies) return;
  const p = state.player;
  const hasTreat = p.treatTimer > 0;

  for (const e of state.world.enemies) {
    if (e.type === 'fire' && !e._active) continue;

    if (_overlaps(p, e)) {
      if (hasTreat) {
        // Invincible — knock enemy away
        e.dir = -e.dir;
      } else {
        state.mode = 'over';
        return;
      }
    }
  }
}

// ── Moving Platforms ─────────────────────────────────────────────────────────

function _updateMovingPlatforms(dt) {
  if (!state.world.movingPlatforms) return;

  for (const mp of state.world.movingPlatforms) {
    if (!mp._dir) mp._dir = 1;

    if (mp.axis === 'x') {
      mp.x += mp.speed * mp._dir * dt;
      if (mp.x <= mp.minX) { mp.x = mp.minX; mp._dir = 1; }
      if (mp.x >= mp.maxX) { mp.x = mp.maxX; mp._dir = -1; }
    } else {
      mp.y += mp.speed * mp._dir * dt;
      if (mp.y <= mp.minY) { mp.y = mp.minY; mp._dir = 1; }
      if (mp.y >= mp.maxY) { mp.y = mp.maxY; mp._dir = -1; }
    }
  }
}

// ── Crumble / Dissolve Platforms ─────────────────────────────────────────────

function _updateCrumblePlatforms(dt) {
  for (const plat of state.world.platforms) {
    if (plat.crumble && plat.crumbleTimer > 0) {
      plat.crumbleTimer--;
      if (plat.crumbleTimer <= 0) {
        plat.crumbled = true;
        // Respawn after 3 seconds
        setTimeout(() => {
          plat.crumbled = false;
          plat.crumbleTimer = 0;
        }, 3000);
      }
    }
    if (plat.dissolve && plat.dissolveTimer > 0) {
      plat.dissolveTimer--;
      if (plat.dissolveTimer <= 0) {
        plat.dissolved = true;
        // Respawn after 4 seconds
        setTimeout(() => {
          plat.dissolved = false;
          plat.dissolveTimer = 0;
        }, 4000);
      }
    }
  }
}

// ── Camera ────────────────────────────────────────────────────────────────────

function _updateCamera() {
  const target = state.player.x - canvas.width * 0.35;
  const maxCam = state.world.width - canvas.width;
  state.camera.x = Math.max(0, Math.min(target, maxCam));
}

// ── Hazards ──────────────────────────────────────────────────────────────────

function _checkHazards(dt) {
  if (!state.world.hazards) return;
  const p = state.player;
  const hasTreat = p.treatTimer > 0;

  for (const h of state.world.hazards) {
    if (h.type === 'mud') {
      // Slow zone — reduce speed when overlapping
      if (_overlaps(p, h)) {
        p.vx *= 0.5;
      }
    } else if (h.type === 'lava') {
      // Instant death (unless treat)
      if (_overlaps(p, h)) {
        if (!hasTreat) {
          state.mode = 'over';
          return;
        } else {
          p.vy = -TREAT_JUMP * 0.5;
          p.y = h.y - p.h - 10;
        }
      }
    } else if (h.type === 'hydrant') {
      // Knockback obstacle
      if (_overlaps(p, h)) {
        if (p.vx > 0) { p.x = h.x - p.w; p.vx = -80; }
        else { p.x = h.x + h.w; p.vx = 80; }
      }
    } else if (h.type === 'wind') {
      // Horizontal force
      if (_overlaps(p, h)) {
        p.vx += h.dir * h.strength * dt;
      }
    }
  }
}

// ── Collectibles ──────────────────────────────────────────────────────────────

function _checkCollectibles() {
  const p = state.player;

  for (const bone of state.world.bones) {
    if (!bone.collected && _overlaps(p, bone)) {
      bone.collected = true;
      state.score++;
    }
  }

  for (const treat of state.world.treats) {
    if (!treat.collected && _overlaps(p, treat)) {
      treat.collected    = true;
      p.treatTimer       = TREAT_TICKS;
      p.jumpsLeft        = 2; // immediately grant double-jump
    }
  }
}

function _checkGoal() {
  const f = state.world.flag;
  const p = state.player;
  if (!f.collected && _overlaps(p, { x: f.x, y: f.y, w: 20, h: 96 })) {
    f.collected    = true;
    state.levelWon = true;

    // Determine which command to unlock next
    const nextUnlockIdx = state.level - 1; // level 1 beat = unlock index 0
    if (nextUnlockIdx < UNLOCK_ORDER.length) {
      const nextCmd = UNLOCK_ORDER[nextUnlockIdx];
      state.unlockedCommands.push(nextCmd);
      startTraining(nextCmd);
    } else {
      // All commands unlocked — just show win screen
      state.mode = 'over';
    }
  }
}

// ── Animation helpers ─────────────────────────────────────────────────────────

function _animateRun(p, dt) {
  if (!p.onGround) {
    p.animFrame = 2; // airborne frame
    return;
  }
  if (Math.abs(p.vx) > 10) {
    p.animTimer += dt;
    if (p.animTimer > (p.treatTimer > 0 ? 0.07 : 0.12)) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % 2;
    }
  } else {
    p.animFrame = 0; // idle
  }
}
