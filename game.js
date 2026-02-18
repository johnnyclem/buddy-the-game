function gameStep() {
  update(1 / 60);
  render();
}

function gameLoop() {
  if (state.mode === 'play') gameStep();
  else {
    render();
  }
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF') toggleFullscreen();
  if (event.code === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (state.mode === 'menu' && event.code === 'Enter') {
    beginRun();
  }
});

startButton.addEventListener('click', () => {
  beginRun();
});

window.addEventListener('resize', () => {
  setCanvasScale();
});

createWorld(0);
render();
setCanvasScale();
gameLoop();
showStartButton('Start BUDDY\n THE GAME');
