// World initialisation — generates level layout from hand-crafted definitions
// Falls back to procedural generation for levels beyond the 7 defined ones

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
  const levelNum = state.level;
  const def = getLevelDef(levelNum);

  // Generate level from definition
  const generated = def.generate(rand);
  const levelWidth = def.width;

  const platforms = generated.platforms;
  const hazards = generated.hazards || [];
  const enemies = generated.enemies || [];
  const movingPlatforms = generated.movingPlatforms || [];

  // Bones (collectibles) — one floating above each non-ground platform
  const bones = [];
  for (const p of platforms) {
    if (p.isGround) continue;
    bones.push({
      x:       p.x + p.w / 2,
      y:       p.y - 28,
      w:       16,
      h:       16,
      collected: false,
    });
  }

  // Treats (power-ups) — one every ~4 non-ground platforms
  const treats = [];
  let platCount = 0;
  for (const p of platforms) {
    if (p.isGround) continue;
    platCount++;
    if (platCount % 4 === 0) {
      treats.push({
        x: p.x + p.w / 2,
        y: p.y - 24,
        w: 18,
        h: 18,
        collected: false,
      });
    }
  }

  // Goal flag at end of level
  const flag = { x: levelWidth - 80, y: GROUND_Y - 96, collected: false };

  state.world = {
    seed, platforms, bones, treats, flag,
    width: levelWidth,
    hazards, enemies, movingPlatforms,
    theme: def.theme,
    levelDef: def,
  };
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
