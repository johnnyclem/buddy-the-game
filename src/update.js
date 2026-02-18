// Game logic — called once per frame during 'play' mode
// dt: delta time in seconds (fixed at 1/60)

const GRAVITY   = 1400;  // px/s²
const MOVE_SPD  = 220;   // px/s horizontal
const JUMP_SPD  = 560;   // px/s initial vertical velocity
const SIT_TICKS = 36;    // frames Buddy stays sitting after command

function update(dt) {
  applyTiltInput(); // map device orientation → state.input before game logic

  state.tick++;

  if (!state.world) return;

  _updatePlayer(dt);
  _updateCamera();
  _checkCollectibles();
  _checkGoal();
}

// ── Player ────────────────────────────────────────────────────────────────────

function _updatePlayer(dt) {
  const p    = state.player;
  const inp  = state.input;

  // ── Sit command ──────────────────────────────────────────────────────────
  if (inp.sit && p.onGround) {
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
    // still apply gravity so Buddy doesn't float
    p.vy += GRAVITY * dt;
    _resolveCollisions(p, dt);
    _animateSit(p, dt);
    return;
  }

  // ── Horizontal movement ──────────────────────────────────────────────────
  if (inp.left) {
    p.vx          = -MOVE_SPD;
    p.facingRight = false;
  } else if (inp.right) {
    p.vx          = MOVE_SPD;
    p.facingRight = true;
  } else {
    // friction
    p.vx *= 0.78;
    if (Math.abs(p.vx) < 4) p.vx = 0;
  }

  // ── Jump (edge-triggered) ────────────────────────────────────────────────
  if (inp.jump && !p.jumpPressed && p.onGround) {
    p.vy         = -JUMP_SPD;
    p.onGround   = false;
    p.jumpPressed = true;
  }
  if (!inp.jump) {
    p.jumpPressed = false;
  }

  // ── Gravity ──────────────────────────────────────────────────────────────
  p.vy += GRAVITY * dt;

  // ── Move + collide ───────────────────────────────────────────────────────
  _resolveCollisions(p, dt);

  // ── Clamp to left edge ───────────────────────────────────────────────────
  if (p.x < 0) { p.x = 0; p.vx = 0; }

  // ── Fell off bottom — game over ──────────────────────────────────────────
  if (p.y > 640) {
    state.mode = 'over';
    return;
  }

  // ── Animate ─────────────────────────────────────────────────────────────
  _animateRun(p, dt);
}

function _resolveCollisions(p, dt) {
  const platforms = state.world.platforms;
  p.onGround = false;

  // Move horizontally first
  p.x += p.vx * dt;

  for (const plat of platforms) {
    if (_overlaps(p, plat)) {
      if (p.vx > 0) { p.x = plat.x - p.w; p.vx = 0; }
      else if (p.vx < 0) { p.x = plat.x + plat.w; p.vx = 0; }
    }
  }

  // Move vertically
  p.y += p.vy * dt;

  for (const plat of platforms) {
    if (_overlaps(p, plat)) {
      if (p.vy >= 0) {
        // landing on top
        p.y        = plat.y - p.h;
        p.vy       = 0;
        p.onGround = true;
      } else {
        // hitting underside
        p.y  = plat.y + plat.h;
        p.vy = 0;
      }
    }
  }
}

function _overlaps(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// ── Camera ────────────────────────────────────────────────────────────────────

function _updateCamera() {
  const target = state.player.x - canvas.width * 0.35;
  const maxCam = state.world.width - canvas.width;
  state.camera.x = Math.max(0, Math.min(target, maxCam));
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
}

function _checkGoal() {
  const f = state.world.flag;
  const p = state.player;
  if (!f.collected && _overlaps(p, { x: f.x, y: f.y, w: 20, h: 96 })) {
    f.collected = true;
    state.mode  = 'over'; // TODO: proper win screen
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
    if (p.animTimer > 0.12) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % 2; // alternate run frames
    }
  } else {
    p.animFrame = 0; // idle
  }
}

function _animateSit(p, dt) {
  p.animFrame = 3;
}
