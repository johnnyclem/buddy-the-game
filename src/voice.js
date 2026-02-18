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

// ── Unlockable commands — earned one per level beaten ────────────────────────
// Keywords for detection + the order they unlock
const UNLOCKABLE_COMMANDS = {
  get_treat:    ['get the treat', 'get the snack', 'get treat', 'get snack', 'grab the treat', 'grab the snack', 'fetch treat', 'fetch snack'],
  come:         ['come', 'come here', 'here boy', 'here'],
  stay:         ['stay', 'wait'],
  sit_trick:    ['sit'],
  double_jump:  ['double jump', 'double-jump'],
  jump_trick:   ['jump'],
  attack:       ['attack', 'bite', 'get em', 'get him', 'sic'],
  play_dead:    ['play dead', 'dead', 'bang'],
  fly:          ['fly', 'soar', 'wings'],
};

// Order in which commands unlock (one per level beaten)
const UNLOCK_ORDER = ['come', 'stay', 'sit_trick', 'double_jump', 'jump_trick', 'attack', 'play_dead', 'fly'];

// Buddy listens about 75% of the time
const OBEDIENCE_RATE = 0.75;

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

  // ── Training mode intercept ────────────────────────────────────────────
  if (state.training.active && state.training.phase === 'waiting') {
    _handleTrainingVoice(transcript);
    return;
  }

  // ── Check unlockable commands first ────────────────────────────────────
  let unlockMatch = null;
  for (const cmd of state.unlockedCommands) {
    const keywords = UNLOCKABLE_COMMANDS[cmd];
    if (keywords && keywords.some((kw) => transcript.includes(kw))) {
      unlockMatch = cmd;
      break;
    }
  }

  if (unlockMatch) {
    _applyUnlockableCommand(unlockMatch);
    return;
  }

  // ── Regular movement commands ──────────────────────────────────────────
  let matched = null;
  for (const [cmd, keywords] of Object.entries(VOICE_COMMANDS)) {
    if (keywords.some((kw) => transcript.includes(kw))) {
      matched = cmd;
      break;
    }
  }

  if (!matched) return;

  const hasTreat = state.player.treatTimer > 0;

  // With a treat Buddy always obeys; otherwise 75% chance
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

// ── Unlockable command logic ──────────────────────────────────────────────────

function _applyUnlockableCommand(cmd) {
  const listens = Math.random() < OBEDIENCE_RATE;

  if (cmd === 'get_treat') {
    _handleGetTreat(listens);
  } else if (cmd === 'come') {
    if (listens) {
      // Buddy stops moving — equivalent to "heel"
      state.input.left  = false;
      state.input.right = false;
      state.player.vx   = 0;
      _setReaction('*runs over*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'stay') {
    if (listens) {
      state.input.left  = false;
      state.input.right = false;
      state.input.sit   = true;
      setTimeout(() => { state.input.sit = false; }, 2000);
      _setReaction('*stays put*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'sit_trick') {
    if (listens) {
      state.input.sit = true;
      setTimeout(() => { state.input.sit = false; }, 600);
      _setReaction('*sits nicely*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'double_jump') {
    if (listens) {
      // Give temporary double-jump
      state.player.jumpsLeft = 2;
      state.input.jump = true;
      setTimeout(() => { state.input.jump = false; }, 120);
      setTimeout(() => {
        state.input.jump = true;
        setTimeout(() => { state.input.jump = false; }, 120);
      }, 300);
      _setReaction('*BOING BOING*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'jump_trick') {
    if (listens) {
      state.input.jump = true;
      setTimeout(() => { state.input.jump = false; }, 120);
      _setReaction('*jumps high!*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'attack') {
    if (listens) {
      // Dash forward quickly
      const dir = state.player.facingRight;
      state.input[dir ? 'right' : 'left'] = true;
      state.player.vx = dir ? 600 : -600;
      setTimeout(() => { state.input[dir ? 'right' : 'left'] = false; }, 400);
      _setReaction('*GRRR CHOMP!*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'play_dead') {
    if (listens) {
      state.input.sit = true;
      state.player.sitTimer = 120; // longer sit
      setTimeout(() => { state.input.sit = false; }, 100);
      _setReaction('*flops over*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  } else if (cmd === 'fly') {
    if (listens) {
      // Big upward boost
      state.player.vy = -900;
      state.player.onGround = false;
      _setReaction('*WHOOOOSH!*');
    } else {
      _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    }
  }
}

function _handleGetTreat(listens) {
  if (!state.world) return;

  if (!listens) {
    _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
    return;
  }

  const p = state.player;
  const halfScreen = canvas.width * 0.5;

  // Find nearest uncollected treat/bone within range (use squared distance for efficiency)
  const maxDistSq = halfScreen * halfScreen;
  let nearest = null;
  let nearestDistSq = Infinity;

  // Check treats
  for (const treat of state.world.treats) {
    if (treat.collected) continue;
    const dx = treat.x - p.x;
    const dy = treat.y - p.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < maxDistSq && distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = treat;
    }
  }

  // Check bones
  for (const bone of state.world.bones) {
    if (bone.collected) continue;
    const dx = bone.x - p.x;
    const dy = bone.y - p.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < maxDistSq && distSq < nearestDistSq) {
      nearestDistSq = distSq;
      nearest = bone;
    }
  }

  if (!nearest) {
    _setReaction('*looks around* ???');
    return;
  }

  // Move Buddy toward the nearest collectible
  const dx = nearest.x - p.x;
  if (Math.abs(dx) > 20) {
    const dir = dx > 0 ? 'right' : 'left';
    state.input[dir] = true;
    const moveDuration = Math.min(2000, Math.abs(dx) * 4);
    setTimeout(() => { state.input[dir] = false; }, moveDuration);
  }

  // Jump if target is above
  const dy = nearest.y - p.y;
  if (dy < -30) {
    state.input.jump = true;
    setTimeout(() => { state.input.jump = false; }, 120);
  }

  _setReaction('*sniff sniff* TREAT!');
}

// ── Training mode voice handler ──────────────────────────────────────────────

function _handleTrainingVoice(transcript) {
  const t = state.training;

  // Check if the player said the right command
  let matched = false;
  const trainingKeywords = UNLOCKABLE_COMMANDS[t.command];
  if (trainingKeywords && trainingKeywords.some((kw) => transcript.includes(kw))) {
    matched = true;
  }

  if (!matched) return;

  // 75% obedience rate applies in training too
  const obeyed = Math.random() < OBEDIENCE_RATE;
  t.obeyed = obeyed;
  t.phase = 'reacting';
  t.reactTimer = 90; // 1.5 seconds

  if (obeyed) {
    t.successes++;
    _setReaction(GOOD_BOY_REPLIES[Math.floor(Math.random() * GOOD_BOY_REPLIES.length)]);
  } else {
    t.successes = 0; // reset — need 3 in a row
    _setReaction(IGNORE_REPLIES[Math.floor(Math.random() * IGNORE_REPLIES.length)]);
  }

  if (t.successes >= 3) {
    t.phase = 'done';
    t.reactTimer = 120; // 2 seconds for celebration
    _setReaction('GOOD BOY!! LEARNED IT!');
  }
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
