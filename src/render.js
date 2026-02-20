// Rendering — all draw calls go through render()

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.mode === 'menu') {
    _renderMenu();
  } else if (state.mode === 'map') {
    renderMap();
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
  ctx.globalAlpha = 0.12 + 0.06 * Math.sin(t * 0.028);
  ctx.fillStyle   = '#fffde7';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fffde7';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#061a4a';
  ctx.beginPath();
  ctx.arc(moonX + 11, moonY - 5, 18, 0, Math.PI * 2);
  ctx.fill();
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

  // ── Silhouette hills ───────────────────────────────────────────────────────
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

  // ── Ground strip ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#1d9632';
  ctx.fillRect(0, groundY, W, 8);
  ctx.fillStyle = '#16751f';
  ctx.fillRect(0, groundY + 8, W, 4);
  ctx.fillStyle = '#6b3f1e';
  ctx.fillRect(0, groundY + 12, W, H - groundY);
  ctx.fillStyle = '#4e2c12';
  ctx.fillRect(0, groundY + 22, W, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  const tileW   = 32;
  const tileOff = Math.floor(t * 0.7) % tileW;
  for (let tx = -tileOff; tx < W; tx += tileW) {
    ctx.fillRect(tx, groundY + 12, 1, H - groundY);
  }
  ctx.fillStyle = '#2ab83e';
  const tuftSeeds = [40, 112, 188, 265, 342, 430, 510, 598, 680, 760, 840, 920];
  for (const ts of tuftSeeds) {
    ctx.fillRect(ts, groundY - 3, 4, 3);
    ctx.fillRect(ts + 6, groundY - 2, 3, 2);
  }

  // ── Spritesheet layers ──────────────────────────────────────────────────
  const _hasSprites = typeof hasIntroSprites === 'function' && hasIntroSprites();
  if (typeof drawIntroSprites === 'function') {
    drawIntroSprites(ctx, W, H, t);
  }

  if (!_hasSprites) {
    const buddyScale  = 1.5;
    const buddyH      = Math.ceil(32 * buddyScale);
    const buddyPeriod = 320;
    const buddyPhase  = (t % buddyPeriod) / buddyPeriod;
    const buddyFrac   = buddyPhase < 0.5
      ? buddyPhase * 2
      : 2 - buddyPhase * 2;
    const buddyFacing = buddyPhase < 0.5;
    const buddyRunX   = Math.round(W * 0.07 + buddyFrac * W * 0.82);
    const buddyRunY   = groundY - buddyH;
    const buddyAnim   = Math.floor(t / 7) % 2 === 0 ? 0 : 1;
    _drawBuddy(buddyRunX, buddyRunY, buddyFacing, buddyAnim, buddyScale, false);

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
  }

  // ── Decorative floating bones ───────────────────────────────────────────
  const boneY = H * 0.51;
  _drawBone(W * 0.10, boneY + Math.sin(t * 0.055) * 7);
  _drawBone(W * 0.90, boneY + Math.sin(t * 0.055 + Math.PI) * 7);

  // ── Title text ──────────────────────────────────────────────────────────
  const titleY = Math.round(H * 0.20 + Math.sin(t * 0.038) * 3);
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = '38px "Press Start 2P"';
  ctx.fillStyle = '#00004a';
  ctx.fillText("BUDDY'S QUEST", W / 2 + 5, titleY + 5);
  ctx.fillStyle = '#000080';
  ctx.fillText("BUDDY'S QUEST", W / 2 + 3, titleY + 3);
  const shimmer  = (Math.sin(t * 0.042) + 1) / 2;
  const shimmerR = 255;
  const shimmerG = Math.round(195 + shimmer * 60);
  const shimmerB = Math.round(shimmer * 60);
  ctx.fillStyle  = `rgb(${shimmerR},${shimmerG},${shimmerB})`;
  ctx.fillText("BUDDY'S QUEST", W / 2, titleY);
  ctx.strokeStyle = 'rgba(0,0,60,0.5)';
  ctx.lineWidth   = 1;
  ctx.strokeText("BUDDY'S QUEST", W / 2, titleY);

  ctx.font      = '11px "Press Start 2P"';
  ctx.fillStyle = `rgba(140,200,255,${0.6 + 0.2 * Math.sin(t * 0.05)})`;
  ctx.fillText('A GOOD BOY ADVENTURE', W / 2, titleY + 42);

  // ── Prompt text ─────────────────────────────────────────────────────────
  const isMobile     = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const blinkVisible = t % 64 < 44;
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

  // ── Border frame ──────────────────────────────────────────────────────
  const borderAlpha = 0.65 + 0.35 * Math.sin(t * 0.05);
  ctx.strokeStyle = `rgba(255,210,63,${borderAlpha})`;
  ctx.lineWidth   = 4;
  ctx.strokeRect(4, 4, W - 8, H - 8);
  ctx.fillStyle = `rgba(255,210,63,${borderAlpha})`;
  const cs = 10;
  ctx.fillRect(4,       4,       cs, cs);
  ctx.fillRect(W-4-cs,  4,       cs, cs);
  ctx.fillRect(4,       H-4-cs,  cs, cs);
  ctx.fillRect(W-4-cs,  H-4-cs,  cs, cs);
  ctx.fillRect(W / 2 - cs / 2, 4,      cs, 4);
  ctx.fillRect(W / 2 - cs / 2, H - 8,  cs, 4);
  ctx.fillRect(4,      H / 2 - cs / 2, 4, cs);
  ctx.fillRect(W - 8,  H / 2 - cs / 2, 4, cs);

  // ── CRT scanlines ─────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  for (let sy = 0; sy < H; sy += 3) {
    ctx.fillRect(0, sy, W, 1);
  }
}

