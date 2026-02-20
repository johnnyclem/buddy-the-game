// Training mini-game — close-up view where you teach Buddy a new voice command
// After beating a level, the player enters training mode to learn the next command.
// Buddy must obey the command 3x in a row (at 75% obedience rate) to learn it.

// Pretty names defined in levels.js as COMMAND_DISPLAY_NAMES

const COMMAND_PHRASES = {
  get_treat:   '"Buddy, get the treat!"',
  come:        '"Buddy, come!"',
  stay:        '"Buddy, stay!"',
  sit_trick:   '"Buddy, sit!"',
  double_jump: '"Buddy, double-jump!"',
  jump_trick:  '"Buddy, jump!"',
  attack:      '"Buddy, attack!"',
  play_dead:   '"Buddy, play dead!"',
  fly:         '"Buddy, fly!"',
};

// What Buddy does when he obeys each command (animation description for rendering)
const COMMAND_ANIMATIONS = {
  come:        'run_toward',
  stay:        'sit_still',
  sit_trick:   'sit',
  double_jump: 'double_jump',
  jump_trick:  'jump',
  attack:      'lunge',
  play_dead:   'flop',
  fly:         'float_up',
};

// ── Start training ───────────────────────────────────────────────────────────
function startTraining(commandKey) {
  const t = state.training;
  t.active     = true;
  t.command    = commandKey;
  t.successes  = 0;
  t.phase      = 'intro';
  t.reactTimer = 150; // 2.5 seconds intro
  t.obeyed     = false;
  t.buddyAnim  = 0;
  t.buddyAnimTimer = 0;
  t.promptTimer = 0;
  state.mode   = 'training';

  // Make sure voice is on for training
  if (state.voice.supported && !state.voice.active) {
    startVoice();
  }
}

// ── Update training ──────────────────────────────────────────────────────────
function updateTraining(dt) {
  const t = state.training;
  state.tick++;

  if (t.phase === 'intro') {
    t.reactTimer--;
    if (t.reactTimer <= 0) {
      t.phase = 'waiting';
    }
  } else if (t.phase === 'reacting') {
    t.reactTimer--;
    // Animate Buddy's reaction
    t.buddyAnimTimer += dt;

    if (t.reactTimer <= 0) {
      if (t.successes >= 3) {
        t.phase = 'done';
        t.reactTimer = 180; // 3 seconds celebration
      } else {
        t.phase = 'waiting';
      }
    }
  } else if (t.phase === 'done') {
    t.reactTimer--;
    if (t.reactTimer <= 0) {
      _finishTraining();
    }
  }

  // Buddy idle animation
  t.buddyAnimTimer += dt;
  if (t.buddyAnimTimer > 0.3) {
    t.buddyAnimTimer = 0;
    t.buddyAnim = (t.buddyAnim + 1) % 2;
  }
}

