// SMB3-style world map — connects levels with a path
// Buddy walks along the path between level nodes

// Map node positions (screen coordinates on the 960x540 canvas)
const MAP_NODES = [
  { x: 100,  y: 400, level: 1, name: 'PUPPY PARK',      icon: 'park' },
  { x: 250,  y: 320, level: 2, name: 'BACKYARD BASH',    icon: 'backyard' },
  { x: 420,  y: 280, level: 3, name: 'DOWNTOWN DASH',    icon: 'city' },
  { x: 560,  y: 200, level: 4, name: 'SPOOKY FOREST',    icon: 'forest' },
  { x: 680,  y: 300, level: 5, name: 'SNOWY PEAKS',      icon: 'snow' },
  { x: 780,  y: 180, level: 6, name: 'VOLCANO RIDGE',    icon: 'volcano' },
  { x: 880,  y: 100, level: 7, name: 'SKY PALACE',       icon: 'sky' },
];

// Map state
const mapState = {
  selected: 0,      // currently selected node index
  buddyX: 100,       // Buddy's interpolated position on map
  buddyY: 400,
  moving: false,     // is Buddy walking between nodes?
  moveProgress: 0,   // 0-1 interpolation during walk
  moveFrom: 0,       // source node index
  moveTo: 0,         // target node index
  entered: false,    // did the player just enter the map?
  nameFlash: 0,      // timer for name display
};

function initMap() {
  // Set Buddy at the highest unlocked but unbeaten level
  const maxCompleted = _getMaxCompletedLevel();
  mapState.selected = Math.min(maxCompleted, MAP_NODES.length - 1);
  const node = MAP_NODES[mapState.selected];
  mapState.buddyX = node.x;
  mapState.buddyY = node.y;
  mapState.moving = false;
  mapState.entered = true;
  mapState.nameFlash = 120; // show name for 2 seconds
}

function _getMaxCompletedLevel() {
  // levels beaten = unlocked commands - 1 (get_treat is always unlocked)
  return state.unlockedCommands.length - 1;
}

function updateMap(dt) {
  if (mapState.nameFlash > 0) mapState.nameFlash--;

  if (!mapState.moving) return;

  // Interpolate Buddy's position between nodes
  mapState.moveProgress += dt * 2.5; // walk speed
  if (mapState.moveProgress >= 1) {
    mapState.moveProgress = 1;
    mapState.moving = false;
    mapState.selected = mapState.moveTo;
    mapState.nameFlash = 90;
  }

  const from = MAP_NODES[mapState.moveFrom];
  const to   = MAP_NODES[mapState.moveTo];
  const t    = _easeInOut(mapState.moveProgress);
  mapState.buddyX = from.x + (to.x - from.x) * t;
  mapState.buddyY = from.y + (to.y - from.y) * t;
}

function _easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function mapInput(dir) {
  if (mapState.moving) return;

  const maxUnlocked = Math.min(_getMaxCompletedLevel() + 1, MAP_NODES.length);
  let next = mapState.selected + dir;

  if (next < 0 || next >= maxUnlocked) return;

  mapState.moveFrom = mapState.selected;
  mapState.moveTo = next;
  mapState.moveProgress = 0;
  mapState.moving = true;
}

function mapSelect() {
  if (mapState.moving) return;

  const node = MAP_NODES[mapState.selected];
  state.level = node.level;
  state.mode = 'play';
  state.tick = 0;
  state.levelWon = false;
  state.player.treatTimer = 0;
  createWorld(node.level * 7919); // deterministic seed per level
  hideStartButton();
  document.getElementById('hud').style.opacity = '1';
}

// ── Map rendering ──────────────────────────────────────────────────────────────

