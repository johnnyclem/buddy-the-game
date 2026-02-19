// Intro spritesheet integration
// ─────────────────────────────────────────────────────────────────────────────
// Wires spritesheet-based animations into the title screen.
//
// HOW TO ADD YOUR SPRITESHEETS:
//
// 1. Drop your PNGs into the assets/ folder.
//
// 2. Edit the INTRO_SHEETS array below. Each entry is:
//      [key, path, frameWidth, frameHeight, columns (optional), rows (optional)]
//
// 3. Edit the INTRO_ANIMS array to define animation sequences. Each entry is:
//      { name, sheet, frames, fps, loop, flipH }
//    - name:   string — unique anim name
//    - sheet:  string — must match a key from INTRO_SHEETS
//    - frames: number[] — frame indices into the spritesheet (0-based, row-major)
//    - fps:    number (default 10) — playback speed
//    - loop:   boolean (default true)
//    - flipH:  boolean (default false) — mirror horizontally
//
// 4. Edit the INTRO_LAYERS array to place animations on the title screen.
//    Each layer is drawn in order (first = behind, last = in front).
//    Properties:
//      anim:    string — name from INTRO_ANIMS
//      x:       number | function(W,H,t) — x position (or fraction 0-1 of canvas width)
//      y:       number | function(W,H,t) — y position
//      scale:   number (default 1)
//      alpha:   number (default 1) — opacity
//      flipH:   boolean | function(W,H,t) — per-draw flip override
//      visible: function(W,H,t) => boolean — optional visibility test
//
// The intro renderer will draw these layers AFTER the background and
// BEFORE the title text, so your sprites sit in the scene naturally.
// ─────────────────────────────────────────────────────────────────────────────

// ── CONFIGURE YOUR SPRITESHEETS HERE ───────────────────────────────────────

const INTRO_SHEETS = [
  // Packed spritesheet: 72 frames (9 source images x 8 sub-frames)
  // 8 cols x 9 rows, each frame 160x217px (half-res for faster loading)
  ['buddy-intro', 'assets/buddy-intro-packed.png', 160, 217, 8, 9],
];

const INTRO_ANIMS = [
  // Cycle through all 72 frames as a looping intro animation
  {
    name: 'buddy-intro-all',
    sheet: 'buddy-intro',
    frames: Array.from({ length: 72 }, (_, i) => i),
    fps: 6,
  },
];

const INTRO_LAYERS = [
  // Buddy portrait — centered in the scene, scaled to fill nicely
  {
    anim: 'buddy-intro-all',
    // Center horizontally, sit above the ground line
    // Frame is 160x217 (half-res), scale ~2x to fill ~85% of canvas height
    x: (W, H) => Math.round((W - 160 * (H / 217) * 0.85) / 2),
    y: (W, H) => Math.round(H * 0.05),
    scale: (W, H) => (H / 217) * 0.85,
    alpha: 0.9,
  },
];

// ── LOADING ────────────────────────────────────────────────────────────────

let _introSpritesReady = false;
let _introSpritesLoading = false;

/**
 * Loads all intro spritesheets and registers animations.
 * Call once at startup. Safe to call multiple times (no-op after first).
 * @returns {Promise<void>}
 */
function loadIntroSprites() {
  if (_introSpritesReady || _introSpritesLoading) return Promise.resolve();
  if (INTRO_SHEETS.length === 0) {
    _introSpritesReady = true;
    return Promise.resolve();
  }

  _introSpritesLoading = true;

  return Sprites.loadAll(INTRO_SHEETS)
    .then(() => {
      // Register all animation sequences
      for (const a of INTRO_ANIMS) {
        Sprites.defineAnim(a.name, a.sheet, a.frames, {
          fps:   a.fps,
          loop:  a.loop,
          flipH: a.flipH,
        });
      }
      _introSpritesReady = true;
      _introSpritesLoading = false;
      console.log(`[IntroSprites] Loaded ${INTRO_SHEETS.length} sheet(s), ${INTRO_ANIMS.length} anim(s)`);
    })
    .catch(err => {
      _introSpritesLoading = false;
      console.warn('[IntroSprites] Some sheets failed to load:', err);
      // Mark ready anyway so the game still works with procedural fallback
      _introSpritesReady = true;
    });
}

// ── RENDERING ──────────────────────────────────────────────────────────────

/**
 * Draw all configured intro sprite layers onto the canvas.
 * Call this from _renderMenu() wherever you want the sprites placed.
 *
 * @param {CanvasRenderingContext2D} c
 * @param {number} W - canvas width
 * @param {number} H - canvas height
 * @param {number} t - current tick
 */
function drawIntroSprites(c, W, H, t) {
  if (!_introSpritesReady || INTRO_LAYERS.length === 0) return;

  for (const layer of INTRO_LAYERS) {
    // Visibility check
    if (layer.visible && !layer.visible(W, H, t)) continue;

    // Resolve position (can be static number or function)
    const lx = typeof layer.x === 'function' ? layer.x(W, H, t) : (layer.x ?? 0);
    const ly = typeof layer.y === 'function' ? layer.y(W, H, t) : (layer.y ?? 0);

    // Resolve flip and scale (can be static or function)
    const flip  = typeof layer.flipH === 'function' ? layer.flipH(W, H, t) : layer.flipH;
    const scale = typeof layer.scale === 'function' ? layer.scale(W, H, t) : (layer.scale ?? 1);
    const alpha = typeof layer.alpha === 'function' ? layer.alpha(W, H, t) : (layer.alpha ?? 1);

    Sprites.draw(c, layer.anim, lx, ly, t, {
      scale,
      alpha,
      flipH: flip,
    });
  }
}

/**
 * Returns true if any sprite layers are configured (sheets defined).
 * Useful for deciding whether to skip the procedural Buddy drawing.
 */
function hasIntroSprites() {
  return _introSpritesReady && INTRO_LAYERS.length > 0;
}
