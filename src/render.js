// Rendering — all draw calls go through render()

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.mode === 'menu') {
    _renderMenu();
  } else if (state.mode === 'play') {
    _renderGame();
  } else if (state.mode === 'over') {
    _renderGameOver();
  }

  _renderVoiceFeedback(); // overlay: transcript + Buddy's reaction
  _renderHud();
}

// ── Screens ──────────────────────────────────────────────────────────────────

function _renderMenu() {
  const W = canvas.width;
  const H = canvas.height;
  const t = state.tick;

  // ── Deep space background ─────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,    '#010a1a');
  grad.addColorStop(0.55, '#061a4a');
  grad.addColorStop(1,    '#0d2a6e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Twinkling stars ───────────────────────────────────────────────────────
  // [xFrac, yFrac, size, twinkleSpeed, phaseOffset]
  const starDefs = [
    [0.04, 0.06, 2, 0.055, 0.0], [0.11, 0.12, 1, 0.080, 1.2],
    [0.18, 0.04, 2, 0.048, 2.4], [0.27, 0.19, 1, 0.092, 0.8],
    [0.35, 0.08, 2, 0.071, 1.9], [0.44, 0.14, 1, 0.063, 3.1],
    [0.52, 0.05, 2, 0.082, 0.4], [0.61, 0.10, 1, 0.051, 2.2],
    [0.70, 0.07, 2, 0.089, 1.5], [0.79, 0.15, 1, 0.074, 3.7],
    [0.88, 0.05, 2, 0.060, 0.9], [0.93, 0.17, 1, 0.078, 2.6],
    [0.08, 0.28, 1, 0.052, 1.1], [0.22, 0.23, 2, 0.068, 3.3],
    [0.38, 0.31, 1, 0.093, 0.6], [0.55, 0.25, 2, 0.057, 2.8],
    [0.72, 0.29, 1, 0.084, 4.2], [0.84, 0.22, 2, 0.049, 1.7],
    [0.96, 0.27, 1, 0.072, 3.0], [0.16, 0.38, 2, 0.061, 2.1],
  ];
  for (const [xf, yf, sz, spd, off] of starDefs) {
    const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * spd + off));
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(Math.round(xf * W), Math.round(yf * H), sz, sz);
  }
  ctx.globalAlpha = 1;

  // ── Crescent moon ─────────────────────────────────────────────────────────
  const moonX = Math.round(W * 0.83);
  const moonY = Math.round(H * 0.13);
  // Moon glow (pulsing)
  ctx.globalAlpha = 0.12 + 0.06 * Math.sin(t * 0.028);
  ctx.fillStyle   = '#fffde7';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Moon body
  ctx.fillStyle = '#fffde7';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
  ctx.fill();
  // Crescent cutout (draw sky-coloured circle offset)
  ctx.fillStyle = '#061a4a';
  ctx.beginPath();
  ctx.arc(moonX + 11, moonY - 5, 18, 0, Math.PI * 2);
  ctx.fill();
  // Moon surface craters (pixel art dots)
  ctx.fillStyle = 'rgba(200,190,150,0.4)';
  ctx.fillRect(moonX - 14, moonY + 2,  4, 4);
  ctx.fillRect(moonX - 8,  moonY + 10, 3, 3);
  ctx.fillRect(moonX - 16, moonY - 6,  2, 2);

  // ── Drifting clouds ───────────────────────────────────────────────────────
  const cloudDefs = [
    { x: 80,  y: 68,  w: 140, h: 36, spd: 0.22 },
    { x: 360, y: 105, w: 108, h: 28, spd: 0.30 },
    { x: 620, y: 52,  w: 170, h: 44, spd: 0.16 },
    { x: 840, y: 90,  w: 124, h: 34, spd: 0.26 },
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (const c of cloudDefs) {
    const cx = ((c.x - t * c.spd) % (W + c.w) + W + c.w) % (W + c.w) - c.w;
    ctx.fillRect(cx + c.w * 0.20, c.y + c.h * 0.40, c.w * 0.60, c.h * 0.60);
    ctx.fillRect(cx + c.w * 0.10, c.y + c.h * 0.25, c.w * 0.40, c.h * 0.55);
    ctx.fillRect(cx + c.w * 0.45, c.y,               c.w * 0.40, c.h * 0.60);
    ctx.fillRect(cx,               c.y + c.h * 0.40, c.w,        c.h * 0.60);
  }

  // ── Silhouette hills (background layer) ───────────────────────────────────
  const groundY = Math.round(H * 0.77);
  const hillDefs = [
    { cx: 0.06, r: 75 }, { cx: 0.22, r: 105 }, { cx: 0.40, r: 88 },
    { cx: 0.57, r: 115 },{ cx: 0.74, r: 92  }, { cx: 0.91, r: 80 },
  ];
  ctx.fillStyle = '#0b2060';
  for (const h of hillDefs) {
    ctx.beginPath();
    ctx.arc(h.cx * W, groundY + 2, h.r, Math.PI, 0);
    ctx.fill();
  }

  // ── Ground strip (grass + dirt) ───────────────────────────────────────────
  // Grass
  ctx.fillStyle = '#1d9632';
  ctx.fillRect(0, groundY, W, 8);
  ctx.fillStyle = '#16751f';
  ctx.fillRect(0, groundY + 8, W, 4);
  // Dirt body
  ctx.fillStyle = '#6b3f1e';
  ctx.fillRect(0, groundY + 12, W, H - groundY);
  // Dirt accent stripe
  ctx.fillStyle = '#4e2c12';
  ctx.fillRect(0, groundY + 22, W, 4);
  // Scrolling vertical tile seams
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  const tileW   = 32;
  const tileOff = Math.floor(t * 0.7) % tileW;
  for (let tx = -tileOff; tx < W; tx += tileW) {
    ctx.fillRect(tx, groundY + 12, 1, H - groundY);
  }
  // Small pixel grass tufts
  ctx.fillStyle = '#2ab83e';
  const tuftSeeds = [40, 112, 188, 265, 342, 430, 510, 598, 680, 760, 840, 920];
  for (const ts of tuftSeeds) {
    ctx.fillRect(ts, groundY - 3, 4, 3);
    ctx.fillRect(ts + 6, groundY - 2, 3, 2);
  }

  // ── Buddy running along the ground ────────────────────────────────────────
  const buddyScale  = 1.5;
  const buddyH      = Math.ceil(32 * buddyScale);
  const buddyPeriod = 320;
  const buddyPhase  = (t % buddyPeriod) / buddyPeriod;         // 0 → 1
  const buddyFrac   = buddyPhase < 0.5
    ? buddyPhase * 2            // 0 → 1 (running right)
    : 2 - buddyPhase * 2;       // 1 → 0 (running left)
  const buddyFacing = buddyPhase < 0.5;
  const buddyRunX   = Math.round(W * 0.07 + buddyFrac * W * 0.82);
  const buddyRunY   = groundY - buddyH;
  const buddyAnim   = Math.floor(t / 7) % 2 === 0 ? 0 : 1;
  _drawBuddy(buddyRunX, buddyRunY, buddyFacing, buddyAnim, buddyScale, false);

  // "WOOF!" speech bubble — pops up periodically
  const woofCycle = t % 200;
  if (woofCycle > 155 && woofCycle < 195) {
    const bx = buddyRunX + (buddyFacing ? 10 : -70);
    const by = buddyRunY - 28;
    ctx.fillStyle   = '#ffffff';
    ctx.fillRect(bx, by, 66, 22);
    ctx.fillStyle   = '#000000';
    ctx.font        = '8px "Press Start 2P"';
    ctx.textAlign   = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('WOOF!', bx + 6, by + 7);
    // Little speech triangle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (buddyFacing) {
      ctx.moveTo(bx + 6,  by + 22);
      ctx.lineTo(bx + 16, by + 22);
      ctx.lineTo(bx + 6,  by + 30);
    } else {
      ctx.moveTo(bx + 50, by + 22);
      ctx.lineTo(bx + 60, by + 22);
      ctx.lineTo(bx + 60, by + 30);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ── Decorative floating bones ─────────────────────────────────────────────
  const boneY = H * 0.51;
  _drawBone(W * 0.10, boneY + Math.sin(t * 0.055) * 7);
  _drawBone(W * 0.90, boneY + Math.sin(t * 0.055 + Math.PI) * 7);

  // ── Title text — "BUDDY'S QUEST" ──────────────────────────────────────────
  const titleY = Math.round(H * 0.20 + Math.sin(t * 0.038) * 3);
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = '38px "Press Start 2P"';

  // Chunky 8-bit multi-layer shadow
  ctx.fillStyle = '#00004a';
  ctx.fillText("BUDDY'S QUEST", W / 2 + 5, titleY + 5);
  ctx.fillStyle = '#000080';
  ctx.fillText("BUDDY'S QUEST", W / 2 + 3, titleY + 3);

  // Shimmer: cycles warm-gold ↔ bright-white ↔ amber
  const shimmer  = (Math.sin(t * 0.042) + 1) / 2;          // 0 → 1
  const shimmerR = 255;
  const shimmerG = Math.round(195 + shimmer * 60);
  const shimmerB = Math.round(shimmer * 60);
  ctx.fillStyle  = `rgb(${shimmerR},${shimmerG},${shimmerB})`;
  ctx.fillText("BUDDY'S QUEST", W / 2, titleY);

  // Subtle outline to pop against any background
  ctx.strokeStyle = 'rgba(0,0,60,0.5)';
  ctx.lineWidth   = 1;
  ctx.strokeText("BUDDY'S QUEST", W / 2, titleY);

  // ── Subtitle ──────────────────────────────────────────────────────────────
  ctx.font      = '11px "Press Start 2P"';
  ctx.fillStyle = `rgba(140,200,255,${0.6 + 0.2 * Math.sin(t * 0.05)})`;
  ctx.fillText('A GOOD BOY ADVENTURE', W / 2, titleY + 42);

  // ── Prompt text (blinking) ────────────────────────────────────────────────
  const isMobile     = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const blinkVisible = t % 64 < 44;   // on for ~44 frames, off for ~20

  ctx.font = '11px "Press Start 2P"';
  if (blinkVisible) {
    ctx.fillStyle = '#ffd23f';
    if (isMobile) {
      ctx.fillText('TAP START  OR  SAY "JUMP BUDDY"', W / 2, H * 0.905);
    } else {
      ctx.fillText('PRESS ENTER OR CLICK START', W / 2, H * 0.905);
    }
  }
  ctx.font      = '9px "Press Start 2P"';
  ctx.fillStyle = 'rgba(255,255,255,0.50)';
  if (isMobile) {
    ctx.fillText('TILT DEVICE TO MOVE', W / 2, H * 0.955);
  } else {
    ctx.fillText('ARROWS / WASD + SPACE TO PLAY', W / 2, H * 0.955);
  }

  // ── 8-bit pixel border frame ──────────────────────────────────────────────
  const borderAlpha = 0.65 + 0.35 * Math.sin(t * 0.05);
  ctx.strokeStyle = `rgba(255,210,63,${borderAlpha})`;
  ctx.lineWidth   = 4;
  ctx.strokeRect(4, 4, W - 8, H - 8);
  // Corner squares
  ctx.fillStyle = `rgba(255,210,63,${borderAlpha})`;
  const cs = 10;
  ctx.fillRect(4,       4,       cs, cs);
  ctx.fillRect(W-4-cs,  4,       cs, cs);
  ctx.fillRect(4,       H-4-cs,  cs, cs);
  ctx.fillRect(W-4-cs,  H-4-cs,  cs, cs);
  // Mid-edge tick marks
  ctx.fillRect(W / 2 - cs / 2, 4,      cs, 4);
  ctx.fillRect(W / 2 - cs / 2, H - 8,  cs, 4);
  ctx.fillRect(4,      H / 2 - cs / 2, 4, cs);
  ctx.fillRect(W - 8,  H / 2 - cs / 2, 4, cs);

  // ── CRT scanline overlay ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  for (let sy = 0; sy < H; sy += 3) {
    ctx.fillRect(0, sy, W, 1);
  }
}

