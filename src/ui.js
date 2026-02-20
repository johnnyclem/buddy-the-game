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

// Start from the menu — go to the world map
function beginRun() {
  hideStartButton();
  state.mode = 'map';
  state.tick = 0;
  initMap();
  document.getElementById('hud').style.opacity = '1';
}

// Go to the world map (from game over or after training)
function goToMap() {
  if (state.levelWon) {
    // Advance to next level
    state.level = Math.min(state.level + 1, LEVEL_DEFS.length);
  }
  state.mode = 'map';
  state.tick = 0;
  state.levelWon = false;
  state.player.treatTimer = 0;
  initMap();
}

// ── Mobile UI init ────────────────────────────────────────────────────────────

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
