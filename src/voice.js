// Voice command recognition — Buddy has selective hearing
// Uses the Web Speech API (SpeechRecognition / webkitSpeechRecognition)

// ── Keyword tables ───────────────────────────────────────────────────────────
const VOICE_COMMANDS = {
  jump:  ['jump', 'hop', 'leap', 'up', 'hup', 'bounce'],
  left:  ['left', 'come', 'here', 'heel', 'this way', 'come here', 'over here'],
  right: ['right', 'fetch', 'go', 'that way', 'go get it', 'go on'],
  sit:   ['sit', 'stay', 'stop', 'wait', 'down', 'no', 'bad boy', 'bad dog'],
};

// Buddy listens about 2/3 of the time — just like a real dog
const OBEDIENCE_RATE = 0.68;

const GOOD_BOY_REPLIES = ['Woof!', 'OK!', '*tail wag*', 'Arf!', 'BARK!', 'Yip!'];
const IGNORE_REPLIES   = ['...', '*sniff*', '*yawn*', '?', '*looks away*', '*chases tail*'];

// ── Internal state ───────────────────────────────────────────────────────────
let _recognition = null;

// ── Public API ───────────────────────────────────────────────────────────────
function initVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    state.voice.supported = false;
    return;
  }

  state.voice.supported = true;
  _recognition = new SpeechRecognition();
  _recognition.continuous     = true;
  _recognition.interimResults = false;
  _recognition.lang           = 'en-US';
  _recognition.maxAlternatives = 1;

  _recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      const transcript = result[0].transcript.toLowerCase().trim();
      state.voice.transcript = transcript;
      _handleVoiceCommand(transcript);
    }
  };

  _recognition.onerror = (event) => {
    // 'no-speech' is normal silence — ignore it
    if (event.error === 'not-allowed') {
      state.voice.active = false;
      _syncMicButton();
    }
  };

  // Browsers auto-stop after silence — restart if still active
  _recognition.onend = () => {
    if (state.voice.active) {
      try { _recognition.start(); } catch (_) {}
    }
  };
}

function startVoice() {
  if (!_recognition || state.voice.active) return;
  try {
    _recognition.start();
    state.voice.active = true;
    _syncMicButton();
  } catch (_) {}
}

function stopVoice() {
  if (!_recognition || !state.voice.active) return;
  state.voice.active = false;
  try { _recognition.stop(); } catch (_) {}
  _syncMicButton();
}

function toggleVoice() {
  if (state.voice.active) stopVoice();
  else startVoice();
}

// ── Internal helpers ─────────────────────────────────────────────────────────
function _handleVoiceCommand(transcript) {
  let matched = null;

  for (const [cmd, keywords] of Object.entries(VOICE_COMMANDS)) {
    if (keywords.some((kw) => transcript.includes(kw))) {
      matched = cmd;
      break;
    }
  }

  if (!matched) return; // unrecognised phrase — Buddy ignores silently

  const listens = Math.random() < OBEDIENCE_RATE;

  if (listens) {
    _applyCommand(matched);
    _setReaction(GOOD_BOY_REPLIES[Math.floor(Math.random() * GOOD_BOY_REPLIES.length)]);
  } else {
    _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
  }
}

function _applyCommand(cmd) {
  if (cmd === 'jump') {
    state.input.jump = true;
    setTimeout(() => { state.input.jump = false; }, 120);

  } else if (cmd === 'left') {
    state.input.left  = true;
    state.input.right = false;
    setTimeout(() => { state.input.left = false; }, 900);

  } else if (cmd === 'right') {
    state.input.right = true;
    state.input.left  = false;
    setTimeout(() => { state.input.right = false; }, 900);

  } else if (cmd === 'sit') {
    state.input.left  = false;
    state.input.right = false;
    state.input.sit   = true;
    setTimeout(() => { state.input.sit = false; }, 600);
  }
}

function _setReaction(text) {
  state.voice.reaction      = text;
  state.voice.reactionUntil = Date.now() + 2200;
}

function _syncMicButton() {
  const btn = document.getElementById('mic-btn');
  if (!btn) return;
  if (state.voice.active) {
    btn.classList.add('listening');
    btn.textContent = 'ON';
  } else {
    btn.classList.remove('listening');
    btn.textContent = 'MIC';
  }
}
