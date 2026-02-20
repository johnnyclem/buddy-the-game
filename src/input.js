// Input handling — keyboard events and window resize
// All movement keys write to state.input (shared with touch / voice / tilt)

document.addEventListener('keydown', (event) => {
  // Meta / system keys
  if (event.code === 'KeyF') toggleFullscreen();
  if (event.code === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }

  // ── Map mode input ────────────────────────────────────────────────────
  if (state.mode === 'map') {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      event.preventDefault();
      mapInput(-1);
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      event.preventDefault();
      mapInput(1);
    } else if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      mapSelect();
    }
    return;
  }

  if (event.code === 'Enter') {
    if (state.mode === 'menu') beginRun();
    else if (state.mode === 'over') goToMap();
  }

  // Movement — prevent page scroll on Space / arrow keys
  switch (event.code) {
    case 'ArrowLeft':
    case 'KeyA':
      state.input.left  = true;  break;

    case 'ArrowRight':
    case 'KeyD':
      state.input.right = true;  break;

    case 'Space':
    case 'ArrowUp':
    case 'KeyW':
      event.preventDefault();
      state.input.jump  = true;  break;

    case 'ArrowDown':
    case 'KeyS':
      event.preventDefault();
      state.input.sit   = true;  break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowLeft':  case 'KeyA': state.input.left  = false; break;
    case 'ArrowRight': case 'KeyD': state.input.right = false; break;
    case 'Space': case 'ArrowUp':  case 'KeyW': state.input.jump = false; break;
    case 'ArrowDown':  case 'KeyS': state.input.sit   = false; break;
  }
});

window.addEventListener('resize', () => {
  setCanvasScale();
});
