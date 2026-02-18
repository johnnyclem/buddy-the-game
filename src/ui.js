// UI helpers — canvas scaling, fullscreen, start button, beginRun, mobile init

function setCanvasScale() {
  const scaleX = window.innerWidth / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = Math.floor(canvas.width * scale) + 'px';
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
  btn.textContent = text;
  btn.style.display = 'block';
}

function hideStartButton() {
  document.getElementById('start-btn').style.display = 'none';
}

function beginRun() {
  state.mode     = 'play';
  state.tick     = 0;
  state.levelWon = false;
  state.player.treatTimer = 0;
  createWorld(Date.now());
  hideStartButton();
  document.getElementById('hud').style.opacity = '1';
}

// ── Mobile UI init ────────────────────────────────────────────────────────────
// Wires up the mic button: toggles voice recognition and (on iOS) requests
// DeviceOrientation permission via the required user-gesture path.

function initMobileUI() {
  const micBtn = document.getElementById('mic-btn');
  if (!micBtn) return;

  micBtn.addEventListener('click', () => {
    // iOS 13+ needs a user gesture to grant DeviceOrientation permission.
    // Piggyback on the mic button tap so the player needs only one button.
    if (state.tilt.supported && !state.tilt.enabled) {
      requestTiltPermission();
    }

    if (state.voice.supported) {
      toggleVoice();
    }
  });
}
