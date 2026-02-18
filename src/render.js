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
  ctx.fillStyle = '#163d7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.font      = '36px "Press Start 2P"';
  ctx.fillText("BUDDY'S QUEST", canvas.width / 2, canvas.height / 2 - 56);

  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  ctx.font      = '11px "Press Start 2P"';
  ctx.fillStyle = '#ffd23f';

  if (isMobile) {
    ctx.fillText('TAP START  OR  SAY "JUMP BUDDY"', canvas.width / 2, canvas.height / 2 + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font      = '9px "Press Start 2P"';
    ctx.fillText('TILT DEVICE TO MOVE', canvas.width / 2, canvas.height / 2 + 48);
  } else {
    ctx.fillText('PRESS ENTER OR CLICK START', canvas.width / 2, canvas.height / 2 + 16);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font      = '9px "Press Start 2P"';
    ctx.fillText('ARROWS / WASD + SPACE TO PLAY', canvas.width / 2, canvas.height / 2 + 48);
  }
}

function _renderGame() {
  ctx.fillStyle = '#163d7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // TODO: draw world, player, enemies, etc.
  ctx.fillStyle    = '#ffffff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font         = '14px "Press Start 2P"';
  ctx.fillText('GAME RUNNING — tick ' + state.tick, canvas.width / 2, canvas.height / 2);
}

function _renderGameOver() {
  ctx.fillStyle = '#163d7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffffff';
  ctx.font      = '36px "Press Start 2P"';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 24);

  ctx.font      = '12px "Press Start 2P"';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('PRESS ENTER TO PLAY AGAIN', canvas.width / 2, canvas.height / 2 + 32);
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
