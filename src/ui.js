// UI helpers — canvas scaling, fullscreen, start button, HUD

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
  state.mode = 'play';
  state.tick = 0;
  createWorld(Date.now());
  hideStartButton();
  document.getElementById('hud').style.opacity = '1';
}
