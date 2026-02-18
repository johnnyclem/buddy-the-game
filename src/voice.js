// Voice command recognition — Buddy has selective hearing
// Uses the Web Speech API (SpeechRecognition / webkitSpeechRecognition)
//
// Commands must include "buddy" somewhere in the phrase:
//   "buddy jump", "jump buddy", "hey buddy fetch", etc.

// ── Keyword tables ───────────────────────────────────────────────────────────
const VOICE_COMMANDS = {
  jump:  ['jump', 'hop', 'leap', 'up', 'hup', 'bounce'],
  left:  ['come', 'here', 'heel', 'this way', 'come here', 'over here', 'left'],
  right: ['fetch', 'go', 'that way', 'go get it', 'go on', 'right'],
  sit:   ['sit', 'stay', 'stop', 'wait', 'down', 'no', 'bad boy', 'bad dog'],
};

// Buddy listens about 2/3 of the time — unless he has a treat
const OBEDIENCE_RATE = 0.68;

const GOOD_BOY_REPLIES  = ['Woof!', 'OK!', '*tail wag*', 'Arf!', 'BARK!', 'Yip!'];
const HYPER_REPLIES     = ['WOOF!!', 'YES YES YES!', '*zooom*', 'ARF ARF ARF!', 'LETS GO!!'];
const IGNORE_REPLIES    = ['...', '*sniff*', '*yawn*', '?', '*looks away*', '*chases tail*'];

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
  // Must say "buddy" somewhere in the phrase
  if (!transcript.includes('buddy')) return;

  let matched = null;
  for (const [cmd, keywords] of Object.entries(VOICE_COMMANDS)) {
    if (keywords.some((kw) => transcript.includes(kw))) {
      matched = cmd;
      break;
    }
  }

  if (!matched) return;

  const hasTreat = state.player.treatTimer > 0;

  // With a treat Buddy always obeys; otherwise ~68% chance
  const listens = hasTreat || Math.random() < OBEDIENCE_RATE;

  if (listens) {
    _applyCommand(matched, hasTreat);
    const pool = hasTreat ? HYPER_REPLIES : GOOD_BOY_REPLIES;
    _setReaction(pool[Math.floor(Math.random() * pool.length)]);
  } else {
    _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
  }
}

function _applyCommand(cmd, hasTreat) {
  const duration = hasTreat ? 1400 : 900; // treat = longer movement burst

  if (cmd === 'jump') {
    // Trigger jump — if in air and has treat, allow mid-air jump too
    state.input.jump = true;
    setTimeout(() => { state.input.jump = false; }, 120);

  } else if (cmd === 'left') {
    state.input.left  = true;
    state.input.right = false;
    setTimeout(() => { state.input.left = false; }, duration);

  } else if (cmd === 'right') {
    state.input.right = true;
    state.input.left  = false;
    setTimeout(() => { state.input.right = false; }, duration);

  } else if (cmd === 'sit') {
    if (hasTreat) {
      // Too hyped to sit — jump instead!
      state.input.jump = true;
      setTimeout(() => { state.input.jump = false; }, 120);
      _setReaction('TOO HYPER TO SIT!!');
    } else {
      state.input.left  = false;
      state.input.right = false;
      state.input.sit   = true;
      setTimeout(() => { state.input.sit = false; }, 600);
    }
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
