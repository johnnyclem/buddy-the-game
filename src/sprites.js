// Spritesheet loader & animator
// ─────────────────────────────────────────────────────────────────────────────
// Drop PNG spritesheets into assets/ and register them here.
//
// Expected spritesheet layout: a single row (or grid) of equally-sized frames.
// Configure each sheet with frameW, frameH, and optional row count.
//
// Usage:
//   1. Place your spritesheet PNG in assets/
//   2. Call Sprites.load('key', 'assets/my-sheet.png', frameW, frameH, cols, rows)
//   3. Define animation sequences with Sprites.defineAnim(...)
//   4. In your render loop: Sprites.draw(ctx, 'animName', x, y, tick, opts)
// ─────────────────────────────────────────────────────────────────────────────

const Sprites = (() => {

  // ── Internal stores ──────────────────────────────────────────────────────

  /** @type {Map<string, {img: HTMLImageElement, ready: boolean, frameW: number, frameH: number, cols: number, rows: number}>} */
  const sheets = new Map();

  /** @type {Map<string, {sheet: string, frames: number[], fps: number, loop: boolean, flipH: boolean}>} */
  const anims = new Map();

  // ── Loading ──────────────────────────────────────────────────────────────

  /**
   * Load a spritesheet image.
   * @param {string} key      - Unique identifier for this sheet
   * @param {string} src      - Path to the PNG file (e.g. 'assets/buddy-run.png')
   * @param {number} frameW   - Width of a single frame in px
   * @param {number} frameH   - Height of a single frame in px
   * @param {number} [cols]   - Number of columns (auto-detected from image width if omitted)
   * @param {number} [rows=1] - Number of rows
   * @returns {Promise<void>}
   */
  function load(key, src, frameW, frameH, cols, rows = 1) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = cols || Math.floor(img.naturalWidth / frameW);
        sheets.set(key, { img, ready: true, frameW, frameH, cols: c, rows });
        resolve();
      };
      img.onerror = () => {
        console.warn(`[Sprites] Failed to load "${src}" for key "${key}"`);
        sheets.set(key, { img, ready: false, frameW, frameH, cols: cols || 1, rows });
        reject(new Error(`Failed to load spritesheet: ${src}`));
      };
      img.src = src;
    });
  }

  /**
   * Load multiple sheets at once. Returns a single promise.
   * @param {Array<[string, string, number, number, number?, number?]>} entries
   *   Each entry: [key, src, frameW, frameH, cols?, rows?]
   * @returns {Promise<void>}
   */
  function loadAll(entries) {
    return Promise.all(entries.map(e => load(...e))).then(() => {});
  }

  // ── Animation definitions ────────────────────────────────────────────────

  /**
   * Define a named animation sequence.
   * @param {string} name      - Animation name (e.g. 'buddy-run', 'cloud-drift')
   * @param {string} sheet     - Key of the loaded spritesheet
   * @param {number[]} frames  - Ordered list of frame indices (0-based, row-major)
   * @param {object} [opts]
   * @param {number} [opts.fps=10]     - Playback speed in frames per second
   * @param {boolean} [opts.loop=true] - Whether the animation loops
   * @param {boolean} [opts.flipH=false] - Mirror horizontally when drawing
   */
  function defineAnim(name, sheet, frames, opts = {}) {
    anims.set(name, {
      sheet,
      frames,
      fps:   opts.fps   ?? 10,
      loop:  opts.loop  ?? true,
      flipH: opts.flipH ?? false,
    });
  }

  // ── Drawing ──────────────────────────────────────────────────────────────

  /**
   * Draw one frame of a named animation.
   * @param {CanvasRenderingContext2D} c - Canvas context
   * @param {string} animName           - Registered animation name
   * @param {number} x                  - Destination X (top-left)
   * @param {number} y                  - Destination Y (top-left)
   * @param {number} tick               - Current game tick (drives frame selection)
   * @param {object} [opts]
   * @param {number} [opts.scale=1]     - Draw scale multiplier
   * @param {boolean} [opts.flipH]      - Override anim's flipH for this call
   * @param {number} [opts.alpha=1]     - Opacity
   * @param {number} [opts.frameOverride] - Force a specific frame index in the sequence
   */
  function draw(c, animName, x, y, tick, opts = {}) {
    const anim = anims.get(animName);
    if (!anim) return;

    const sheetData = sheets.get(anim.sheet);
    if (!sheetData || !sheetData.ready) return;

    const { img, frameW, frameH, cols } = sheetData;
    const { frames, fps, loop } = anim;
    const scale = opts.scale ?? 1;
    const alpha = opts.alpha ?? 1;
    const flip  = opts.flipH ?? anim.flipH;

    // Pick the current frame from the sequence
    let seqIdx;
    if (opts.frameOverride !== undefined) {
      seqIdx = opts.frameOverride % frames.length;
    } else {
      const ticksPerFrame = Math.max(1, Math.round(60 / fps));
      const raw = Math.floor(tick / ticksPerFrame);
      seqIdx = loop ? raw % frames.length : Math.min(raw, frames.length - 1);
    }
    const frameIdx = frames[seqIdx];

    // Compute source rectangle (row-major frame index → col, row)
    const srcCol = frameIdx % cols;
    const srcRow = Math.floor(frameIdx / cols);
    const sx = srcCol * frameW;
    const sy = srcRow * frameH;

    // Destination dimensions
    const dw = frameW * scale;
    const dh = frameH * scale;

    c.save();
    c.globalAlpha = alpha;

    if (flip) {
      c.translate(x + dw, y);
      c.scale(-1, 1);
      c.drawImage(img, sx, sy, frameW, frameH, 0, 0, dw, dh);
    } else {
      c.drawImage(img, sx, sy, frameW, frameH, x, y, dw, dh);
    }

    c.restore();
  }

  /**
   * Draw a single static frame from a sheet (no animation).
   * @param {CanvasRenderingContext2D} c
   * @param {string} sheetKey - Loaded sheet key
   * @param {number} frameIdx - Frame index (row-major)
   * @param {number} x
   * @param {number} y
   * @param {object} [opts]
   * @param {number} [opts.scale=1]
   * @param {boolean} [opts.flipH=false]
   * @param {number} [opts.alpha=1]
   */
  function drawFrame(c, sheetKey, frameIdx, x, y, opts = {}) {
    const sheetData = sheets.get(sheetKey);
    if (!sheetData || !sheetData.ready) return;

    const { img, frameW, frameH, cols } = sheetData;
    const scale = opts.scale ?? 1;
    const alpha = opts.alpha ?? 1;
    const flip  = opts.flipH ?? false;

    const srcCol = frameIdx % cols;
    const srcRow = Math.floor(frameIdx / cols);
    const sx = srcCol * frameW;
    const sy = srcRow * frameH;
    const dw = frameW * scale;
    const dh = frameH * scale;

    c.save();
    c.globalAlpha = alpha;

    if (flip) {
      c.translate(x + dw, y);
      c.scale(-1, 1);
      c.drawImage(img, sx, sy, frameW, frameH, 0, 0, dw, dh);
    } else {
      c.drawImage(img, sx, sy, frameW, frameH, x, y, dw, dh);
    }

    c.restore();
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  /** Check if a spritesheet has finished loading. */
  function isReady(sheetKey) {
    const s = sheets.get(sheetKey);
    return s ? s.ready : false;
  }

  /** Get the frame dimensions for a loaded sheet. */
  function getFrameSize(sheetKey) {
    const s = sheets.get(sheetKey);
    return s ? { w: s.frameW, h: s.frameH } : null;
  }

  /** Get total frame count for a sheet. */
  function getFrameCount(sheetKey) {
    const s = sheets.get(sheetKey);
    return s ? s.cols * s.rows : 0;
  }

  /** List all registered animation names. */
  function listAnims() {
    return [...anims.keys()];
  }

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    load,
    loadAll,
    defineAnim,
    draw,
    drawFrame,
    isReady,
    getFrameSize,
    getFrameCount,
    listAnims,
  };

})();
