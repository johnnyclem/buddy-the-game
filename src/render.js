// Top-down renderer — tiles, characters, items, dialogue, HUD

// ── Colour palette ─────────────────────────────────────────────────────────────
const PAL = {
  grassDark:    '#3a6b41',
  grassLight:   '#4a8c52',
  grassAlt:     '#427848',
  wallTop:      '#9a7c5a',
  wallFace:     '#7a5c3a',
  wallShadow:   '#5a3c1a',
  treeTrunk:    '#7a5c3a',
  treeTop:      '#2a5a2a',
  treeHighlight:'#3a7a3a',
  fenceWood:    '#a08050',
  fenceDark:    '#806030',
  pathLight:    '#c8b88a',
  pathDark:     '#a09870',
  waterDeep:    '#1a45aa',
  waterShallow: '#2a65cc',
  waterShine:   '#5a95ee',
  tallGrass:    '#5aaa5a',
  tallGrassDk:  '#3a8a3a',
  doghouseWall: '#a07040',
  doghouseRoof: '#8a3020',
  houseWall:    '#d4c09a',
  houseLine:    '#b8a07a',
};

// ── Colour helper ──────────────────────────────────────────────────────────────
function _hexShade(hex, amt) {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ── Main render entry ──────────────────────────────────────────────────────────
function render() {
  if (state.mode === 'menu') { _renderMenu(); return; }
  if (state.mode === 'over') { _renderOver(); return; }

  ctx.fillStyle = state.room.def ? state.room.def.bgColor : '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!state.room.def) return;

  _renderTiles();
  _renderItems();
  _renderNPCs();
  _renderPlayer();
  _renderHUD();

  if (state.mode === 'dialogue') _renderDialogue();

  _renderVoiceFeedback();
}

// ── Tile rendering ─────────────────────────────────────────────────────────────
function _renderTiles() {
  const tiles = state.room.def.tiles;
  for (let r = 0; r < ROOM_ROWS; r++) {
    for (let c = 0; c < ROOM_COLS; c++) {
      _drawTile(c * TS, r * TS, tiles[r][c], c, r);
    }
  }
}

function _drawTile(x, y, type, c, r) {
  // Base grass
  const gv = (c * 7 + r * 13) % 3;
  ctx.fillStyle = gv === 0 ? PAL.grassDark : gv === 1 ? PAL.grassLight : PAL.grassAlt;
  ctx.fillRect(x, y, TS, TS);

  switch (type) {
    case T.GRASS: {
      if ((c * 3 + r * 5) % 7 === 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.07)';
        ctx.fillRect(x + 4, y + 4, 2, 2);
      }
      break;
    }
    case T.WALL: {
      ctx.fillStyle = PAL.wallFace;
      ctx.fillRect(x, y, TS, TS);
      ctx.fillStyle = PAL.wallTop;
      ctx.fillRect(x, y, TS, 6);
      ctx.fillStyle = PAL.wallShadow;
      ctx.fillRect(x, y + TS - 4, TS, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x, y + 10, TS, 1);
      ctx.fillRect(x, y + 21, TS, 1);
      ctx.fillRect(x + 8,  y,      1, 10);
      ctx.fillRect(x + 24, y + 10, 1, 11);
      ctx.fillRect(x + 8,  y + 21, 1, 11);
      ctx.fillRect(x + 24, y,      1, 10);
      break;
    }
    case T.TREE: {
      ctx.fillStyle = PAL.treeTrunk;
      ctx.fillRect(x + 13, y + 20, 6, 12);
      ctx.fillStyle = PAL.treeTop;
      ctx.beginPath();
      ctx.arc(x + 16, y + 13, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.treeHighlight;
      ctx.beginPath();
      ctx.arc(x + 13, y + 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 28, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case T.FENCE: {
      ctx.fillStyle = PAL.fenceWood;
      ctx.fillRect(x, y + 10, TS, 5);
      ctx.fillRect(x, y + 20, TS, 5);
      ctx.fillStyle = PAL.fenceDark;
      ctx.fillRect(x, y + 14, TS, 1);
      ctx.fillRect(x, y + 24, TS, 1);
      if (c % 2 === 0) {
        ctx.fillStyle = PAL.fenceDark;
        ctx.fillRect(x, y + 6, 4, TS - 6);
      }
      break;
    }
    case T.PATH: {
      ctx.fillStyle = PAL.pathLight;
      ctx.fillRect(x, y, TS, TS);
      ctx.fillStyle = PAL.pathDark;
      if ((c + r) % 4 === 0) ctx.fillRect(x + 6,  y + 14, 12, 2);
      if ((c + r) % 4 === 2) ctx.fillRect(x + 16, y + 6,  8,  2);
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(x, y, 1, TS);
      ctx.fillRect(x, y, TS, 1);
      break;
    }
    case T.WATER: {
      const wave = Math.sin(state.tick * 0.04 + c * 0.8 + r * 0.5);
      ctx.fillStyle = PAL.waterDeep;
      ctx.fillRect(x, y, TS, TS);
      ctx.fillStyle = PAL.waterShallow;
      ctx.fillRect(x, y, TS, 16 + Math.round(wave * 3));
      if ((c + r + Math.floor(state.tick * 0.05)) % 3 === 0) {
        ctx.fillStyle = PAL.waterShine;
        ctx.fillRect(x + 8,  y + 8,  4, 2);
        ctx.fillRect(x + 20, y + 18, 4, 2);
      }
      break;
    }
    case T.FLOWERS: {
      const colors = ['#e83030', '#f5d020', '#e0e0e0', '#cc44cc'];
      const offsets = [[4, 8], [16, 4], [24, 16], [10, 20], [22, 24]];
      for (let i = 0; i < offsets.length; i++) {
        const [fx, fy] = offsets[i];
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(x + fx + 1, y + fy + 3, 2, 5);
        ctx.fillStyle = colors[(c * 3 + r + i) % colors.length];
        ctx.beginPath();
        ctx.arc(x + fx + 2, y + fy + 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case T.TALL_GRASS: {
      ctx.fillStyle = PAL.tallGrass;
      ctx.fillRect(x, y, TS, TS);
      const sway = Math.sin(state.tick * 0.03 + c * 1.2) * 2;
      ctx.fillStyle = PAL.tallGrassDk;
      for (const [tx, ty] of [[4, 20], [10, 16], [18, 22], [24, 14]]) {
        ctx.beginPath();
        ctx.moveTo(x + tx,             y + ty + 8);
        ctx.lineTo(x + tx + sway,      y + ty - 4);
        ctx.lineTo(x + tx + 3 + sway * 0.5, y + ty + 8);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case T.DOGHOUSE: {
      const dw = 40, dh = 36;
      const dx = x + (TS - dw) / 2;
      const dy = y + (TS - dh) / 2;
      ctx.fillStyle = PAL.doghouseWall;
      ctx.fillRect(dx, dy + 10, dw, dh - 10);
      ctx.fillStyle = PAL.doghouseRoof;
      ctx.beginPath();
      ctx.moveTo(dx - 4,      dy + 12);
      ctx.lineTo(dx + dw / 2, dy - 2);
      ctx.lineTo(dx + dw + 4, dy + 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2a1a0a';
      ctx.beginPath();
      ctx.ellipse(dx + dw / 2, dy + dh - 4, 8, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.save();
      ctx.fillStyle = '#ffe0a0';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BUDDY', dx + dw / 2, dy + 22);
      ctx.restore();
      break;
    }
    case T.HOUSE: {
      ctx.fillStyle = PAL.houseWall;
      ctx.fillRect(x, y, TS, TS);
      ctx.fillStyle = PAL.houseLine;
      const offset = (r % 2 === 0) ? 0 : 16;
      ctx.fillRect(x + offset,      y, 1, TS);
      ctx.fillRect(x + offset + 16, y, 1, TS);
      ctx.fillRect(x, y + 10, TS, 1);
      ctx.fillRect(x, y + 22, TS, 1);
      break;
    }
  }
}

// ── Item rendering ─────────────────────────────────────────────────────────────
function _renderItems() {
  for (const item of state.room.items) {
    if (item.collected) continue;
    _drawItem(item.col * TS + TS / 2, item.row * TS + TS / 2, item.type);
  }
}

function _drawItem(cx, cy, type) {
  const float = Math.sin(state.tick * 0.08 + cx * 0.1) * 2;
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy + float));

  if (type === 'bone') {
    ctx.fillStyle   = '#f5f0e0';
    ctx.strokeStyle = '#c8c0a8';
    ctx.lineWidth   = 0.8;
    ctx.fillRect(-5, -1.5, 10, 3);
    ctx.strokeRect(-5, -1.5, 10, 3);
    for (const [kx, ky] of [[-5, 0], [5, 0]]) {
      ctx.beginPath(); ctx.arc(kx, ky - 2.5, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(kx, ky + 2.5, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  } else if (type === 'ball') {
    ctx.fillStyle = '#cc2200';
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 8, -0.6, 0.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke();
  } else if (type === 'treat') {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      const r     = i % 2 === 0 ? 9 : 4;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c8a000';
    ctx.lineWidth   = 1;
    ctx.stroke();
  }
  ctx.restore();
}

// ── NPC rendering ──────────────────────────────────────────────────────────────
function _renderNPCs() {
  for (const npc of state.room.npcs) {
    const x = npc.col * TS + TS / 2;
    const y = npc.row * TS + TS / 2;
    _drawCharacter(x, y, npc.type, npc.color, 'down', 0, 1, false);

    // Interact prompt
    if (npc._showPrompt && !npc.dialogueSeen) {
      if (Math.floor(state.tick / 20) % 2 === 0) {
        ctx.save();
        ctx.fillStyle = '#ffd23f';
        ctx.font      = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[Z]', x, y - 22);
        ctx.restore();
      }
    }

    // Name tag
    ctx.save();
    ctx.font = '7px "Press Start 2P", monospace';
    const nw = ctx.measureText(npc.name).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x - nw / 2, y - 34, nw, 12);
    ctx.fillStyle   = '#ffffff';
    ctx.textAlign   = 'center';
    ctx.fillText(npc.name, x, y - 25);
    ctx.restore();
  }
}

// ── Player (Buddy) rendering ───────────────────────────────────────────────────
function _renderPlayer() {
  const p = state.player;
  _drawCharacter(
    Math.round(p.x), Math.round(p.y),
    'dog', '#c87a2a',
    p.dir, p.animFrame, 1,
    p.treatTimer > 0,
  );
}

// ── Generic character drawing ──────────────────────────────────────────────────
function _drawCharacter(cx, cy, type, color, dir, frame, scale, glowing) {
  const s = scale;
  ctx.save();
  ctx.translate(cx, cy);

  if (glowing) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10; }

  // Ground shadow
  ctx.globalAlpha = 0.25;
  ctx.fillStyle   = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 7 * s, 9 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (type === 'dog')      _drawDog(dir, color, frame, s);
  else if (type === 'cat') _drawCat(dir, color, s);
  else if (type === 'human')    _drawHuman(dir, color, s);
  else if (type === 'squirrel') _drawSquirrel(s);

  ctx.restore();
}

// ── Dog sprite ─────────────────────────────────────────────────────────────────
function _drawDog(dir, color, frame, s) {
  const dark  = _hexShade(color, -50);
  const light = _hexShade(color, +30);

  if (dir === 'down') {
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(-7 * s, -1 * s, 3.5 * s, 5 * s, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7 * s,  -1 * s, 3.5 * s, 5 * s,  0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, 9 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 7 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath(); ctx.ellipse(0, 9 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a1a0a';
    ctx.beginPath(); ctx.ellipse(0, 8 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-2.5 * s, 6 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.5 * s,  6 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(-2 * s,  5.5 * s, 0.6 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3 * s,   5.5 * s, 0.6 * s, 0, Math.PI * 2); ctx.fill();
    const tw = state.player && state.player.moving ? Math.sin(state.tick * 0.25) * 4 : 0;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(8 * s + tw, -5 * s, 3 * s, 2 * s, 0.5, 0, Math.PI * 2); ctx.fill();
    if (frame % 2 === 1) {
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(-5 * s, 3 * s, 2 * s, 1.5 * s,  0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5 * s,  3 * s, 2 * s, 1.5 * s, -0.3, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }

  if (dir === 'up') {
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(-7 * s, 1 * s, 3.5 * s, 5 * s, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7 * s,  1 * s, 3.5 * s, 5 * s,  0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, 9 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -7 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
    const tw = state.player && state.player.moving ? Math.sin(state.tick * 0.25) * 4 : 0;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(tw, 8 * s, 3 * s, 2 * s, tw * 0.08, 0, Math.PI * 2); ctx.fill();
    if (frame % 2 === 1) {
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(-4 * s, 3 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(4 * s,  3 * s, 2 * s, 1.5 * s, 0, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }

  // left or right — mirror with scale
  ctx.scale(dir === 'left' ? 1 : -1, 1);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 9 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(-2 * s, -5 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(-8 * s, 0, 5.5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath(); ctx.ellipse(-12 * s, 1 * s, 3 * s, 2.2 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a1a0a';
  ctx.beginPath(); ctx.arc(-13.5 * s, 1 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(-9 * s, -1 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(-8.5 * s, -1.5 * s, 0.6 * s, 0, Math.PI * 2); ctx.fill();
  const tw2 = state.player && state.player.moving ? Math.sin(state.tick * 0.25) * 3 : 0;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(9 * s, -4 * s + tw2, 3 * s, 2 * s, -0.3, 0, Math.PI * 2); ctx.fill();
  if (frame % 2 === 1) {
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(-2 * s, 5 * s, 2 * s, 1.2 * s,  0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3 * s,  5 * s, 2 * s, 1.2 * s, -0.3, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Cat sprite ─────────────────────────────────────────────────────────────────
function _drawCat(dir, color, s) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 8 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill();
  // Ears
  for (const sx of [-1, 1]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx * 2 * s, -6 * s); ctx.lineTo(sx * 5 * s, -13 * s); ctx.lineTo(sx * 7 * s, -6 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(sx * 3 * s, -7 * s); ctx.lineTo(sx * 5 * s, -11 * s); ctx.lineTo(sx * 6 * s, -7 * s);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -5 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#88dd00';
  ctx.beginPath(); ctx.ellipse(-2.5 * s, -6 * s, 2.5 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.5 * s,  -6 * s, 2.5 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(-2.5 * s, -6 * s, 1 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.5 * s,  -6 * s, 1 * s, 2 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(210,210,210,0.85)';
  ctx.lineWidth = 0.8;
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, -5 * s); ctx.lineTo(sd * 10 * s, -4 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -5 * s); ctx.lineTo(sd * 10 * s, -6 * s); ctx.stroke();
  }
  ctx.strokeStyle = '#444';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(-3 * s, -2.5 * s); ctx.lineTo(0, -1.5 * s); ctx.lineTo(3 * s, -2.5 * s); ctx.stroke();
}

// ── Human sprite ───────────────────────────────────────────────────────────────
function _drawHuman(dir, color, s) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 2 * s, 7 * s, 5.5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8b87c';
  ctx.beginPath(); ctx.arc(0, -6 * s, 6 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-2 * s, -6.5 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(2 * s,  -6.5 * s, 1 * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.arc(0, -5 * s, 2.5 * s, 0.2, Math.PI - 0.2); ctx.stroke();
}

// ── Squirrel sprite ────────────────────────────────────────────────────────────
function _drawSquirrel(s) {
  ctx.fillStyle = '#b07840';
  ctx.beginPath(); ctx.arc(5 * s, -3 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d09050';
  ctx.beginPath(); ctx.arc(5 * s, -3 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8b5e3c';
  ctx.beginPath(); ctx.ellipse(-2 * s, 2 * s, 5 * s, 5.5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-2 * s, -4 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-5 * s, -8 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1 * s,  -8 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(-3.5 * s, -4 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0,         -4 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(-3 * s,  -4.5 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0.5 * s, -4.5 * s, 0.8 * s, 0, Math.PI * 2); ctx.fill();
}

// ── HUD bar ────────────────────────────────────────────────────────────────────
function _renderHUD() {
  const hudY = ROOM_ROWS * TS;  // y = 480

  ctx.fillStyle = 'rgba(6, 10, 28, 0.9)';
  ctx.fillRect(0, hudY, canvas.width, canvas.height - hudY);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.font      = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText(`BONES: ${state.score}`, 14, hudY + 20);

  if (state.player.treatTimer > 0) {
    ctx.fillStyle = '#ff88ff';
    ctx.fillText('★ TREAT POWER', 200, hudY + 20);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = '#9999cc';
  ctx.font      = '8px "Press Start 2P", monospace';
  ctx.fillText(state.room.def ? state.room.def.name : '', canvas.width - 14, hudY + 20);
  ctx.restore();
}

// ── Dialogue box ───────────────────────────────────────────────────────────────
function _renderDialogue() {
  const d = state.dialogue;
  if (!d.active) return;

  const BOX_H  = 162;
  const BOX_Y  = canvas.height - BOX_H;
  const PORT_W = 130;
  const PORT_H = BOX_H - 16;
  const PORT_X = 10;
  const PORT_Y = BOX_Y + 8;

  ctx.fillStyle = 'rgba(6, 10, 28, 0.95)';
  ctx.fillRect(0, BOX_Y, canvas.width, BOX_H);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth   = 2;
  ctx.strokeRect(2, BOX_Y + 2, canvas.width - 4, BOX_H - 4);

  // Portrait box
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(PORT_X, PORT_Y, PORT_W, PORT_H);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth   = 1;
  ctx.strokeRect(PORT_X, PORT_Y, PORT_W, PORT_H);

  const npc = state.room.npcs.find(n => n.id === d.npcId);
  if (npc) _drawPortrait(PORT_X + PORT_W / 2, PORT_Y + PORT_H / 2, npc);

  const textX = PORT_X + PORT_W + 14;

  // Speaker name
  ctx.fillStyle = '#ffd23f';
  ctx.font      = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(npc ? npc.name : '', textX, BOX_Y + 28);

  // Dialogue text
  const visibleText = (d.lines[d.lineIndex] || '').slice(0, d.charIndex);
  ctx.fillStyle = '#e8e8f8';
  ctx.font      = '10px "Press Start 2P", monospace';
  _drawWrappedText(visibleText, textX, BOX_Y + 52, canvas.width - textX - 16, 22, 4);

  // Line counter + prompt
  ctx.font      = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'right';
  if (d.allRevealed && Math.floor(state.tick / 25) % 2 === 0) {
    ctx.fillStyle = '#ffd23f';
    ctx.fillText('▼  Z / ENTER', canvas.width - 14, BOX_Y + BOX_H - 10);
  } else {
    ctx.fillStyle = '#666';
    ctx.fillText(`${d.lineIndex + 1} / ${d.lines.length}`, canvas.width - 14, BOX_Y + BOX_H - 10);
  }
}

function _drawWrappedText(text, x, y, maxW, lineH, maxLines) {
  const words = text.split(' ');
  let row = 0, cur = '';
  for (const word of words) {
    const test = cur + (cur ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxW && cur) {
      ctx.fillText(cur, x, y + row * lineH);
      cur = word;
      if (++row >= maxLines) return;
    } else {
      cur = test;
    }
  }
  if (cur && row < maxLines) ctx.fillText(cur, x, y + row * lineH);
}

// ── Portrait (close-up in dialogue box) ───────────────────────────────────────
function _drawPortrait(cx, cy, npc) {
  const sc = 2.2;
  ctx.save();
  ctx.translate(cx, cy);

  if (npc.type === 'human') {
    ctx.fillStyle = npc.color;
    ctx.beginPath(); ctx.ellipse(0, 18 * sc, 18 * sc, 14 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b87c';
    ctx.beginPath(); ctx.arc(0, -5 * sc, 18 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(-6 * sc, -5 * sc, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6 * sc,  -5 * sc, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-5 * sc, -6 * sc, 1 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7 * sc,  -6 * sc, 1 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-9 * sc, -10 * sc); ctx.lineTo(-3 * sc, -9 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3 * sc,  -10 * sc); ctx.lineTo(9 * sc,  -9 * sc); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -2 * sc, 7 * sc, 0.2, Math.PI - 0.2); ctx.stroke();

  } else if (npc.type === 'dog') {
    const dark = _hexShade(npc.color, -50);
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.ellipse(-15 * sc, -3 * sc, 7 * sc, 12 * sc, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15 * sc,  -3 * sc, 7 * sc, 12 * sc, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = npc.color;
    ctx.beginPath(); ctx.arc(0, -2 * sc, 18 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 18 * sc, 18 * sc, 12 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = _hexShade(npc.color, +30);
    ctx.beginPath(); ctx.ellipse(0, 4 * sc, 11 * sc, 8 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a1a0a';
    ctx.beginPath(); ctx.ellipse(0, 0, 5 * sc, 4 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-8 * sc, -5 * sc, 3.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8 * sc,  -5 * sc, 3.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-7 * sc, -6 * sc, 1.4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9 * sc,  -6 * sc, 1.4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8607a';
    ctx.beginPath(); ctx.ellipse(0, 9 * sc, 4 * sc, 5.5 * sc, 0, 0, Math.PI * 2); ctx.fill();

  } else if (npc.type === 'cat') {
    ctx.fillStyle = npc.color;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * 17 * sc, -8 * sc); ctx.lineTo(sx * 10 * sc, -22 * sc); ctx.lineTo(sx * 3 * sc, -8 * sc);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffaaaa';
      ctx.beginPath();
      ctx.moveTo(sx * 15 * sc, -9 * sc); ctx.lineTo(sx * 10 * sc, -18 * sc); ctx.lineTo(sx * 5 * sc, -9 * sc);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = npc.color;
    }
    ctx.fillStyle = npc.color;
    ctx.beginPath(); ctx.arc(0, -4 * sc, 16 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 14 * sc, 16 * sc, 12 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#88dd00';
    ctx.beginPath(); ctx.ellipse(-7 * sc, -5 * sc, 4 * sc, 4 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7 * sc,  -5 * sc, 4 * sc, 4 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(-7 * sc, -5 * sc, 1.5 * sc, 3.5 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7 * sc,  -5 * sc, 1.5 * sc, 3.5 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(220,220,220,0.9)'; ctx.lineWidth = 1.2;
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(0, -3 * sc); ctx.lineTo(sd * 22 * sc, -2 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -3 * sc); ctx.lineTo(sd * 22 * sc, -5 * sc); ctx.stroke();
    }
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-5 * sc, 2 * sc); ctx.lineTo(0, 4 * sc); ctx.lineTo(5 * sc, 2 * sc); ctx.stroke();

  } else if (npc.type === 'squirrel') {
    ctx.fillStyle = '#b07840';
    ctx.beginPath(); ctx.arc(14 * sc, -4 * sc, 14 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d09050';
    ctx.beginPath(); ctx.arc(14 * sc, -4 * sc, 9 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8b5e3c';
    ctx.beginPath(); ctx.ellipse(-2 * sc, 10 * sc, 12 * sc, 14 * sc, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-2 * sc, -6 * sc, 12 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-10 * sc, -15 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * sc,   -15 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(-5 * sc, -7 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * sc,  -7 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-4 * sc, -8 * sc, 1.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5 * sc,  -8 * sc, 1.5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,160,100,0.4)';
    ctx.beginPath(); ctx.arc(-8 * sc, -3 * sc, 5 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * sc,  -3 * sc, 5 * sc, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ── Menu screen ────────────────────────────────────────────────────────────────
function _renderMenu() {
  ctx.fillStyle = '#08081a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  const time = state.tick * 0.016;
  for (let i = 0; i < 80; i++) {
    const sx = (i * 137 + 11) % canvas.width;
    const sy = (i * 97  + 37) % (canvas.height - 180);
    const br = 0.4 + 0.6 * Math.abs(Math.sin(time + i));
    ctx.fillStyle = `rgba(255,255,220,${(br * 0.8).toFixed(2)})`;
    ctx.fillRect(sx, sy, 1 + (i % 2), 1 + (i % 2));
  }

  ctx.save();
  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#7700aa';
  ctx.font      = '32px "Press Start 2P", monospace';
  ctx.fillText("BUDDY'S QUEST", canvas.width / 2 + 3, 148 + 3);
  ctx.fillStyle = '#ffd23f';
  ctx.fillText("BUDDY'S QUEST", canvas.width / 2, 148);

  ctx.fillStyle = '#88aaff';
  ctx.font      = '13px "Press Start 2P", monospace';
  ctx.fillText('Top-Down Adventure', canvas.width / 2, 192);

  // Animated Buddy
  ctx.save();
  ctx.translate(canvas.width / 2, 330 + Math.sin(time * 2) * 6);
  _drawCharacter(0, 0, 'dog', '#c87a2a', 'down', Math.floor(state.tick / 12) % 4, 3.5, false);
  ctx.restore();

  ctx.fillStyle = '#ccccdd';
  ctx.font      = '9px "Press Start 2P", monospace';
  ctx.fillText('Help Buddy recover the neighbourhood bones!', canvas.width / 2, 435);

  ctx.fillStyle = '#aaaacc';
  ctx.font      = '8px "Press Start 2P", monospace';
  ctx.fillText('WASD / Arrows to move  •  Z / Enter to talk', canvas.width / 2, 460);

  ctx.restore();
}

// ── Game over / win screen ─────────────────────────────────────────────────────
function _renderOver() {
  ctx.fillStyle = '#07071a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.textAlign = 'center';

  if (state.gameWon) {
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '26px "Press Start 2P", monospace';
    ctx.fillText('CASE CLOSED!', canvas.width / 2, 130);

    ctx.fillStyle = '#aaffaa';
    ctx.font      = '10px "Press Start 2P", monospace';
    const lines = [
      'All bones recovered.',
      "Mr. Whiskers' sculpture",
      "was never built. (It was art.)",
      '',
      'Chester still barks at the fence.',
      'Nothing changes.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, 185 + i * 24));

    // Buddy and Whiskers side by side
    ctx.save();
    ctx.translate(canvas.width / 2 - 80, 375);
    _drawCharacter(0, 0, 'dog', '#c87a2a', 'right', Math.floor(state.tick / 12) % 4, 2.5, false);
    ctx.restore();
    ctx.save();
    ctx.translate(canvas.width / 2 + 80, 375);
    _drawCharacter(0, 0, 'cat', '#888899', 'left', 0, 2.5, false);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font      = '10px "Press Start 2P", monospace';
    ctx.fillText(`Bones collected: ${state.score}`, canvas.width / 2, 448);

  } else {
    ctx.fillStyle = '#ff4444';
    ctx.font      = '28px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', canvas.width / 2, 240);
  }

  if (Math.floor(state.tick / 30) % 2 === 0) {
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '10px "Press Start 2P", monospace';
    ctx.fillText('Press ENTER or START to play again', canvas.width / 2, 510);
  }
  ctx.restore();
}