function _renderGame() {
  const cam = state.camera.x;
  const W   = canvas.width;
  const H   = canvas.height;
  const def = state.world.levelDef;

  // ── Themed sky ─────────────────────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, def ? def.skyTop : '#1a5276');
  sky.addColorStop(1, def ? def.skyBot : '#2471a3');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Background elements based on theme
  _drawThemedBackground(cam, def);

  // Background clouds (parallax 0.3) — skip for some themes
  if (!def || !['volcano', 'forest'].includes(def.theme)) {
    _drawClouds(cam * 0.3);
  }

  if (!state.world) return;

  ctx.save();
  ctx.translate(-cam, 0);

  // ── Hazards (behind platforms) ─────────────────────────────────────────
  _renderHazards();

  // ── Platforms ──────────────────────────────────────────────────────────
  for (const plat of state.world.platforms) {
    if (plat.crumbled || plat.dissolved) continue;
    if (plat.x + plat.w < cam - 20 || plat.x > cam + W + 20) continue;
    _drawThemedPlatform(plat, def);
  }

  // ── Moving platforms ───────────────────────────────────────────────────
  for (const mp of state.world.movingPlatforms) {
    if (mp.x + mp.w < cam - 20 || mp.x > cam + W + 20) continue;
    _drawMovingPlatform(mp);
  }

  // ── Bones ──────────────────────────────────────────────────────────────
  for (const bone of state.world.bones) {
    if (!bone.collected) _drawBone(bone.x, bone.y);
  }

  // ── Treats ─────────────────────────────────────────────────────────────
  for (const treat of state.world.treats) {
    if (!treat.collected) _drawTreat(treat.x, treat.y);
  }

  // ── Enemies ────────────────────────────────────────────────────────────
  _renderEnemies();

  // ── Flag ───────────────────────────────────────────────────────────────
  const f = state.world.flag;
  if (!f.collected) _drawFlag(f.x, f.y);

  // ── Buddy ──────────────────────────────────────────────────────────────
  const p = state.player;
  const hasTreat = p.treatTimer > 0;
  if (hasTreat) {
    const pulse = 0.55 + 0.45 * Math.sin(state.tick * 0.18);
    ctx.save();
    ctx.globalAlpha = pulse * 0.55;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.ellipse(p.x + 28, p.y + 22, 38, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  _drawBuddy(p.x, p.y, p.facingRight, p.animFrame, hasTreat ? 1.4 : 1.0, hasTreat);

  ctx.restore();

  // ── HUD overlay ────────────────────────────────────────────────────────
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'top';
  ctx.font         = '11px "Press Start 2P"';
  ctx.fillStyle    = '#ffd23f';
  ctx.fillText('BONES: ' + state.score, W - 12, 10);

  ctx.textAlign    = 'left';
  ctx.fillStyle    = 'rgba(255,255,255,0.7)';
  ctx.font         = '9px "Press Start 2P"';
  const levelName = def ? def.name : 'LVL ' + state.level;
  ctx.fillText('LVL ' + state.level + ' - ' + levelName, 12, 10);

  // ── Treat power-up bar ─────────────────────────────────────────────────
  const p2 = state.player;
  if (p2.treatTimer > 0) {
    const barW    = 160;
    const barH    = 12;
    const barX    = W / 2 - barW / 2;
    const barY    = 10;
    const fill    = p2.treatTimer / 420;
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

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (state.levelWon) {
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '28px "Press Start 2P"';
    ctx.fillText('LEVEL ' + state.level + ' COMPLETE!', cx, cy - 60);

    const def = getLevelDef(state.level);
    if (def) {
      ctx.fillStyle = '#ffffff';
      ctx.font      = '12px "Press Start 2P"';
      ctx.fillText(def.name, cx, cy - 25);
    }

    _drawBuddy(cx - 30, cy + 10, true, 0, 2.0, true);

    ctx.font      = '12px "Press Start 2P"';
    ctx.fillStyle = '#ffd23f';
    ctx.fillText('BONES: ' + state.score, cx, cy + 90);

    ctx.font      = '10px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    if (state.level < 7) {
      ctx.fillText('PRESS ENTER FOR WORLD MAP', cx, cy + 120);
    } else {
      ctx.fillText('ALL LEVELS COMPLETE! PRESS ENTER', cx, cy + 120);
    }
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font      = '36px "Press Start 2P"';
    ctx.fillText('GAME OVER', cx, cy - 50);

    const def = getLevelDef(state.level);
    ctx.font      = '11px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('LEVEL ' + state.level + (def ? ' - ' + def.name : ''), cx, cy - 10);

    ctx.font      = '12px "Press Start 2P"';
    ctx.fillStyle = '#ffd23f';
    ctx.fillText('BONES COLLECTED: ' + state.score, cx, cy + 20);

    if (state.unlockedCommands.length > 1) {
      ctx.font      = '8px "Press Start 2P"';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('TRICKS: ' + state.unlockedCommands.length + '/' + (UNLOCK_ORDER.length + 1), cx, cy + 50);
    }

    ctx.font      = '11px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('PRESS ENTER FOR WORLD MAP', cx, cy + 80);
  }
}

// ── Themed backgrounds ──────────────────────────────────────────────────────

function _drawThemedBackground(cam, def) {
  if (!def) return;
  const W = canvas.width;
  const H = canvas.height;
  const t = state.tick;

  switch (def.theme) {
    case 'park':
      _drawBgTrees(cam, '#1a7a2a', '#0d5d1d', 0.2);
      break;
    case 'backyard':
      _drawBgFences(cam, 0.15);
      _drawBgTrees(cam, '#2a8a3a', '#1a6a2a', 0.25);
      break;
    case 'city':
      _drawBgBuildings(cam, 0.2);
      break;
    case 'forest':
      // Fog layer
      ctx.fillStyle = 'rgba(20,40,30,0.3)';
      ctx.fillRect(0, 0, W, H);
      _drawBgDeadTrees(cam, 0.15);
      // Fireflies
      for (let i = 0; i < 8; i++) {
        const fx = ((i * 137 + t * 0.3) % W);
        const fy = 200 + Math.sin(t * 0.03 + i * 2.1) * 80;
        const fa = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.06 + i * 1.3));
        ctx.globalAlpha = fa;
        ctx.fillStyle = '#aaff44';
        ctx.fillRect(fx, fy, 3, 3);
      }
      ctx.globalAlpha = 1;
      break;
    case 'snow':
      _drawBgMountains(cam, 0.1);
      // Snowfall
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 97 + t * (0.3 + i * 0.02)) % W);
        const sy = ((i * 53 + t * (0.8 + i * 0.01)) % H);
        ctx.fillRect(sx, sy, 2, 2);
      }
      break;
    case 'volcano':
      _drawBgVolcanoes(cam, 0.1);
      // Ember particles
      ctx.fillStyle = '#ff6622';
      for (let i = 0; i < 15; i++) {
        const ex = ((i * 127 + t * 0.5) % W);
        const ey = H - ((i * 71 + t * (0.5 + i * 0.03)) % (H * 0.7));
        const ea = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.04 + i));
        ctx.globalAlpha = ea;
        ctx.fillRect(ex, ey, 2 + (i % 2), 2);
      }
      ctx.globalAlpha = 1;
      break;
    case 'sky':
      // Extra stars
      for (let i = 0; i < 25; i++) {
        const sx = (i * 89) % W;
        const sy = (i * 41) % (H * 0.8);
        const sa = 0.2 + 0.6 * Math.abs(Math.sin(t * 0.02 + i * 0.7));
        ctx.globalAlpha = sa;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
      }
      ctx.globalAlpha = 1;
      // Aurora-like streaks
      for (let a = 0; a < 3; a++) {
        const ay = 60 + a * 50;
        const aAlpha = 0.05 + 0.03 * Math.sin(t * 0.01 + a);
        ctx.fillStyle = a === 0 ? `rgba(100,200,255,${aAlpha})`
          : a === 1 ? `rgba(150,100,255,${aAlpha})`
          : `rgba(200,100,200,${aAlpha})`;
        ctx.fillRect(0, ay + Math.sin(t * 0.015 + a) * 10, W, 20);
      }
      break;
  }
}

