// Game logic — called once per frame during 'play' mode
// dt: delta time in seconds (fixed at 1/60)

const GRAVITY      = 1400;  // px/s²
const MOVE_SPD     = 220;   // px/s horizontal (normal)
const JUMP_SPD     = 560;   // px/s initial vertical velocity (normal)
const SIT_TICKS    = 36;    // frames Buddy stays sitting after command

const TREAT_MOVE   = 400;   // px/s while hopped up on treats
const TREAT_JUMP   = 740;   // px/s jump while on treats
const TREAT_TICKS  = 420;   // 7 seconds at 60fps

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
  const p   = state.player;
  const inp = state.input;

  // Treat timer countdown
  if (p.treatTimer > 0) p.treatTimer--;

  const hasTreat = p.treatTimer > 0;
  const movSpd   = hasTreat ? TREAT_MOVE : MOVE_SPD;
  const jumpSpd  = hasTreat ? TREAT_JUMP : JUMP_SPD;
  const maxJumps = hasTreat ? 2 : 1;

  // ── Sit command ──────────────────────────────────────────────────────────
  if (inp.sit && p.onGround && !hasTreat) {
    // Treats make Buddy too hyper to sit
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
    p.vx          = -movSpd;
    p.facingRight = false;
  } else if (inp.right) {
    p.vx          = movSpd;
    p.facingRight = true;
  } else {
    p.vx *= 0.78;
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

  // ── Move + collide ───────────────────────────────────────────────────────
  _resolveCollisions(p, dt);

  // Restore jumps when landing (resolve sets onGround)
  if (p.onGround) p.jumpsLeft = maxJumps;

  // ── Clamp to left edge ───────────────────────────────────────────────────
  if (p.x < 0) { p.x = 0; p.vx = 0; }

  // ── Fell off bottom — game over (treats make Buddy invincible) ───────────
  if (p.y > 640 && !hasTreat) {
    state.mode = 'over';
    return;
  } else if (p.y > 640 && hasTreat) {
    // bounce back up instead
    p.y  = 630;
    p.vy = -TREAT_JUMP * 0.6;
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
        p.y        = plat.y - p.h;
        p.vy       = 0;
        p.onGround = true;
      } else {
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
    f.collected = true;
    state.mode  = 'over';
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
