// On-screen touch controls — D-pad (left/right) and jump button
// Automatically shown on touch-capable devices

function initTouchControls() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  // Reveal the pre-built DOM overlay and mic button
  const touchControls = document.getElementById('touch-controls');
  const micBtn        = document.getElementById('mic-btn');
  if (touchControls) touchControls.style.display = 'block';
  if (micBtn)        micBtn.style.display         = 'flex';

  // Bind each button: set state.input on press, clear on release
  _bindButton(
    'btn-left',
    () => { state.input.left  = true;  },
    () => { state.input.left  = false; },
  );
  _bindButton(
    'btn-right',
    () => { state.input.right = true;  },
    () => { state.input.right = false; },
  );
  _bindButton(
    'btn-jump',
    () => { state.input.jump  = true;  },
    () => { state.input.jump  = false; },
  );
}

function _bindButton(id, onDown, onUp) {
  const el = document.getElementById(id);
  if (!el) return;

  // Touch (primary — passive:false so we can call preventDefault)
  el.addEventListener('touchstart',  (e) => { e.preventDefault(); onDown(); }, { passive: false });
  el.addEventListener('touchend',    (e) => { e.preventDefault(); onUp();   }, { passive: false });
  el.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp();   }, { passive: false });

  // Mouse fallback for desktop testing
  el.addEventListener('mousedown',  onDown);
  el.addEventListener('mouseup',    onUp);
  el.addEventListener('mouseleave', onUp);
}
