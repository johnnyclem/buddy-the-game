// Tilt-to-move via the DeviceOrientation API
// gamma: left/right tilt — negative = tilted left, positive = tilted right

const TILT_DEAD_ZONE = 7;   // degrees of dead zone in the centre
const TILT_MAX       = 35;  // degrees for maximum movement speed (unused until physics exist)

function initTilt() {
  if (typeof DeviceOrientationEvent === 'undefined') {
    state.tilt.supported = false;
    return;
  }
  state.tilt.supported = true;

  // Android and desktop: no permission needed — attach straight away
  // iOS 13+: needs a user-gesture permission (handled via requestTiltPermission)
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
    _attachOrientationListener();
    state.tilt.enabled = true;
  }
}

// Call this from a user-gesture handler (e.g. mic button tap) on iOS
function requestTiltPermission() {
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
    // Not iOS — just attach and resolve
    _attachOrientationListener();
    state.tilt.enabled = true;
    return Promise.resolve('granted');
  }

  return DeviceOrientationEvent.requestPermission().then((response) => {
    if (response === 'granted') {
      _attachOrientationListener();
      state.tilt.enabled = true;
    }
    return response;
  });
}

// Called once per frame from update() — maps gamma to state.input
function applyTiltInput() {
  if (!state.tilt.enabled) return;

  const g = state.tilt.gamma;

  if (g < -TILT_DEAD_ZONE) {
    state.input.left  = true;
    state.input.right = false;
  } else if (g > TILT_DEAD_ZONE) {
    state.input.right = true;
    state.input.left  = false;
  }
  // Inside dead zone: don't touch — voice/keyboard timeouts handle clearing
}

function _attachOrientationListener() {
  window.addEventListener('deviceorientation', (event) => {
    state.tilt.gamma = event.gamma ?? 0;
  });
}
