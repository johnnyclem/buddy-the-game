// Input handling — keyboard events and window resize

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF') toggleFullscreen();

  if (event.code === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }

  if (event.code === 'Enter') {
    if (state.mode === 'menu' || state.mode === 'over') {
      beginRun();
    }
  }
});

window.addEventListener('resize', () => {
  setCanvasScale();
});