function _renderGame() {
  const cam = state.camera.x;
  const W   = canvas.width;
  const H   = canvas.height;

  // ── Sky ───────────────────────────────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1a5276');
  sky.addColorStop(1, '#2471a3');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Background clouds (parallax 0.3)
  _drawClouds(cam * 0.3);

  if (!state.world) return;

  ctx.save();
  ctx.translate(-cam, 0);

  // ── Platforms ─────────────────────────────────────────────────────────────
  for (const plat of state.world.platforms) {
    if (plat.x + plat.w < cam - 20 || plat.x > cam + W + 20) continue;
    _drawPlatform(plat);
  }

  // ── Bones ─────────────────────────────────────────────────────────────────
  for (const bone of state.world.bones) {
    if (!bone.collected) _drawBone(bone.x, bone.y);
  }

  // ── Treats ────────────────────────────────────────────────────────────────
  for (const treat of state.world.treats) {
    if (!treat.collected) _drawTreat(treat.x, treat.y);
  }

  // ── Flag ──────────────────────────────────────────────────────────────────
  const f = state.world.flag;
  if (!f.collected) _drawFlag(f.x, f.y);

  // ── Buddy ─────────────────────────────────────────────────────────────────
  const p = state.player;
  const hasTreat = p.treatTimer > 0;
  // Treat mode: bigger (1.4x), glowing
  if (hasTreat) {
    // Glow aura — pulse with treatTimer
    const pulse = 0.55 + 0.45 * Math.sin(state.tick * 0.18);
    ctx.save();
    ctx.globalAlpha = pulse * 0.55;
    ctx.fillStyle = '#ffd23f';
    // Draw glow ellipse behind Buddy
    ctx.beginPath();
    ctx.ellipse(
      p.x + 28, p.y + 22,
      38, 28, 0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
  _drawBuddy(p.x, p.y, p.facingRight, p.animFrame, hasTreat ? 1.4 : 1.0, hasTreat);

  ctx.restore();

  // ── Score ─────────────────────────────────────────────────────────────────
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.font         = '11px "Press Start 2P"';
  ctx.fillStyle    = '#ffd23f';
  ctx.fillText('BONES: ' + state.score, W - 12, 10);

  // ── Treat power-up bar ────────────────────────────────────────────────────
  const p2 = state.player;
  if (p2.treatTimer > 0) {
    const barW    = 160;
    const barH    = 12;
    const barX    = W / 2 - barW / 2;
    const barY    = 10;
    const fill    = p2.treatTimer / 420; // TREAT_TICKS
    // Flashing when low
    const flash   = p2.treatTimer < 90 ? (Math.sin(state.tick * 0.4) > 0) : true;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    if (flash) {
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(barX, barY, barW * fill, barH);
    }

    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth   = 2;
    ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

    ctx.fillStyle    = '#000';
    ctx.font         = '7px "Press Start 2P"';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('TREAT!', W / 2, barY + 1);
  }
}

function _renderGameOver() {
  ctx.fillStyle = '#163d7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.font      = '36px "Press Start 2P"';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

  ctx.font      = '12px "Press Start 2P"';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('BONES COLLECTED: ' + state.score, canvas.width / 2, canvas.height / 2 + 8);

  ctx.font      = '11px "Press Start 2P"';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 52);
}

// ── Voice feedback overlay ────────────────────────────────────────────────────

function _renderVoiceFeedback() {
  const now = Date.now();
  if (!state.voice.reaction || now > state.voice.reactionUntil) return;

  // Fade out during last 500 ms
  const remaining = state.voice.reactionUntil - now;
  const alpha     = remaining < 500 ? remaining / 500 : 1;

  const cx   = canvas.width / 2;
  const boxW = 400;
  const boxH = 66;
  const boxY = 14;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Background panel
  ctx.fillStyle = 'rgba(0,15,50,0.82)';
  ctx.fillRect(cx - boxW / 2, boxY, boxW, boxH);

  // Accent border
  ctx.strokeStyle = 'rgba(255,210,63,0.7)';
  ctx.lineWidth   = 2;
  ctx.strokeRect(cx - boxW / 2, boxY, boxW, boxH);

  // What was heard (small, dimmed)
  ctx.fillStyle    = 'rgba(255,255,255,0.65)';
  ctx.font         = '9px "Press Start 2P"';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  const heard = state.voice.transcript
    ? '"' + state.voice.transcript.slice(0, 34) + '"'
    : '';
  ctx.fillText(heard, cx, boxY + 10);

  // Buddy's reaction (prominent)
  ctx.fillStyle = '#ffd23f';
  ctx.font      = '13px "Press Start 2P"';
  ctx.fillText('BUDDY: ' + state.voice.reaction, cx, boxY + 34);

  ctx.restore();
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function _renderHud() {
  document.getElementById('hud').textContent = 'Mode: ' + state.mode;
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function _drawPlatform(plat) {
  if (plat.isGround) {
    // Grass top
    ctx.fillStyle = '#2ecc40';
    ctx.fillRect(plat.x, plat.y, plat.w, 8);
    // Dirt body
    ctx.fillStyle = '#7d4e2b';
    ctx.fillRect(plat.x, plat.y + 8, plat.w, plat.h - 8);
    // Darker dirt detail
    ctx.fillStyle = '#5a3620';
    ctx.fillRect(plat.x, plat.y + 20, plat.w, 4);
  } else {
    // Floating platform — stone tiles
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    // Highlight top
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(plat.x, plat.y, plat.w, 4);
    // Shadow bottom
    ctx.fillStyle = '#566573';
    ctx.fillRect(plat.x, plat.y + plat.h - 4, plat.w, 4);
    // Tile grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth   = 1;
    for (let tx = plat.x; tx < plat.x + plat.w; tx += 32) {
      ctx.beginPath();
      ctx.moveTo(tx, plat.y);
      ctx.lineTo(tx, plat.y + plat.h);
      ctx.stroke();
    }
  }
}

function _drawTreat(x, y) {
  // Bouncing star-shaped treat — yellow with sparkle
  const bob  = Math.sin(state.tick * 0.1) * 4;
  const spin = state.tick * 0.05;
  const tx   = Math.round(x);
  const ty   = Math.round(y + bob);

  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(spin);

  // Outer glow
  ctx.globalAlpha = 0.35 + 0.25 * Math.sin(state.tick * 0.15);
  ctx.fillStyle   = '#ffd23f';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a  = (i / 8) * Math.PI * 2;
    const r  = i % 2 === 0 ? 14 : 8;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Inner treat
  ctx.globalAlpha = 1;
  ctx.fillStyle   = '#ffd23f';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a  = (i / 8) * Math.PI * 2;
    const r  = i % 2 === 0 ? 9 : 5;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Centre dot
  ctx.fillStyle = '#c8860a';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function _drawBone(x, y) {
  // Bobbing animation using tick
  const bob = Math.sin(state.tick * 0.08) * 3;
  const bx  = Math.round(x - 8);
  const by  = Math.round(y + bob - 8);

  ctx.fillStyle = '#f9e4b7';

  // Horizontal shaft
  ctx.fillRect(bx + 3, by + 6, 10, 4);
  // Left knob top
  ctx.fillRect(bx, by + 4, 5, 4);
  ctx.fillRect(bx + 1, by + 2, 3, 4);
  // Left knob bottom
  ctx.fillRect(bx, by + 8, 5, 4);
  ctx.fillRect(bx + 1, by + 10, 3, 4);
  // Right knob top
  ctx.fillRect(bx + 11, by + 4, 5, 4);
  ctx.fillRect(bx + 12, by + 2, 3, 4);
  // Right knob bottom
  ctx.fillRect(bx + 11, by + 8, 5, 4);
  ctx.fillRect(bx + 12, by + 10, 3, 4);
}

function _drawFlag(x, y) {
  // Pole
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(x, y, 4, 96);

  // Flag banner (waving)
  const wave = Math.sin(state.tick * 0.1) * 3;
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + 36, y + 12 + wave);
  ctx.lineTo(x + 4, y + 24);
  ctx.closePath();
  ctx.fill();

  // "!" on flag
  ctx.fillStyle = '#ffffff';
  ctx.font      = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('!', x + 10, y + 6);
}

// Buddy the dog — pixel-art drawn with canvas rects
// scale: 1.0 for gameplay, 1.6 for title screen
// animFrame: 0=idle, 1=run-b, 2=jump, 3=sit
// hasTreat: renders cuter treat-mode version
function _drawBuddy(x, y, facingRight, animFrame, scale, hasTreat) {
  ctx.save();

  // Treat mode: slightly warmer fur, bigger, cuter
  const fur     = hasTreat ? '#ddb97e' : '#c8a96e';
  const darkFur = hasTreat ? '#b08040' : '#a0784a';
  const belly   = hasTreat ? '#f0d8a0' : '#e8c88e';

  // Flip horizontally when facing left
  if (!facingRight) {
    ctx.translate(x + 40 * scale, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }

  const s = scale;
  const r = (rx, ry, rw, rh) => ctx.fillRect(
    Math.round(x + rx * s), Math.round(y + ry * s),
    Math.ceil(rw * s), Math.ceil(rh * s)
  );

  if (animFrame === 3) {
    // ── Sitting Buddy ──────────────────────────────────────────────────────
    ctx.fillStyle = fur;
    r(8, 14, 24, 18);
    r(14, 2, 18, 16);
    ctx.fillStyle = darkFur;
    r(12, 0, 7, 10);
    r(22, 0, 7, 10);
    // Eyes
    ctx.fillStyle = '#1a1a2e';
    r(17, 6, 3, 3);
    r(24, 6, 3, 3);
    // Shine
    ctx.fillStyle = '#ffffff';
    r(18, 6, 1, 1);
    r(25, 6, 1, 1);
    // Nose
    ctx.fillStyle = '#3d1a00';
    r(20, 12, 5, 3);
    // Tongue
    ctx.fillStyle = '#ee0055';
    r(21, 15, 4, 3);
    ctx.fillStyle = fur;
    r(10, 28, 6, 4);
    r(24, 28, 6, 4);
    ctx.fillStyle = darkFur;
    r(30, 18, 6, 6);
    r(34, 14, 6, 6);
    r(36, 10, 5, 6);
  } else {
    // ── Standing / running / jumping Buddy ────────────────────────────────
    ctx.fillStyle = fur;
    r(6, 12, 28, 16);
    ctx.fillStyle = belly;
    r(10, 16, 18, 8);
    ctx.fillStyle = fur;
    r(14, 0, 18, 16);
    ctx.fillStyle = darkFur;
    r(12, -2, 7, 10);
    r(22, -2, 7, 10);

    // Eyes — bigger + sparklier with treat
    if (hasTreat) {
      ctx.fillStyle = '#1a1a2e';
      r(16, 3, 5, 5);
      r(23, 3, 5, 5);
      ctx.fillStyle = '#ffffff';
      r(17, 3, 2, 2);
      r(24, 3, 2, 2);
      // Star shine
      ctx.fillStyle = '#ffd23f';
      r(19, 4, 1, 1);
      r(26, 4, 1, 1);
      // Rosy cheeks
      ctx.fillStyle = 'rgba(255,100,100,0.45)';
      r(14, 9, 4, 3);
      r(25, 9, 4, 3);
    } else {
      ctx.fillStyle = '#1a1a2e';
      r(17, 4, 3, 3);
      r(24, 4, 3, 3);
      ctx.fillStyle = '#ffffff';
      r(18, 4, 1, 1);
      r(25, 4, 1, 1);
    }

    // Nose
    ctx.fillStyle = '#3d1a00';
    r(20, 11, 5, 3);

    // Tail — fast wag with treat
    const wagSpeed = hasTreat ? Math.sin(state.tick * 0.4) * 5 : (animFrame === 1 ? -3 : 0);
    ctx.fillStyle = darkFur;
    r(32, 10 + wagSpeed, 7, 7);
    r(36, 6 + wagSpeed, 5, 6);

    // Legs
    ctx.fillStyle = fur;
    if (animFrame === 0) {
      r(10, 26, 6, 6);
      r(18, 26, 6, 6);
      r(24, 26, 6, 6);
    } else if (animFrame === 1) {
      r(8,  26, 6, 8);
      r(20, 24, 6, 6);
      ctx.fillStyle = darkFur;
      r(16, 26, 6, 8);
      r(28, 24, 6, 6);
    } else if (animFrame === 2) {
      r(8,  22, 6, 6);
      r(26, 22, 6, 6);
      ctx.fillStyle = darkFur;
      r(14, 24, 6, 5);
      r(20, 24, 6, 5);
    }

    // Treat mode: little heart above Buddy's head
    if (hasTreat) {
      const heartBob = Math.sin(state.tick * 0.12) * 3;
      ctx.fillStyle  = '#ff4488';
      // Simple pixel heart above head
      const hx = Math.round(x + 18 * s);
      const hy = Math.round(y + (-14 + heartBob) * s);
      const hs = Math.ceil(3 * s);
      ctx.fillRect(hx,      hy + hs,    hs * 2, hs * 2);
      ctx.fillRect(hx - hs, hy,         hs * 2, hs * 2);
      ctx.fillRect(hx + hs, hy,         hs * 2, hs * 2);
      ctx.fillRect(hx,      hy + hs * 2, hs,    hs);
    }
  }

  ctx.restore();
}

function _drawClouds(parallaxX) {
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  const clouds = [
    { x: 80,  y: 60,  w: 140, h: 40 },
    { x: 340, y: 100, w: 100, h: 30 },
    { x: 560, y: 50,  w: 180, h: 50 },
    { x: 750, y: 90,  w: 120, h: 35 },
  ];
  for (const c of clouds) {
    const cx = ((c.x - parallaxX % canvas.width) + canvas.width * 2) % (canvas.width + c.w) - c.w;
    // Rounded cloud shape using overlapping rects
    ctx.fillRect(cx + c.w * 0.2, c.y + c.h * 0.4, c.w * 0.6, c.h * 0.6);
    ctx.fillRect(cx + c.w * 0.1, c.y + c.h * 0.25, c.w * 0.4, c.h * 0.5);
    ctx.fillRect(cx + c.w * 0.45, c.y, c.w * 0.4, c.h * 0.6);
    ctx.fillRect(cx, c.y + c.h * 0.4, c.w, c.h * 0.6);
  }
}
