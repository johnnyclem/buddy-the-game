// Input handling — keyboard events and window resize
// All movement keys write to state.input (shared with touch, voice, and tilt)

document.addEventListener('keydown', (event) => {
  // Meta / system keys
  if (event.code === 'KeyF') toggleFullscreen();
  if (event.code === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }

  // Start from menu
  if (event.code === 'Enter' || event.code === 'Space') {
    if (state.mode === 'menu') { beginRun(); return; }
    if (state.mode === 'over') { beginRun(); return; }
  }

  // Interact / dialogue advance (Z, Enter, Space)
  if (
    event.code === 'KeyZ'   ||
    event.code === 'Enter'  ||
    event.code === 'Space'
  ) {
    event.preventDefault();
    if (!state.input.interact) {
      // Edge-trigger: only fire interactPressed on fresh press
      state.input.interactPressed = true;
    }
    state.input.interact = true;
    return;
  }

  // Movement
  switch (event.code) {
    case 'ArrowLeft':  case 'KeyA': event.preventDefault(); state.input.left  = true; break;
    case 'ArrowRight': case 'KeyD': event.preventDefault(); state.input.right = true; break;
    case 'ArrowUp':    case 'KeyW': event.preventDefault(); state.input.up    = true; break;
    case 'ArrowDown':  case 'KeyS': event.preventDefault(); state.input.down  = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowLeft':  case 'KeyA': state.input.left  = false; break;
    case 'ArrowRight': case 'KeyD': state.input.right = false; break;
    case 'ArrowUp':    case 'KeyW': state.input.up    = false; break;
    case 'ArrowDown':  case 'KeyS': state.input.down  = false; break;
    case 'KeyZ': case 'Enter': case 'Space':
      state.input.interact = false;
      break;
  }
});

window.addEventListener('resize', () => {
  setCanvasScale();
});
