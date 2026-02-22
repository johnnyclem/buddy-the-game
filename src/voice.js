// Voice command recognition — Buddy has selective hearing
// Uses the Web Speech API (SpeechRecognition / webkitSpeechRecognition)
// Commands must include "buddy" somewhere in the phrase.

// ── Keyword tables ─────────────────────────────────────────────────────────────
// Top-down directional remapping:  come/heel = up,  go/away = down
const VOICE_COMMANDS = {
  up:       ['come', 'heel', 'here', 'this way', 'come here', 'over here'],
  down:     ['go', 'away', 'go on', 'forward'],
  left:     ['left', 'turn left'],
  right:    ['right', 'turn right', 'fetch', 'that way'],
  sit:      ['sit', 'stay', 'stop', 'wait', 'no', 'bad boy', 'bad dog'],
  interact: ['sniff', 'check it', 'look', 'hello', 'speak'],
};

const UNLOCKABLE_COMMANDS = {
  get_treat: ['get the treat', 'get treat', 'fetch treat', 'get snack', 'find bone', 'find treat'],
  sit:       ['sit'],
  spin:      ['spin', 'roll over', 'twirl'],
};

// Kept for external compatibility (world.js / training.js stubs)
const UNLOCK_ORDER = ['sit', 'spin'];

const OBEDIENCE_RATE = 0.75;

const GOOD_BOY_REPLIES = ['Woof!', 'OK!', '*tail wag*', 'Arf!', 'BARK!', 'Yip!'];
const HYPER_REPLIES    = ['WOOF!!', 'YES YES YES!', '*zooom*', 'ARF ARF ARF!'];
const IGNORE_REPLIES   = ['...', '*sniff*', '*yawn*', '?', '*looks away*', '*chases tail*'];

// ── Internal state ─────────────────────────────────────────────────────────────
let _recognition = null;

// ── Public API ─────────────────────────────────────────────────────────────────
function initVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    state.voice.supported = false;
    return;
  }

  state.voice.supported = true;
  _recognition = new SpeechRecognition();
  _recognition.continuous      = true;
  _recognition.interimResults  = false;
  _recognition.lang            = 'en-US';
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

// ── Internal helpers ───────────────────────────────────────────────────────────
function _handleVoiceCommand(transcript) {
  // Must say "buddy" somewhere in the phrase
  if (!transcript.includes('buddy')) return;
  if (state.mode !== 'play') return;

  // Check unlockable commands first
  for (const cmd of state.unlockedCommands) {
    const keywords = UNLOCKABLE_COMMANDS[cmd];
    if (keywords && keywords.some(kw => transcript.includes(kw))) {
      _applyUnlockableCommand(cmd);
      return;
    }
  }

  // Regular movement / action commands
  let matched = null;
  for (const [cmd, keywords] of Object.entries(VOICE_COMMANDS)) {
    if (keywords.some(kw => transcript.includes(kw))) {
      matched = cmd;
      break;
    }
  }
  if (!matched) return;

  const listens = Math.random() < OBEDIENCE_RATE;
  if (listens) {
    _applyCommand(matched);
    _setReaction(GOOD_BOY_REPLIES[Math.floor(Math.random() * GOOD_BOY_REPLIES.length)]);
  } else {
    _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
  }
}

function _applyCommand(cmd) {
  const duration = 900;

  if (cmd === 'up') {
    state.input.up = true;
    setTimeout(() => { state.input.up = false; }, duration);

  } else if (cmd === 'down') {
    state.input.down = true;
    setTimeout(() => { state.input.down = false; }, duration);

  } else if (cmd === 'left') {
    state.input.left = true;
    setTimeout(() => { state.input.left = false; }, duration);

  } else if (cmd === 'right') {
    state.input.right = true;
    setTimeout(() => { state.input.right = false; }, duration);

  } else if (cmd === 'sit') {
    state.player.sitting = true;
    state.player.sitTimer = 120;  // 2 seconds
    _setReaction('*sits nicely*');

  } else if (cmd === 'interact') {
    state.input.interactPressed = true;
  }
}

function _applyUnlockableCommand(cmd) {
  const listens = Math.random() < OBEDIENCE_RATE;

  if (cmd === 'get_treat') {
    if (!listens) { _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]); return; }
    // Move Buddy toward the nearest uncollected item in this room
    const p = state.player;
    let nearest = null;
    let nearestDist = Infinity;
    for (const item of state.room.items) {
      if (item.collected) continue;
      const ix = item.col * TS + TS / 2;
      const iy = item.row * TS + TS / 2;
      const d  = Math.abs(ix - p.x) + Math.abs(iy - p.y);
      if (d < nearestDist) { nearestDist = d; nearest = item; }
    }
    if (!nearest) { _setReaction('*looks around* ???'); return; }
    const tx = nearest.col * TS + TS / 2;
    const ty = nearest.row * TS + TS / 2;
    const dx = tx - p.x;
    const dy = ty - p.y;
    const dur = Math.min(2000, Math.max(Math.abs(dx), Math.abs(dy)) * 6);
    if (Math.abs(dx) > Math.abs(dy)) {
      const dir = dx > 0 ? 'right' : 'left';
      state.input[dir] = true;
      setTimeout(() => { state.input[dir] = false; }, dur);
    } else {
      const dir = dy > 0 ? 'down' : 'up';
      state.input[dir] = true;
      setTimeout(() => { state.input[dir] = false; }, dur);
    }
    _setReaction('*sniff sniff* TREAT!');

  } else if (cmd === 'sit') {
    if (!listens) { _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]); return; }
    state.player.sitting  = true;
    state.player.sitTimer = 120;
    _setReaction('*sits perfectly*');

  } else if (cmd === 'spin') {
    if (!listens) { _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]); return; }
    // Do a quick spin by cycling directions
    const dirs = ['right', 'down', 'left', 'up', 'right'];
    dirs.forEach((d, i) => {
      setTimeout(() => { state.player.dir = d; }, i * 100);
    });
    _setReaction('*spins!!*');
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

// ── Render overlay ─────────────────────────────────────────────────────────────
function _renderVoiceFeedback() {
  if (!state.voice.supported) return;
  const reaction = state.voice.reaction;
  const active   = state.voice.active;

  if (reaction && Date.now() < state.voice.reactionUntil) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    const bw = 220, bh = 30;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height - (state.mode === 'dialogue' ? 200 : 60);
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(reaction, canvas.width / 2, by + 20);
    ctx.restore();
  }

  if (active) {
    ctx.save();
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('● MIC', canvas.width - 10, 18);
    ctx.restore();
  }
}