function renderMap() {
  const W = canvas.width;
  const H = canvas.height;
  const t = state.tick;

  // ── Background ─────────────────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,    '#0a1628');
  grad.addColorStop(0.5,  '#1a3050');
  grad.addColorStop(1,    '#2a5030');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Grid pattern (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy < H; gy += 40) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // ── Decorative terrain ─────────────────────────────────────────────────────
  // Water at bottom
  ctx.fillStyle = '#1a4a8a';
  ctx.fillRect(0, H - 60, W, 60);
  // Waves
  ctx.fillStyle = '#2a5a9a';
  for (let wx = 0; wx < W; wx += 30) {
    const wy = H - 60 + Math.sin((wx + t * 0.8) * 0.05) * 4;
    ctx.fillRect(wx, wy, 20, 4);
  }

  // Green terrain patches
  ctx.fillStyle = '#1a5a20';
  ctx.fillRect(30, 350, 200, 120);
  ctx.fillRect(350, 230, 180, 200);
  ctx.fillRect(500, 150, 220, 300);
  ctx.fillRect(720, 120, 200, 350);

  // Sandy paths
  ctx.fillStyle = '#3a6a30';
  ctx.fillRect(50, 360, 180, 100);
  ctx.fillRect(370, 250, 150, 170);
  ctx.fillRect(520, 170, 190, 260);
  ctx.fillRect(740, 140, 170, 310);

  const maxUnlocked = Math.min(_getMaxCompletedLevel() + 1, MAP_NODES.length);
  const maxCompleted = _getMaxCompletedLevel();

  // ── Path lines between nodes ───────────────────────────────────────────────
  for (let i = 0; i < MAP_NODES.length - 1; i++) {
    const a = MAP_NODES[i];
    const b = MAP_NODES[i + 1];

    if (i < maxUnlocked - 1) {
      // Completed path — solid bright
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 4;
    } else if (i < maxUnlocked) {
      // Available but not yet completed — dashed
      ctx.strokeStyle = 'rgba(255,210,63,0.5)';
      ctx.lineWidth = 3;
    } else {
      // Locked path — dim
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
    }

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // Path dots
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dots = Math.floor(dist / 20);
    for (let d = 1; d < dots; d++) {
      const frac = d / dots;
      const px = a.x + dx * frac;
      const py = a.y + dy * frac;
      ctx.fillStyle = i < maxUnlocked ? 'rgba(255,210,63,0.4)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }
  }

  // ── Level nodes ────────────────────────────────────────────────────────────
  for (let i = 0; i < MAP_NODES.length; i++) {
    const node = MAP_NODES[i];
    const unlocked = i < maxUnlocked;
    const completed = i < maxCompleted;
    const selected = i === mapState.selected && !mapState.moving;

    _drawMapNode(node, unlocked, completed, selected, t);
  }

  // ── Buddy on map ───────────────────────────────────────────────────────────
  const bx = mapState.buddyX;
  const by = mapState.buddyY;
  const buddyFrame = mapState.moving ? (Math.floor(t / 8) % 2) : 0;
  const buddyFacing = mapState.moving
    ? (MAP_NODES[mapState.moveTo].x > MAP_NODES[mapState.moveFrom].x)
    : true;
  _drawBuddy(bx - 20, by - 40, buddyFacing, buddyFrame, 1.0, false);

  // ── Title ──────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = '22px "Press Start 2P"';
  ctx.fillStyle = '#000030';
  ctx.fillText("BUDDY'S QUEST", W / 2 + 3, 23);
  ctx.fillStyle = '#ffd23f';
  ctx.fillText("BUDDY'S QUEST", W / 2, 20);

  // Subtitle
  ctx.font = '9px "Press Start 2P"';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('WORLD MAP', W / 2, 50);

  // ── Selected level name ────────────────────────────────────────────────────
  if (!mapState.moving && mapState.nameFlash > 0) {
    const node = MAP_NODES[mapState.selected];
    const alpha = mapState.nameFlash < 20
      ? mapState.nameFlash / 20
      : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Name box
    const nameW = 280;
    const nameH = 50;
    const nameX = W / 2 - nameW / 2;
    const nameY = H - 80;

    ctx.fillStyle = 'rgba(0,0,30,0.85)';
    ctx.fillRect(nameX, nameY, nameW, nameH);
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 2;
    ctx.strokeRect(nameX, nameY, nameW, nameH);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '11px "Press Start 2P"';
    ctx.fillStyle = '#ffd23f';
    ctx.fillText('LEVEL ' + node.level, W / 2, nameY + 16);
    ctx.font = '9px "Press Start 2P"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(node.name, W / 2, nameY + 35);

    ctx.restore();
  }

  // ── Controls hint ──────────────────────────────────────────────────────────
  const blinkOn = t % 60 < 42;
  if (blinkOn) {
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('ARROWS TO MOVE  /  ENTER TO PLAY', W / 2, H - 10);
  }

  // ── Border ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,210,63,0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, W - 6, H - 6);
}

function _drawMapNode(node, unlocked, completed, selected, tick) {
  const x = node.x;
  const y = node.y;
  const size = selected ? 22 : 18;
  const bounce = selected ? Math.sin(tick * 0.1) * 3 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(x, y + 4, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  if (!unlocked) {
    // Locked — dark circle with lock icon
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.arc(x, y + bounce, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + bounce, size, 0, Math.PI * 2);
    ctx.stroke();

    // Lock symbol
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(x - 5, y + bounce - 2, 10, 8);
    ctx.strokeStyle = '#5a5a6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + bounce - 5, 5, Math.PI, 0);
    ctx.stroke();
    return;
  }

  // ── Node circle by theme ───────────────────────────────────────────────────
  const colors = {
    park:     { bg: '#2ecc40', border: '#1a9030', inner: '#3edd55' },
    backyard: { bg: '#a0522d', border: '#7a3c1a', inner: '#b8763e' },
    city:     { bg: '#7f8c8d', border: '#566573', inner: '#95a5a6' },
    forest:   { bg: '#2a5a2a', border: '#1a3a1a', inner: '#3a7a3a' },
    snow:     { bg: '#c8dbe8', border: '#8899aa', inner: '#e8eef4' },
    volcano:  { bg: '#cc3300', border: '#991a00', inner: '#ff4422' },
    sky:      { bg: '#8a6aee', border: '#6a4acc', inner: '#aa8aff' },
  };

  const c = colors[node.icon] || colors.park;

  // Outer glow if selected
  if (selected) {
    ctx.fillStyle = 'rgba(255,210,63,0.3)';
    ctx.beginPath();
    ctx.arc(x, y + bounce, size + 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main circle
  ctx.fillStyle = c.bg;
  ctx.beginPath();
  ctx.arc(x, y + bounce, size, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = c.inner;
  ctx.beginPath();
  ctx.arc(x - 3, y + bounce - 3, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = selected ? '#ffd23f' : c.border;
  ctx.lineWidth = selected ? 3 : 2;
  ctx.beginPath();
  ctx.arc(x, y + bounce, size, 0, Math.PI * 2);
  ctx.stroke();

  // ── Level number ─────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = (selected ? '11' : '9') + 'px "Press Start 2P"';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('' + node.level, x, y + bounce);

  // Completed checkmark
  if (completed) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText('★', x + size + 4, y + bounce - size + 2);
  }

  // Theme icon (small pixel art below node)
  _drawMapIcon(node.icon, x, y + size + 10 + bounce);
}

function _drawMapIcon(icon, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const labels = {
    park: '🌳', backyard: '🏡', city: '🏙', forest: '🌲',
    snow: '❄', volcano: '🌋', sky: '☁',
  };
  // Use simple pixel text instead of emoji (more 8-bit feel)
  const textLabels = {
    park: '~T~', backyard: '-F-', city: '|B|', forest: '.t.',
    snow: '*S*', volcano: '^V^', sky: '~C~',
  };
  ctx.fillText(textLabels[icon] || '???', x, y);
}