// ── Render training ──────────────────────────────────────────────────────────
function renderTraining() {
  const t = state.training;
  const W = canvas.width;
  const H = canvas.height;

  // Background — cozy indoor setting
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1a3a5c');
  grad.addColorStop(1, '#0d2137');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(0, H * 0.7, W, H * 0.3);
  ctx.fillStyle = '#4a3728';
  ctx.fillRect(0, H * 0.7, W, 4);

  // Spotlight circle on Buddy
  const spotX = W / 2;
  const spotY = H * 0.55;
  const spotGrad = ctx.createRadialGradient(spotX, spotY - 40, 10, spotX, spotY, 200);
  spotGrad.addColorStop(0, 'rgba(255,210,63,0.15)');
  spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Draw close-up Buddy (3x scale) ─────────────────────────────────────
  const buddyX = W / 2 - 60;
  const buddyY = H * 0.42;
  let buddyFrame = 0;

  if (t.phase === 'reacting' && t.obeyed) {
    // Show command-specific animation
    const anim = COMMAND_ANIMATIONS[t.command];
    if (anim === 'sit' || anim === 'sit_still' || anim === 'flop') {
      buddyFrame = 3; // sitting frame
    } else if (anim === 'jump' || anim === 'double_jump' || anim === 'float_up') {
      buddyFrame = 2; // airborne frame
    } else if (anim === 'run_toward' || anim === 'lunge') {
      buddyFrame = t.buddyAnim; // running animation
    }
  } else if (t.phase === 'reacting' && !t.obeyed) {
    buddyFrame = 0; // idle — ignored you
  } else {
    buddyFrame = 0; // idle
  }

  _drawBuddy(buddyX, buddyY, true, buddyFrame, 3.0, false);

  // ── Tail wag indicator when obeying ────────────────────────────────────
  if (t.phase === 'reacting' && t.obeyed) {
    // Happy sparkles around Buddy
    ctx.fillStyle = '#ffd23f';
    const sparkle = state.tick * 0.15;
    for (let i = 0; i < 6; i++) {
      const angle = sparkle + (i / 6) * Math.PI * 2;
      const dist = 80 + Math.sin(state.tick * 0.1 + i) * 20;
      const sx = buddyX + 60 + Math.cos(angle) * dist;
      const sy = buddyY + 48 + Math.sin(angle) * dist * 0.6;
      const size = 3 + Math.sin(state.tick * 0.2 + i * 2) * 2;
      ctx.fillRect(sx, sy, size, size);
    }
  }

  // ── UI Text ────────────────────────────────────────────────────────────
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  if (t.phase === 'intro') {
    // Title
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '20px "Press Start 2P"';
    ctx.fillText('NEW TRICK!', W / 2, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font      = '14px "Press Start 2P"';
    ctx.fillText('TEACH BUDDY TO', W / 2, 110);

    ctx.fillStyle = '#ffd23f';
    ctx.font      = '18px "Press Start 2P"';
    ctx.fillText(COMMAND_DISPLAY_NAMES[t.command] || t.command.toUpperCase(), W / 2, 145);
  } else if (t.phase === 'waiting') {
    // Command prompt
    ctx.fillStyle = '#ffffff';
    ctx.font      = '12px "Press Start 2P"';
    ctx.fillText('SAY:', W / 2, 50);

    ctx.fillStyle = '#ffd23f';
    ctx.font      = '16px "Press Start 2P"';
    const phrase = COMMAND_PHRASES[t.command] || '"Buddy, ' + t.command + '!"';
    ctx.fillText(phrase, W / 2, 85);

    // Pulsing microphone indicator
    const pulse = 0.5 + 0.5 * Math.sin(state.tick * 0.1);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(W / 2, 120, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font      = '8px "Press Start 2P"';
    ctx.fillText('LISTENING...', W / 2, 140);
  } else if (t.phase === 'reacting') {
    if (t.obeyed) {
      ctx.fillStyle = '#00ff88';
      ctx.font      = '20px "Press Start 2P"';
      ctx.fillText('GOOD BOY!', W / 2, 70);
    } else {
      ctx.fillStyle = '#ff6666';
      ctx.font      = '16px "Press Start 2P"';
      ctx.fillText('BUDDY IGNORED YOU!', W / 2, 60);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font      = '10px "Press Start 2P"';
      ctx.fillText('TRY AGAIN...', W / 2, 90);
    }
  } else if (t.phase === 'done') {
    ctx.fillStyle = '#ffd23f';
    ctx.font      = '24px "Press Start 2P"';
    ctx.fillText('LEARNED!', W / 2, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font      = '12px "Press Start 2P"';
    const name = COMMAND_DISPLAY_NAMES[t.command] || t.command.toUpperCase();
    ctx.fillText('BUDDY KNOWS ' + name + '!', W / 2, 100);

    // Celebration sparkles
    ctx.fillStyle = '#ffd23f';
    for (let i = 0; i < 12; i++) {
      const angle = (state.tick * 0.05) + (i / 12) * Math.PI * 2;
      const dist = 120 + Math.sin(state.tick * 0.08 + i) * 40;
      const sx = W / 2 + Math.cos(angle) * dist;
      const sy = H / 2 + Math.sin(angle) * dist * 0.5;
      const size = 2 + Math.sin(state.tick * 0.15 + i * 3) * 3;
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
    }
  }

  // ── Progress paw prints (3 needed) ─────────────────────────────────────
  const pawY = H - 60;
  const pawStartX = W / 2 - 60;
  for (let i = 0; i < 3; i++) {
    const px = pawStartX + i * 60;
    const filled = i < t.successes;

    // Paw print shape
    ctx.fillStyle = filled ? '#ffd23f' : 'rgba(255,255,255,0.2)';
    // Main pad
    ctx.beginPath();
    ctx.ellipse(px, pawY + 8, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Toes
    ctx.beginPath();
    ctx.arc(px - 8, pawY - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, pawY - 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + 8, pawY - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font      = '8px "Press Start 2P"';
  ctx.fillText(t.successes + ' / 3 IN A ROW', W / 2, H - 25);
}

// ── Finish training and advance ──────────────────────────────────────────────
function _finishTraining() {
  const t = state.training;
  t.active = false;
  t.phase  = 'intro';

  // Go to world map — level advancement happens in goToMap()
  state.levelWon = true;
  goToMap();
}
