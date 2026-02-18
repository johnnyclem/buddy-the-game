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
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0a2660');
  grad.addColorStop(1, '#163d7a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const starSeeds = [13, 37, 71, 97, 123, 211, 333, 451, 512, 777];
  for (const s of starSeeds) {
    const sx = (s * 97) % canvas.width;
    const sy = (s * 53) % (canvas.height * 0.6);
    ctx.fillRect(sx, sy, 2, 2);
  }

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Title shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.font      = '36px "Press Start 2P"';
  ctx.fillText("BUDDY'S QUEST", canvas.width / 2 + 3, canvas.height / 2 - 53);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.fillText("BUDDY'S QUEST", canvas.width / 2, canvas.height / 2 - 56);

  // Buddy on the title screen (centred, larger)
  _drawBuddy(canvas.width / 2 - 24, canvas.height / 2 - 10, true, 0, 1.6, false);

  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  ctx.font      = '11px "Press Start 2P"';
  ctx.fillStyle = '#ffd23f';

  if (isMobile) {
    ctx.fillText('TAP START  OR  SAY "JUMP BUDDY"', canvas.width / 2, canvas.height / 2 + 72);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font      = '9px "Press Start 2P"';
    ctx.fillText('TILT DEVICE TO MOVE', canvas.width / 2, canvas.height / 2 + 104);
  } else {
    ctx.fillText('PRESS ENTER OR CLICK START', canvas.width / 2, canvas.height / 2 + 72);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font      = '9px "Press Start 2P"';
    ctx.fillText('ARROWS / WASD + SPACE TO PLAY', canvas.width / 2, canvas.height / 2 + 104);
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