function _drawBgTrees(cam, trunkCol, leavesCol, parallax) {
  const px = cam * parallax;
  const W = canvas.width;
  for (let i = 0; i < 8; i++) {
    const tx = ((i * 160 - px) % (W + 80) + W + 80) % (W + 80) - 40;
    const ty = GROUND_Y;
    // Trunk
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(tx + 12, ty - 60, 12, 60);
    // Canopy
    ctx.fillStyle = leavesCol;
    ctx.beginPath();
    ctx.arc(tx + 18, ty - 65, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = trunkCol;
    ctx.beginPath();
    ctx.arc(tx + 18, ty - 72, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function _drawBgFences(cam, parallax) {
  const px = cam * parallax;
  const W = canvas.width;
  ctx.fillStyle = '#8b7355';
  for (let i = 0; i < 20; i++) {
    const fx = ((i * 60 - px) % (W + 40) + W + 40) % (W + 40) - 20;
    // Post
    ctx.fillRect(fx, GROUND_Y - 40, 6, 40);
    // Rail
    if (i < 19) {
      ctx.fillRect(fx, GROUND_Y - 35, 60, 4);
      ctx.fillRect(fx, GROUND_Y - 20, 60, 4);
    }
  }
}

function _drawBgBuildings(cam, parallax) {
  const px = cam * parallax;
  const W = canvas.width;
  const buildings = [
    { w: 80, h: 200, c: '#2a3a5a' },
    { w: 60, h: 150, c: '#3a4a6a' },
    { w: 100, h: 260, c: '#1a2a4a' },
    { w: 70, h: 180, c: '#2a4a5a' },
    { w: 90, h: 220, c: '#1a3a5a' },
    { w: 65, h: 140, c: '#3a3a5a' },
  ];
  let bx = 0;
  for (const b of buildings) {
    const rx = ((bx - px) % (W + 200) + W + 200) % (W + 200) - 100;
    ctx.fillStyle = b.c;
    ctx.fillRect(rx, GROUND_Y - b.h, b.w, b.h);
    // Windows
    ctx.fillStyle = 'rgba(255,230,100,0.3)';
    for (let wy = GROUND_Y - b.h + 15; wy < GROUND_Y - 10; wy += 25) {
      for (let wx = rx + 10; wx < rx + b.w - 10; wx += 18) {
        if (Math.sin(wx * 0.3 + wy * 0.7) > 0) {
          ctx.fillRect(wx, wy, 8, 10);
        }
      }
    }
    bx += b.w + 30;
  }
}

function _drawBgDeadTrees(cam, parallax) {
  const px = cam * parallax;
  const W = canvas.width;
  ctx.fillStyle = '#1a1a0a';
  for (let i = 0; i < 6; i++) {
    const tx = ((i * 180 - px) % (W + 80) + W + 80) % (W + 80) - 40;
    // Bare trunk
    ctx.fillRect(tx + 8, GROUND_Y - 90, 8, 90);
    // Branches
    ctx.fillRect(tx, GROUND_Y - 80, 24, 4);
    ctx.fillRect(tx + 4, GROUND_Y - 60, 16, 3);
    ctx.fillRect(tx - 4, GROUND_Y - 45, 20, 3);
  }
}

function _drawBgMountains(cam, parallax) {
  const px = cam * parallax;
  const W = canvas.width;
  const mts = [
    { cx: 120, h: 180, w: 200 },
    { cx: 400, h: 240, w: 280 },
    { cx: 700, h: 160, w: 220 },
    { cx: 900, h: 200, w: 260 },
  ];
  for (const m of mts) {
    const mx = ((m.cx - px) % (W + m.w) + W + m.w) % (W + m.w) - m.w / 2;
    ctx.fillStyle = '#7a8a9a';
    ctx.beginPath();
    ctx.moveTo(mx - m.w / 2, GROUND_Y);
    ctx.lineTo(mx, GROUND_Y - m.h);
    ctx.lineTo(mx + m.w / 2, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    // Snow cap
    ctx.fillStyle = '#e8eef4';
    ctx.beginPath();
    ctx.moveTo(mx - m.w * 0.12, GROUND_Y - m.h + 30);
    ctx.lineTo(mx, GROUND_Y - m.h);
    ctx.lineTo(mx + m.w * 0.12, GROUND_Y - m.h + 30);
    ctx.closePath();
    ctx.fill();
  }
}

function _drawBgVolcanoes(cam, parallax) {
  const px = cam * parallax;
  const W = canvas.width;
  // Distant volcanoes
  const vs = [
    { cx: 200, h: 200, w: 240 },
    { cx: 600, h: 260, w: 300 },
    { cx: 850, h: 180, w: 220 },
  ];
  for (const v of vs) {
    const vx = ((v.cx - px) % (W + v.w) + W + v.w) % (W + v.w) - v.w / 2;
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.moveTo(vx - v.w / 2, GROUND_Y);
    ctx.lineTo(vx - 20, GROUND_Y - v.h);
    ctx.lineTo(vx + 20, GROUND_Y - v.h);
    ctx.lineTo(vx + v.w / 2, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    // Glow at crater
    ctx.fillStyle = 'rgba(255,80,0,0.3)';
    ctx.beginPath();
    ctx.arc(vx, GROUND_Y - v.h - 5, 25, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Themed platform drawing ────────────────────────────────────────────────

function _drawThemedPlatform(plat, def) {
  if (plat.isGround) {
    ctx.fillStyle = def ? def.groundColor : '#2ecc40';
    ctx.fillRect(plat.x, plat.y, plat.w, 8);
    ctx.fillStyle = def ? def.dirtColor : '#7d4e2b';
    ctx.fillRect(plat.x, plat.y + 8, plat.w, plat.h - 8);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(plat.x, plat.y + 20, plat.w, 4);
  } else {
    // Crumbling/dissolving visual feedback
    let alpha = 1;
    if (plat.crumble && plat.crumbleTimer > 0) {
      alpha = 0.3 + 0.7 * (plat.crumbleTimer / CRUMBLE_DELAY);
      // Shake effect
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * 3 * (1 - plat.crumbleTimer / CRUMBLE_DELAY),
        (Math.random() - 0.5) * 2 * (1 - plat.crumbleTimer / CRUMBLE_DELAY)
      );
    }
    if (plat.dissolve && plat.dissolveTimer > 0) {
      alpha = plat.dissolveTimer / DISSOLVE_DELAY;
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = def ? def.platformColor : '#7f8c8d';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.fillStyle = def ? def.platformHi : '#95a5a6';
    ctx.fillRect(plat.x, plat.y, plat.w, 4);
    ctx.fillStyle = def ? def.platformLo : '#566573';
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

    // Warning indicator for crumble/dissolve platforms
    if ((plat.crumble || plat.dissolve) && !(plat.crumbleTimer > 0 || plat.dissolveTimer > 0)) {
      ctx.fillStyle = 'rgba(255,100,0,0.3)';
      ctx.fillRect(plat.x + 2, plat.y + 2, plat.w - 4, plat.h - 4);
    }

    ctx.globalAlpha = 1;
    if (plat.crumble && plat.crumbleTimer > 0) {
      ctx.restore();
    }
  }
}

function _drawMovingPlatform(mp) {
  ctx.fillStyle = '#6a8a9a';
  ctx.fillRect(mp.x, mp.y, mp.w, mp.h);
  ctx.fillStyle = '#8aaaba';
  ctx.fillRect(mp.x, mp.y, mp.w, 4);
  ctx.fillStyle = '#4a6a7a';
  ctx.fillRect(mp.x, mp.y + mp.h - 4, mp.w, 4);
  // Arrow indicator
  ctx.fillStyle = 'rgba(255,210,63,0.4)';
  if (mp.axis === 'x') {
    ctx.fillRect(mp.x + mp.w / 2 - 8, mp.y + 10, 16, 4);
    ctx.fillRect(mp.x + mp.w / 2 + 4, mp.y + 8, 4, 8);
    ctx.fillRect(mp.x + mp.w / 2 - 8, mp.y + 8, 4, 8);
  } else {
    ctx.fillRect(mp.x + mp.w / 2 - 2, mp.y + 8, 4, 16);
  }
}

// ── Hazard rendering ────────────────────────────────────────────────────────

function _renderHazards() {
  if (!state.world.hazards) return;
  const t = state.tick;

  for (const h of state.world.hazards) {
    if (h.type === 'mud') {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      // Bubble effect
      ctx.fillStyle = '#6a4a2a';
      for (let i = 0; i < 3; i++) {
        const bx = h.x + (i + 0.5) * (h.w / 3);
        const by = h.y - 2 + Math.sin(t * 0.05 + i * 2) * 2;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (h.type === 'lava') {
      // Animated lava
      ctx.fillStyle = '#cc3300';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.fillStyle = '#ff6600';
      for (let lx = h.x; lx < h.x + h.w; lx += 8) {
        const ly = h.y + Math.sin((lx + t * 2) * 0.1) * 4;
        ctx.fillRect(lx, ly, 6, 4);
      }
      ctx.fillStyle = '#ffaa00';
      for (let lx = h.x + 4; lx < h.x + h.w; lx += 12) {
        const ly = h.y + 2 + Math.sin((lx + t * 1.5) * 0.08) * 3;
        ctx.fillRect(lx, ly, 4, 3);
      }
    } else if (h.type === 'hydrant') {
      // Fire hydrant
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(h.x + 4, h.y, 12, h.h);
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(h.x + 2, h.y + 4, 16, 6);
      ctx.fillStyle = '#990000';
      ctx.fillRect(h.x, h.y + 8, 20, 4);
      // Cap
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(h.x + 6, h.y - 4, 8, 6);
    } else if (h.type === 'wind') {
      // Wind streaks
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#aaddff';
      for (let i = 0; i < 6; i++) {
        const wy = h.y + (i * h.h / 6);
        const wx = h.x + ((t * 3 * h.dir + i * 40) % h.w);
        ctx.fillRect(wx, wy, 30 + (i % 3) * 10, 2);
      }
      ctx.restore();
    }
  }
}

// ── Enemy rendering ─────────────────────────────────────────────────────────

function _renderEnemies() {
  if (!state.world.enemies) return;
  const t = state.tick;

  for (const e of state.world.enemies) {
    if (e.type === 'bat') {
      _drawBat(e.x, e.y, e.dir, t);
    } else if (e.type === 'snowball') {
      _drawSnowball(e.x, e.y, e.w, t);
    } else if (e.type === 'fire') {
      if (e._active) {
        _drawFireGeyser(e.x, e.y, e.w, e.h, t);
      }
    }
  }
}

function _drawBat(x, y, dir, t) {
  // Body
  ctx.fillStyle = '#2a1a3a';
  ctx.fillRect(x + 6, y + 4, 12, 10);
  // Wings (flapping)
  const wingUp = Math.sin(t * 0.3) > 0;
  ctx.fillStyle = '#3a2a4a';
  if (wingUp) {
    ctx.fillRect(x, y, 8, 6);
    ctx.fillRect(x + 16, y, 8, 6);
  } else {
    ctx.fillRect(x, y + 8, 8, 6);
    ctx.fillRect(x + 16, y + 8, 8, 6);
  }
  // Eyes
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x + 8, y + 6, 2, 2);
  ctx.fillRect(x + 14, y + 6, 2, 2);
}

function _drawSnowball(x, y, w, t) {
  const r = w / 2;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(x + r, y + w - 2, r, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ball
  ctx.fillStyle = '#e0e8f0';
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + r - 3, y + r - 3, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // Rotation marks
  const rot = t * 0.15;
  ctx.fillStyle = 'rgba(160,180,200,0.5)';
  ctx.fillRect(x + r + Math.cos(rot) * 4 - 1, y + r + Math.sin(rot) * 4 - 1, 3, 3);
}

function _drawFireGeyser(x, y, w, h, t) {
  // Fire column
  for (let fy = 0; fy < h; fy += 4) {
    const frac = fy / h;
    const flicker = Math.sin(t * 0.4 + fy * 0.3) * 3;
    const fw = w * (1 - frac * 0.5);
    ctx.fillStyle = frac < 0.3 ? '#ffaa00' : frac < 0.6 ? '#ff6600' : '#ff2200';
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 0.2 + fy * 0.2);
    ctx.fillRect(x + (w - fw) / 2 + flicker, y + h - fy, fw, 5);
  }
  ctx.globalAlpha = 1;
}

// ── Voice feedback overlay ──────────────────────────────────────────────────

function _renderVoiceFeedback() {
  const now = Date.now();
  if (!state.voice.reaction || now > state.voice.reactionUntil) return;

  const remaining = state.voice.reactionUntil - now;
  const alpha     = remaining < 500 ? remaining / 500 : 1;

  const cx   = canvas.width / 2;
  const boxW = 400;
  const boxH = 66;
  const boxY = 14;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = 'rgba(0,15,50,0.82)';
  ctx.fillRect(cx - boxW / 2, boxY, boxW, boxH);
  ctx.strokeStyle = 'rgba(255,210,63,0.7)';
  ctx.lineWidth   = 2;
  ctx.strokeRect(cx - boxW / 2, boxY, boxW, boxH);

  ctx.fillStyle    = 'rgba(255,255,255,0.65)';
  ctx.font         = '9px "Press Start 2P"';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  const heard = state.voice.transcript
    ? '"' + state.voice.transcript.slice(0, 34) + '"'
    : '';
  ctx.fillText(heard, cx, boxY + 10);

  ctx.fillStyle = '#ffd23f';
  ctx.font      = '13px "Press Start 2P"';
  ctx.fillText('BUDDY: ' + state.voice.reaction, cx, boxY + 34);

  ctx.restore();
}

// ── HUD ─────────────────────────────────────────────────────────────────────

function _renderHud() {
  const hud = document.getElementById('hud');
  if (state.mode === 'play') {
    const cmds = state.unlockedCommands.map(c =>
      (COMMAND_DISPLAY_NAMES && COMMAND_DISPLAY_NAMES[c]) || c
    );
    hud.textContent = 'Tricks: ' + cmds.join(', ');
  } else {
    hud.textContent = '';
  }
}

// ── Drawing helpers ─────────────────────────────────────────────────────────

function _drawPlatform(plat) {
  if (plat.isGround) {
    ctx.fillStyle = '#2ecc40';
    ctx.fillRect(plat.x, plat.y, plat.w, 8);
    ctx.fillStyle = '#7d4e2b';
    ctx.fillRect(plat.x, plat.y + 8, plat.w, plat.h - 8);
    ctx.fillStyle = '#5a3620';
    ctx.fillRect(plat.x, plat.y + 20, plat.w, 4);
  } else {
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(plat.x, plat.y, plat.w, 4);
    ctx.fillStyle = '#566573';
    ctx.fillRect(plat.x, plat.y + plat.h - 4, plat.w, 4);
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
  const bob  = Math.sin(state.tick * 0.1) * 4;
  const spin = state.tick * 0.05;
  const tx   = Math.round(x);
  const ty   = Math.round(y + bob);

  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(spin);

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

  ctx.fillStyle = '#c8860a';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function _drawBone(x, y) {
  const bob = Math.sin(state.tick * 0.08) * 3;
  const bx  = Math.round(x - 8);
  const by  = Math.round(y + bob - 8);

  ctx.fillStyle = '#f9e4b7';
  ctx.fillRect(bx + 3, by + 6, 10, 4);
  ctx.fillRect(bx, by + 4, 5, 4);
  ctx.fillRect(bx + 1, by + 2, 3, 4);
  ctx.fillRect(bx, by + 8, 5, 4);
  ctx.fillRect(bx + 1, by + 10, 3, 4);
  ctx.fillRect(bx + 11, by + 4, 5, 4);
  ctx.fillRect(bx + 12, by + 2, 3, 4);
  ctx.fillRect(bx + 11, by + 8, 5, 4);
  ctx.fillRect(bx + 12, by + 10, 3, 4);
}

function _drawFlag(x, y) {
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(x, y, 4, 96);

  const wave = Math.sin(state.tick * 0.1) * 3;
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + 36, y + 12 + wave);
  ctx.lineTo(x + 4, y + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font      = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('!', x + 10, y + 6);
}

function _drawBuddy(x, y, facingRight, animFrame, scale, hasTreat) {
  ctx.save();

  const fur     = hasTreat ? '#ddb97e' : '#c8a96e';
  const darkFur = hasTreat ? '#b08040' : '#a0784a';
  const belly   = hasTreat ? '#f0d8a0' : '#e8c88e';

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
    ctx.fillStyle = fur;
    r(8, 14, 24, 18);
    r(14, 2, 18, 16);
    ctx.fillStyle = darkFur;
    r(12, 0, 7, 10);
    r(22, 0, 7, 10);
    ctx.fillStyle = '#1a1a2e';
    r(17, 6, 3, 3);
    r(24, 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    r(18, 6, 1, 1);
    r(25, 6, 1, 1);
    ctx.fillStyle = '#3d1a00';
    r(20, 12, 5, 3);
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
    ctx.fillStyle = fur;
    r(6, 12, 28, 16);
    ctx.fillStyle = belly;
    r(10, 16, 18, 8);
    ctx.fillStyle = fur;
    r(14, 0, 18, 16);
    ctx.fillStyle = darkFur;
    r(12, -2, 7, 10);
    r(22, -2, 7, 10);

    if (hasTreat) {
      ctx.fillStyle = '#1a1a2e';
      r(16, 3, 5, 5);
      r(23, 3, 5, 5);
      ctx.fillStyle = '#ffffff';
      r(17, 3, 2, 2);
      r(24, 3, 2, 2);
      ctx.fillStyle = '#ffd23f';
      r(19, 4, 1, 1);
      r(26, 4, 1, 1);
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

    ctx.fillStyle = '#3d1a00';
    r(20, 11, 5, 3);

    const wagSpeed = hasTreat ? Math.sin(state.tick * 0.4) * 5 : (animFrame === 1 ? -3 : 0);
    ctx.fillStyle = darkFur;
    r(32, 10 + wagSpeed, 7, 7);
    r(36, 6 + wagSpeed, 5, 6);

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

    if (hasTreat) {
      const heartBob = Math.sin(state.tick * 0.12) * 3;
      ctx.fillStyle  = '#ff4488';
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
    ctx.fillRect(cx + c.w * 0.2, c.y + c.h * 0.4, c.w * 0.6, c.h * 0.6);
    ctx.fillRect(cx + c.w * 0.1, c.y + c.h * 0.25, c.w * 0.4, c.h * 0.5);
    ctx.fillRect(cx + c.w * 0.45, c.y, c.w * 0.4, c.h * 0.6);
    ctx.fillRect(cx, c.y + c.h * 0.4, c.w, c.h * 0.6);
  }
}
