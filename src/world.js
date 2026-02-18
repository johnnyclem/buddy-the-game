// World initialisation — generates platforms and collectibles from a seed
// seed: integer used to deterministically generate level layout

const GROUND_Y    = 480;  // y-coordinate of the ground surface (canvas height 540)
const TILE        = 32;   // base grid unit

// ── Seeded RNG (mulberry32) ───────────────────────────────────────────────────
function _rng(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function createWorld(seed) {
  const rand = _rng(seed);

  // Ground: one long platform across the whole level
  const levelWidth = 6000;
  const platforms = [
    { x: -200, y: GROUND_Y, w: levelWidth + 400, h: 60, isGround: true },
  ];

  // Generate floating platforms with gaps
  let cx = 320;
  while (cx < levelWidth - 200) {
    const w    = TILE * (3 + Math.floor(rand() * 5));   // 3–7 tiles wide
    const h    = TILE;
    const y    = GROUND_Y - TILE * (3 + Math.floor(rand() * 5)); // 3–7 tiles up
    platforms.push({ x: cx, y, w, h, isGround: false });
    cx += w + TILE * (2 + Math.floor(rand() * 4));      // gap 2–5 tiles
  }

  // Bones (collectibles) — one floating above each platform
  const bones = [];
  for (let i = 1; i < platforms.length; i++) {
    const p = platforms[i];
    bones.push({
      x:       p.x + p.w / 2,
      y:       p.y - 28,
      w:       16,
      h:       16,
      collected: false,
    });
  }

  // Goal flag at end of level
  const flag = { x: levelWidth - 80, y: GROUND_Y - 96, collected: false };

  state.world = { seed, platforms, bones, flag, width: levelWidth };
  state.score = 0;

  // Reset player to start position
  const p = state.player;
  p.x           = 80;
  p.y           = GROUND_Y - p.h;
  p.vx          = 0;
  p.vy          = 0;
  p.onGround    = false;
  p.facingRight = true;
  p.sitting     = false;
  p.sitTimer    = 0;
  p.jumpPressed = false;
  p.animFrame   = 0;
  p.animTimer   = 0;

  state.camera.x = 0;
}
