// UI helpers — canvas scaling, fullscreen, start button, mobile init

function setCanvasScale() {
  const scaleX = window.innerWidth  / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  const scale  = Math.min(scaleX, scaleY);
  canvas.style.width  = Math.floor(canvas.width  * scale) + 'px';
  canvas.style.height = Math.floor(canvas.height * scale) + 'px';
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.getElementById('frame').requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function showStartButton(text) {
  const btn = document.getElementById('start-btn');
  btn.textContent  = text;
  btn.style.display = 'block';
}

function hideStartButton() {
  document.getElementById('start-btn').style.display = 'none';
}

// Begin/restart game — always starts fresh from room 0
function beginRun() {
  hideStartButton();
  document.getElementById('hud').style.opacity = '1';
  startGame();
}

// ── Mobile UI init ─────────────────────────────────────────────────────────────

function initMobileUI() {
  const micBtn = document.getElementById('mic-btn');
  if (!micBtn) return;

  micBtn.addEventListener('click', () => {
    if (state.tilt.supported && !state.tilt.enabled) {
      requestTiltPermission();
    }
    if (state.voice.supported) {
      toggleVoice();
    }
  });
}
