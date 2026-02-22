// On-screen touch controls — 4-way D-pad + interact button
// Automatically shown on touch-capable devices

function initTouchControls() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  // Reveal the pre-built DOM overlay and mic button
  const touchControls = document.getElementById('touch-controls');
  const micBtn        = document.getElementById('mic-btn');
  if (touchControls) touchControls.style.display = 'block';
  if (micBtn)        micBtn.style.display         = 'flex';

  // D-pad directions
  _bindButton('btn-left',  () => { state.input.left  = true;  }, () => { state.input.left  = false; });
  _bindButton('btn-right', () => { state.input.right = true;  }, () => { state.input.right = false; });
  _bindButton('btn-up',    () => { state.input.up    = true;  }, () => { state.input.up    = false; });
  _bindButton('btn-down',  () => { state.input.down  = true;  }, () => { state.input.down  = false; });

  // Action / interact button
  _bindButton(
    'btn-interact',
    () => {
      if (!state.input.interact) state.input.interactPressed = true;
      state.input.interact = true;
    },
    () => { state.input.interact = false; },
  );
}

function _bindButton(id, onDown, onUp) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('touchstart',  (e) => { e.preventDefault(); onDown(); }, { passive: false });
  el.addEventListener('touchend',    (e) => { e.preventDefault(); onUp();   }, { passive: false });
  el.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp();   }, { passive: false });

  // Mouse fallback for desktop testing
  el.addEventListener('mousedown',  onDown);
  el.addEventListener('mouseup',    onUp);
  el.addEventListener('mouseleave', onUp);
}
