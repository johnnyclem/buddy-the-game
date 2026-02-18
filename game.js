const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-btn');
const hud = document.getElementById('hud');

const WORLD_VIEW_WIDTH = canvas.width;
const WORLD_VIEW_HEIGHT = canvas.height;
const FLOOR_Y = 470;
const PLAYER_W = 34;
const PLAYER_H = 35;
const GRAVITY = 2200;
const MAX_FALL_SPEED = 1300;
const WALK_SPEED = 300;
const RUN_SPEED = 360;
const JUMP_VELOCITY = -620;
const DOUBLE_JUMP_VELOCITY = -540;
const IDLE_POOP_INTERVAL = 3;
const ENEMY_STOMP_BOUNCE = -365;
const ENEMY_CONTACT_DAMAGE = 1;
const BOSS_CONTACT_DAMAGE = 1;
const BOSS_BULLET_DAMAGE = 1;
const BOSS_HEADBUTT_DAMAGE = 2;
const ENEMY_HEADBUTT_DAMAGE = 2;
const BREAKABLE_HEADBUTT_DAMAGE = 2;
const HEAD_BUTT_COOLDOWN = 0.45;
const HEAD_BUTT_IMPULSE = 150;
const HEADBUTT_BOSS_INVULN = 0.55;
const STOMP_SCORE = 65;
const HEAD_BUTT_SCORE = 90;
const BOSS_HIT_SCORE = 120;
const BOSS_ATTACK_INTERVAL = 1.05;
const BOSS_MAX_HP = 8;
const MUSIC_LEVELS = [
  {
    interval: 0.32,
    bass: 82,
    melody: [146, 174, 196, 220, 196, 174, 164, 196],
    ambience: 0.045,
  },
  {
    interval: 0.28,
    bass: 95,
    melody: [175, 196, 220, 262, 220, 196, 208, 233],
    ambience: 0.05,
  },
  {
    interval: 0.26,
    bass: 55,
    melody: [174, 196, 233, 196, 174, 156, 196, 220],
    ambience: 0.055,
  },
  {
    interval: 0.24,
    bass: 73,
    melody: [196, 220, 233, 261, 233, 220, 196, 174],
    ambience: 0.048,
  },
];

const SOUNDTRACK_TRACKS = [
  {
    title: 'Noir Alley Nocturne',
    vibe: 'rain + throbbed bass',
    phrases: ['DRIP DRIP DRIP', 'NEON HUM', 'SOFT METRONOME'],
  },
  {
    title: 'Pipe & Vapor Transit',
    vibe: 'steam hiss + rolling pulse',
    phrases: ['TURBO CHARGE', 'GLASSY WHISPER', 'PIPE RUN'],
  },
  {
    title: 'Static Graveyard Waltz',
    vibe: 'low static drums',
    phrases: ['ELECTRIC WIND', 'SOUL RADIO', 'SABOTAGE BEAT'],
  },
  {
    title: 'Cathedral of Catnip',
    vibe: 'sinister hymn in 4/4',
    phrases: ['MEOW-MARCH', 'FISHY BASS', 'POTION DRUMS'],
  },
];

const worldBlueprints = [
  {
    name: 'Noir Alley',
    length: 2320,
    palette: {
      skyTop: '#1b1730',
      skyBottom: '#1f1a14',
      mid: '#222121',
      mid2: '#2d2622',
      floor: '#3a2f2d',
      accent: '#dbd7c8',
    },
    autoZones: [{ start: 600, end: 1900 }],
    platforms: [
      { x: 140, y: 390, w: 150, h: 24 },
      { x: 360, y: 335, w: 180, h: 24 },
      { x: 590, y: 290, w: 150, h: 24 },
      { x: 790, y: 380, w: 150, h: 24 },
      { x: 1010, y: 320, w: 160, h: 24 },
      { x: 1280, y: 260, w: 120, h: 24 },
      { x: 1450, y: 340, w: 220, h: 24 },
      { x: 1720, y: 300, w: 180, h: 24 },
      { x: 1960, y: 360, w: 130, h: 24 },
    ],
    breakables: [
      { x: 1060, y: 220, w: 44, h: 140, hp: 2 },
      { x: 1600, y: 220, w: 44, h: 140, hp: 3 },
    ],
    enemies: [
      { type: 'hound', x: 430, y: 356, w: 28, h: 26, speed: 95, dir: 1, minX: 430, maxX: 560, hp: 1 },
      { type: 'hound', x: 1110, y: 286, w: 28, h: 26, speed: 100, dir: -1, minX: 1050, maxX: 1185, hp: 1 },
    ],
  },
  {
    name: 'Pipe & Vapor District',
    length: 2620,
    palette: {
      skyTop: '#2a1822',
      skyBottom: '#100d0e',
      mid: '#2a191f',
      mid2: '#331d22',
      floor: '#4e272c',
      accent: '#f0ceb1',
    },
    autoZones: [{ start: 340, end: 2440 }],
    platforms: [
      { x: 260, y: 402, w: 110, h: 18 },
      { x: 500, y: 395, w: 120, h: 18 },
      { x: 740, y: 390, w: 115, h: 18 },
      { x: 970, y: 376, w: 120, h: 18 },
      { x: 1230, y: 360, w: 110, h: 18 },
      { x: 1460, y: 348, w: 130, h: 18 },
      { x: 1730, y: 334, w: 120, h: 18 },
      { x: 1990, y: 322, w: 140, h: 18 },
      { x: 2260, y: 300, w: 110, h: 18 },
    ],
    breakables: [
      { x: 620, y: 248, w: 36, h: 170, hp: 2 },
      { x: 1360, y: 238, w: 36, h: 180, hp: 2 },
      { x: 2140, y: 232, w: 36, h: 185, hp: 2 },
    ],
    enemies: [
      { type: 'sawblade', x: 320, y: 360, w: 24, h: 24, speed: 155, dir: 1, minX: 260, maxX: 520, hp: 1 },
      { type: 'bat', x: 860, y: 190, w: 24, h: 16, speed: 120, dir: -1, minX: 830, maxX: 1150, hp: 1 },
      { type: 'bat', x: 1600, y: 170, w: 24, h: 16, speed: 130, dir: 1, minX: 1520, maxX: 2020, hp: 1 },
    ],
  },
  {
    name: 'Graveyard of Static',
    length: 2500,
    palette: {
      skyTop: '#1e293f',
      skyBottom: '#181c22',
      mid: '#2f2937',
      mid2: '#3b3742',
      floor: '#4b5058',
      accent: '#dfd5b1',
    },
    autoZones: [{ start: 250, end: 620 }],
    platforms: [
      { x: 180, y: 400, w: 180, h: 22 },
      { x: 460, y: 350, w: 190, h: 22 },
      { x: 780, y: 295, w: 150, h: 22 },
      { x: 1020, y: 340, w: 210, h: 22 },
      { x: 1300, y: 285, w: 170, h: 22 },
      { x: 1580, y: 340, w: 210, h: 22 },
      { x: 1890, y: 265, w: 170, h: 22 },
      { x: 2140, y: 325, w: 170, h: 22 },
    ],
    breakables: [
      { x: 930, y: 245, w: 44, h: 150, hp: 4 },
      { x: 1760, y: 225, w: 44, h: 170, hp: 4 },
    ],
    enemies: [
      { type: 'hound', x: 300, y: 359, w: 28, h: 26, speed: 110, dir: 1, minX: 300, maxX: 430, hp: 1 },
      { type: 'ghost', x: 940, y: 210, w: 26, h: 26, speed: 70, dir: -1, minX: 880, maxX: 1130, hp: 1 },
      { type: 'ghost', x: 1620, y: 195, w: 26, h: 26, speed: 75, dir: 1, minX: 1520, maxX: 1840, hp: 1 },
    ],
    rescue: { x: 2060, y: 438, w: 30, h: 30 },
  },
  {
    name: 'Cathedral of the Potion',
    length: 2200,
    palette: {
      skyTop: '#141414',
      skyBottom: '#0b0a0b',
      mid: '#1c1a1f',
      mid2: '#262229',
      floor: '#392f33',
      accent: '#f8d59e',
    },
    autoZones: [],
    platforms: [
      { x: 220, y: 385, w: 200, h: 22 },
      { x: 520, y: 338, w: 200, h: 22 },
      { x: 830, y: 292, w: 180, h: 22 },
      { x: 1120, y: 242, w: 220, h: 22 },
      { x: 1420, y: 300, w: 210, h: 22 },
      { x: 1700, y: 248, w: 160, h: 22 },
      { x: 1940, y: 205, w: 160, h: 22 },
    ],
    breakables: [
      { x: 1080, y: 205, w: 42, h: 150, hp: 5 },
      { x: 1460, y: 185, w: 42, h: 170, hp: 5 },
    ],
    enemies: [
      { type: 'bat', x: 470, y: 185, w: 24, h: 16, speed: 95, dir: -1, minX: 430, maxX: 770, hp: 1 },
      { type: 'hound', x: 1025, y: 313, w: 28, h: 26, speed: 120, dir: 1, minX: 860, maxX: 1250, hp: 1 },
      { type: 'hound', x: 1690, y: 216, w: 28, h: 26, speed: 125, dir: -1, minX: 1620, maxX: 1910, hp: 1 },
    ],
    boss: {
      x: 1800,
      y: 170,
      w: 88,
      h: 84,
      hp: BOSS_MAX_HP,
      minX: 1700,
      maxX: 2000,
      speed: 90,
      dir: -1,
      shootTimer: 1,
      invuln: 0,
    },
  },
];

const keyState = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  KeyA: false,
  KeyD: false,
  KeyW: false,
  KeyS: false,
  Space: false,
  KeyE: false,
  KeyF: false,
  Escape: false,
};

const keyPressed = new Set();

const audioEngine = {
  ctx: null,
  master: null,
  sfxBus: null,
  musicBus: null,
  musicTimer: 0,
  musicStep: 0,
  musicEnabled: false,
};

function setPressed(code) {
  keyState[code] = true;
  keyPressed.add(code);
}

function initAudioEngine() {
  if (audioEngine.ctx) return true;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return false;
  try {
    const ctx = new Ctx();
    const master = ctx.createGain();
    const sfxBus = ctx.createGain();
    const musicBus = ctx.createGain();
    master.gain.value = 0.9;
    sfxBus.gain.value = 0.6;
    musicBus.gain.value = 0.3;

    sfxBus.connect(master);
    musicBus.connect(master);
    master.connect(ctx.destination);

    audioEngine.ctx = ctx;
    audioEngine.master = master;
    audioEngine.sfxBus = sfxBus;
    audioEngine.musicBus = musicBus;
    return true;
  } catch (error) {
    console.warn('Audio init failed:', error.message);
    return false;
  }
}

function primeAudio() {
  if (!initAudioEngine()) return;
  if (audioEngine.ctx.state === 'suspended') {
    audioEngine.ctx.resume().catch(() => {});
  }
  audioEngine.musicEnabled = true;
}

function playTone({
  frequency = 220,
  duration = 0.12,
  type = 'square',
  gain = 0.08,
  decay = 0.06,
  delay = 0,
  bus = 'sfx',
}) {
  if (!audioEngine.ctx || !audioEngine[`${bus}Bus`]) return;
  try {
    const now = audioEngine.ctx.currentTime + delay;
    const osc = audioEngine.ctx.createOscillator();
    const g = audioEngine.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration + decay);

    osc.connect(g);
    g.connect(audioEngine[`${bus}Bus`]);
    osc.start(now);
    osc.stop(now + duration + decay);
  } catch (error) {
    console.warn('SFX scheduling failed:', error.message);
  }
}

function playNoise({duration = 0.08, gain = 0.04, bus = 'sfx'}) {
  if (!audioEngine.ctx || !audioEngine[`${bus}Bus`]) return;
  try {
    const buffer = audioEngine.ctx.createBuffer(
      1,
      Math.max(1, Math.floor(audioEngine.ctx.sampleRate * duration)),
      audioEngine.ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const src = audioEngine.ctx.createBufferSource();
    const g = audioEngine.ctx.createGain();
    const filter = audioEngine.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const now = audioEngine.ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.buffer = buffer;
    src.connect(filter);
    filter.connect(g);
    g.connect(audioEngine[`${bus}Bus`]);
    src.start(now);
    src.stop(now + duration);
  } catch (error) {
    console.warn('Noise SFX failed:', error.message);
  }
}

function updateMusic(dt) {
  if (!audioEngine.musicEnabled || !audioEngine.ctx || state.mode !== 'play') return;
  const track = MUSIC_LEVELS[state.worldIndex] || MUSIC_LEVELS[0];
  audioEngine.musicTimer += dt;
  const stepRate = Math.max(0.14, Math.min(0.2, track.interval * 0.85));
  while (audioEngine.musicTimer >= stepRate) {
    audioEngine.musicTimer -= stepRate;
    const melody = track.melody;
    const note = melody[audioEngine.musicStep % melody.length];
    const octave = state.worldIndex >= 2 ? 1.02 : 0.9;
    const drumAccent = ((audioEngine.musicStep + state.worldIndex) % 8) === 0;
    const leadGain = state.worldIndex === 3 ? 0.055 : 0.045;
    playTone({
      frequency: note * octave,
      duration: 0.18,
      type: state.worldIndex === 3 ? 'triangle' : 'sawtooth',
      gain: leadGain,
      bus: 'music',
      decay: 0.12,
    });
    if (drumAccent) {
      playTone({
        frequency: track.bass,
        duration: 0.22,
        type: 'square',
        gain: track.ambience,
        bus: 'music',
        decay: 0.16,
      });
    }
    audioEngine.musicStep += 1;
  }
}

function triggerJumpSfx(doubleJump = false) {
  playTone({
    frequency: doubleJump ? 540 : 420,
    duration: 0.11,
    type: 'triangle',
    gain: 0.07,
    bus: 'sfx',
  });
  playTone({
    frequency: doubleJump ? 680 : 520,
    duration: 0.06,
    type: 'square',
    gain: 0.03,
    delay: 0.03,
    bus: 'sfx',
  });
}

function triggerHeadButtSfx() {
  playTone({ frequency: 150, duration: 0.07, type: 'sawtooth', gain: 0.08, bus: 'sfx' });
  playTone({ frequency: 260, duration: 0.06, type: 'square', gain: 0.03, delay: 0.03, bus: 'sfx' });
}

function triggerEnemyStompSfx() {
  playTone({ frequency: 320, duration: 0.07, type: 'triangle', gain: 0.06, bus: 'sfx' });
  playNoise({ duration: 0.07, gain: 0.03 });
}

function triggerBreakSfx() {
  playTone({ frequency: 110, duration: 0.09, type: 'square', gain: 0.09, bus: 'sfx' });
  playNoise({ duration: 0.08, gain: 0.04 });
}

function triggerBossHitSfx() {
  playTone({ frequency: 720, duration: 0.09, type: 'triangle', gain: 0.08, bus: 'sfx' });
  playTone({ frequency: 420, duration: 0.14, type: 'sawtooth', gain: 0.05, delay: 0.03, bus: 'sfx' });
}

function triggerRescueSfx() {
  playTone({ frequency: 500, duration: 0.08, type: 'triangle', gain: 0.07, bus: 'sfx' });
  playTone({ frequency: 660, duration: 0.08, type: 'triangle', gain: 0.06, delay: 0.08, bus: 'sfx' });
}

function triggerHurtSfx() {
  playTone({ frequency: 130, duration: 0.12, type: 'sawtooth', gain: 0.09, bus: 'sfx' });
  playNoise({ duration: 0.09, gain: 0.04 });
}

function triggerPoopSfx() {
  playNoise({ duration: 0.11, gain: 0.03, bus: 'sfx' });
}

function triggerBossShotSfx() {
  playTone({ frequency: 220, duration: 0.12, type: 'triangle', gain: 0.05, bus: 'sfx', decay: 0.09 });
}

function triggerVictorySfx() {
  [260, 293, 349, 392, 523].forEach((note, index) => {
    playTone({ frequency: note, duration: 0.12, type: 'triangle', gain: 0.06, delay: index * 0.08, bus: 'sfx' });
  });
}

function stopMusic() {
  audioEngine.musicEnabled = false;
}

function clearPressed() {
  keyPressed.clear();
}

window.addEventListener('keydown', (event) => {
  const code = event.code;
  if (!(code in keyState)) return;

  event.preventDefault();
  if (!keyState[code]) setPressed(code);
  keyState[code] = true;
});

window.addEventListener('keyup', (event) => {
  const code = event.code;
  if (!(code in keyState)) return;
  keyState[code] = false;
});

const state = {
  mode: 'menu',
  worldIndex: 0,
  score: 0,
  lives: 3,
  rescued: false,
  autoRun: false,
  dialogue: null,
  dialogueTime: 0,
  cameraX: 0,
  time: 0,
  player: {
    x: 150,
    y: 280,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    doubleJumped: false,
    idleTimer: 0,
    poopCooldown: 0,
    headbuttCd: 0,
    invuln: 0,
  },
  platforms: [],
  breakables: [],
  enemies: [],
  rescueCorgi: null,
  rescueTaken: false,
  boss: null,
  bossBullets: [],
  vfx: [],
  worldName: '',
  soundtrack: {
    cue: '',
    cueTimer: 0,
    phrase: 0,
    phraseTimer: 1.7,
    beat: 0,
    worldTrack: 0,
  },
};

function createWorld(index) {
  const b = worldBlueprints[index];
  state.worldIndex = index;
  state.worldName = b.name;
  state.platforms = b.platforms.map((p) => ({ ...p }));
  state.platforms.push({ x: 0, y: FLOOR_Y, w: b.length, h: 120, isGround: true });
  state.breakables = b.breakables.map((p) => ({ ...p, hp: p.hp }));
  state.enemies = b.enemies.map((e) => ({ ...e }));

  state.rescueCorgi = b.rescue ? { ...b.rescue, taken: false, type: 'rescue' } : null;
  state.rescueTaken = false;
  state.boss = b.boss
    ? {
      ...b.boss,
      hp: b.boss.hp,
      maxHp: b.boss.hp,
      invuln: 0,
      shootTimer: b.boss.shootTimer,
    }
    : null;
  state.bossBullets = [];
  state.autoZones = b.autoZones;
  state.worldLength = b.length;
  state.soundtrack.worldTrack = Math.min(index, SOUNDTRACK_TRACKS.length - 1);
  state.soundtrack.phrase = 0;
  state.soundtrack.phraseTimer = 1.2;
  state.soundtrack.beat = 0;
  state.soundtrack.cue = '';
  state.soundtrack.cueTimer = 0;
  audioEngine.musicStep = index * 3;
  audioEngine.musicTimer = 0;
  const track = SOUNDTRACK_TRACKS[state.soundtrack.worldTrack] || SOUNDTRACK_TRACKS[0];
  setSoundtrackCue(`${track.title}: ${track.vibe}`, 1.2);
}

function resetPlayerAndRun() {
  state.player.x = 140;
  state.player.y = FLOOR_Y - PLAYER_H - 2;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.onGround = false;
  state.player.facing = 1;
  state.player.doubleJumped = false;
  state.player.idleTimer = 0;
  state.player.poopCooldown = 0;
  state.player.headbuttCd = 0;
  state.player.invuln = 0;
  state.cameraX = 0;
}

function beginRun() {
  createWorld(0);
  resetPlayerAndRun();
  primeAudio();
  state.mode = 'play';
  state.score = 0;
  state.lives = 3;
  state.rescued = false;
  state.vfx = [];
  state.time = 0;
  audioEngine.musicStep = 0;
  audioEngine.musicTimer = 0;
  state.dialogue = {
    text: 'Buddy: "BARK! Another hero. No. Another corgi emergency."',
    t: 2.2,
    color: '#f4f1dd',
  };
  hideStartButton();
}

function nextWorld() {
  if (state.worldIndex === worldBlueprints.length - 1) return;
  const nextIndex = state.worldIndex + 1;
  createWorld(nextIndex);
  state.player.x = 140;
  state.player.y = 250;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.facing = 1;
  state.player.doubleJumped = false;
  state.cameraX = 0;
  state.autoRun = false;
  if (nextIndex === 3) {
    say('BUDDY: "The cat is in this world. He smells suspiciously like fish and regrets."', '#ffd56b', 3.6);
  } else {
    say(`Enter ${worldBlueprints[nextIndex].name}, buddy. Keep running.`, '#d6d6d6', 2.6);
  }
}

function hideStartButton() {
  startButton.style.display = 'none';
}

function showStartButton(text) {
  startButton.style.display = 'block';
  startButton.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function say(text, color = '#f4f1dd', t = 1.8) {
  state.dialogue = { text, color, t };
  state.dialogueTime = 0;
}

function setSoundtrackCue(text, duration = 1.2) {
  state.soundtrack.cue = text;
  state.soundtrack.cueTimer = duration;
}

function updateSoundtrack(dt) {
  const track = SOUNDTRACK_TRACKS[state.worldIndex] || SOUNDTRACK_TRACKS[0];
  state.soundtrack.worldTrack = Math.min(state.worldIndex, SOUNDTRACK_TRACKS.length - 1);
  state.soundtrack.beat = (state.soundtrack.beat + dt * 7.5) % 8;

  state.soundtrack.phraseTimer -= dt;
  if (state.soundtrack.phraseTimer <= 0) {
    state.soundtrack.phraseTimer = 2.2;
    state.soundtrack.phrase = (state.soundtrack.phrase + 1) % track.phrases.length;
    setSoundtrackCue(track.phrases[state.soundtrack.phrase], 0.7);
  }

  if (state.soundtrack.cueTimer > 0) {
    state.soundtrack.cueTimer -= dt;
    if (state.soundtrack.cueTimer < 0) state.soundtrack.cueTimer = 0;
  }
}

function damagePlayer(source = 'snare', amount = 1, sourceX = null) {
  if (state.player.invuln > 0 || state.mode !== 'play') return;
  state.lives -= amount;
  state.lives = Math.max(0, state.lives);
  state.player.invuln = 1.2;
  const hitFromLeft = sourceX ? state.player.x + PLAYER_W / 2 < sourceX : state.player.facing > 0;
  state.player.vx = hitFromLeft ? -260 : 260;
  state.player.vy = -360;
  state.player.facing = hitFromLeft ? 1 : -1;
  state.player.onGround = false;
  triggerHurtSfx();
  say('BUDDY: "GRRRRL! That still hurts!"', '#ff4f4f', 1.6);
  setSoundtrackCue('SFX: CRUNCH ON BONES', 0.45);
  if (state.lives <= 0) {
    state.mode = 'gameover';
    say('Mission interrupted. Buddy needs a nap.', '#ff8e8e', 999);
    showStartButton('Try Again');
    stopMusic();
  }
}

function gainRescue() {
  state.rescueTaken = true;
  state.rescued = true;
  state.score += 500;
  triggerRescueSfx();
  say('Rescue corgi: "ARF! Thank you, Buddy!"', '#9ef39e', 2.8);
}

function makePoop() {
  triggerPoopSfx();
  state.vfx.push({
    type: 'poop',
    x: state.player.x + PLAYER_W / 2 - 10,
    y: state.player.y + PLAYER_H + 2,
    w: 18,
    h: 14,
    t: 2.1,
  });
  say('BUDDY: "...eek."', '#d0c3a4', 1.2);
}

function canMoveLeft() {
  return keyState.KeyA || keyState.ArrowLeft;
}

function canMoveRight() {
  return keyState.KeyD || keyState.ArrowRight;
}

function canJump() {
  return keyState.Space || keyState.KeyW;
}

function jumpRequest() {
  return keyPressed.has('Space') || keyPressed.has('KeyW');
}

function headButtRequest() {
  return keyPressed.has('KeyE');
}

function doHeadButt(direction) {
  triggerHeadButtSfx();
  let struck = false;
  say('BUDDY: "OOOH YEAH!"', '#ffda8a', 1.1);
  setSoundtrackCue('SFX: COACH-STYLE BUMPER', 0.45);

  const hitLine = rect(
    direction > 0 ? state.player.x + PLAYER_W : state.player.x - 34,
    state.player.y + 4,
    34,
    PLAYER_H - 10,
  );

  for (let i = state.breakables.length - 1; i >= 0; i--) {
    const wall = state.breakables[i];
    if (!intersects(hitLine, wall)) continue;
    wall.hp -= BREAKABLE_HEADBUTT_DAMAGE;
    if (wall.hp <= 0) {
      state.breakables.splice(i, 1);
      state.score += 30;
      triggerBreakSfx();
      state.vfx.push({ type: 'break', x: wall.x, y: wall.y, w: wall.w, h: wall.h, t: 0.45 });
      say('BUDDY: "Wall says bye-bye."', '#d6bd7b', 1.2);
      state.player.vx += direction * 45;
      return;
    }
    state.vfx.push({ type: 'scratch', x: wall.x, y: wall.y, w: wall.w, h: wall.h, t: 0.4 });
    struck = true;
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    if (!intersects(hitLine, enemy)) continue;
    enemy.hp = (enemy.hp || 1) - ENEMY_HEADBUTT_DAMAGE;
    state.score += HEAD_BUTT_SCORE / 2;
    state.vfx.push({ type: 'impact', x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h, t: 0.35 });
    if (enemy.hp <= 0) {
      state.enemies.splice(i, 1);
      triggerEnemyStompSfx();
      state.vfx.push({ type: 'dust', x: enemy.x, y: enemy.y + enemy.h, w: enemy.w, h: 6, t: 0.5 });
      say('BUDDY: "BARK! Too close, buddy."', '#d6f6d0', 0.9);
      state.score += HEAD_BUTT_SCORE;
    } else {
      say('BUDDY: "Head-butt check. He did a number."', '#d6bd7b', 1.0);
    }
    state.player.vx += direction * 35;
    return;
  }

  if (!struck && state.boss && state.boss.hp > 0 && intersects(hitLine, state.boss)) {
    state.boss.hp -= BOSS_HEADBUTT_DAMAGE;
    triggerBossHitSfx();
    state.boss.invuln = HEADBUTT_BOSS_INVULN;
    state.score += HEAD_BUTT_SCORE;
    if (state.boss.hp < 0) state.boss.hp = 0;
    say('BUDDY: "GRRRRL! Catfuse unlocked."', '#ffd56b', 1.2);
    setSoundtrackCue('SFX: CATFUSE CHUNK', 0.8);
    state.vfx.push({ type: 'impact', x: state.boss.x + state.boss.w / 2, y: state.boss.y + 18, w: 28, h: 18, t: 0.35 });
    return;
  }

  state.vfx.push({ type: 'butt', x: direction > 0 ? hitLine.x : hitLine.x + 10, y: state.player.y + 14, w: 10, h: 8, t: 0.35 });
}

function applyHorizontalCollision(entity) {
  const playerRect = {
    x: entity.x,
    y: entity.y,
    w: PLAYER_W,
    h: PLAYER_H,
  };

  for (const solid of [...state.platforms.filter((p) => !p.isGround), ...state.breakables]) {
    if (!intersects(playerRect, solid)) continue;
    if (entity.vx > 0) {
      playerRect.x = solid.x - PLAYER_W;
      entity.x = playerRect.x;
      entity.vx = 0;
      if (solid.hp && solid.hp > 0) {
        entity.x -= 1;
      }
      continue;
    }
    if (entity.vx < 0) {
      playerRect.x = solid.x + solid.w;
      entity.x = playerRect.x;
      entity.vx = 0;
      continue;
    }
  }

  entity.x = playerRect.x;
}

function applyVerticalCollision(entity) {
  const playerRect = {
    x: entity.x,
    y: entity.y,
    w: PLAYER_W,
    h: PLAYER_H,
  };

  entity.onGround = false;

  for (const solid of [...state.platforms, ...state.breakables]) {
    if (!intersects(playerRect, solid)) continue;

    if (entity.vy > 0) {
      playerRect.y = solid.y - PLAYER_H;
      entity.y = playerRect.y;
      entity.vy = 0;
      entity.onGround = true;
      entity.doubleJumped = false;
      continue;
    }

    if (entity.vy < 0) {
      playerRect.y = solid.y + solid.h;
      entity.y = playerRect.y;
      entity.vy = 0;
      continue;
    }
  }

  entity.y = playerRect.y;
}

function updateWorldCollisionAndMovement(dt) {
  state.autoRun = state.autoZones.some((zone) => state.player.x >= zone.start && state.player.x <= zone.end);
  const move = (canMoveLeft() ? -1 : 0) + (canMoveRight() ? 1 : 0);
  let desiredVx = 0;

  if (state.autoRun) {
    if (move < 0) {
      desiredVx = -WALK_SPEED;
    } else if (move > 0) {
      desiredVx = RUN_SPEED + 40;
    } else {
      desiredVx = RUN_SPEED;
    }
  } else {
    desiredVx = move * WALK_SPEED;
  }

  state.player.vx += (desiredVx - state.player.vx) * Math.min(1, 16 * dt);

  if (state.player.vx > 0.2) state.player.facing = 1;
  if (state.player.vx < -0.2) state.player.facing = -1;

  if (jumpRequest()) {
    if (state.player.onGround) {
      state.player.vy = JUMP_VELOCITY;
      state.player.onGround = false;
      state.player.doubleJumped = false;
      triggerJumpSfx(false);
      say('BUDDY: "ARF!"', '#f7f4e3', 0.8);
    } else if (!state.player.doubleJumped) {
      state.player.vy = DOUBLE_JUMP_VELOCITY;
      state.player.doubleJumped = true;
      triggerJumpSfx(true);
      say('BUDDY: "WOOF! Double trouble."', '#f7f4e3', 0.8);
    }
  }

  if (headButtRequest() && state.player.headbuttCd <= 0) {
    state.player.headbuttCd = HEAD_BUTT_COOLDOWN;
    doHeadButt(state.player.facing);
    state.player.vx += state.player.facing * HEAD_BUTT_IMPULSE;
  }

  if (state.player.headbuttCd > 0) {
    state.player.headbuttCd -= dt;
  }

  if (state.player.invuln > 0) state.player.invuln -= dt;
  if (state.player.poopCooldown > 0) state.player.poopCooldown -= dt;

  state.player.vy += GRAVITY * dt;
  state.player.vy = Math.min(MAX_FALL_SPEED, state.player.vy);

  state.player.x += state.player.vx * dt;
  state.player.x = clamp(state.player.x, 0, state.worldLength - PLAYER_W - 1);
  applyHorizontalCollision(state.player);

  state.player.y += state.player.vy * dt;
  applyVerticalCollision(state.player);

  const controlsUsed = canMoveLeft() || canMoveRight() || canJump() || headButtRequest();

  if (!controlsUsed && Math.abs(state.player.vx) < 20 && Math.abs(state.player.vy) < 20 && !state.autoRun) {
    state.player.idleTimer += dt;
    if (state.player.idleTimer >= IDLE_POOP_INTERVAL && state.player.poopCooldown <= 0) {
      state.player.idleTimer = 0;
      state.player.poopCooldown = 0.9;
      makePoop();
    }
  } else {
    state.player.idleTimer = 0;
  }

  if (state.player.y > FLOOR_Y + 160) {
    damagePlayer('fall');
    resetPlayerAndRun();
    if (state.mode === 'play') {
      state.player.x = state.worldLength * 0.02;
      state.player.y = 260;
      state.player.vy = 0;
    }
  }

  const inputInAuto = canMoveLeft() || canMoveRight() || canJump() || headButtRequest();
  if (!inputInAuto && state.autoRun && !controlsUsed) {
    state.vfx.push({ type: 'boost', x: state.player.x, y: state.player.y + 22, w: 6, h: 8, t: 0.35 });
  }

  state.vfx = state.vfx.filter((effect) => {
    effect.t -= dt;
    return effect.t > 0;
  });

  // camera keeps Buddy visible
  state.cameraX = clamp(state.player.x - WORLD_VIEW_WIDTH * 0.33, 0, state.worldLength - WORLD_VIEW_WIDTH);
}

function updateEnemies(dt) {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    e.x += e.speed * e.dir * dt;
    if (e.x <= e.minX || e.x >= e.maxX) e.dir *= -1;

    const enemyRect = { x: e.x, y: e.y, w: e.w, h: e.h };
    const playerRect = {
      x: state.player.x,
      y: state.player.y,
      w: PLAYER_W,
      h: PLAYER_H,
    };

    if (intersects(enemyRect, playerRect)) {
      const playerPrevBottom = state.player.y + PLAYER_H + state.player.vy * dt;
      if (state.player.vy > 150 && playerPrevBottom <= e.y + 8) {
        state.player.vy = ENEMY_STOMP_BOUNCE;
        e.hp = (e.hp || 1) - 1;
        state.score += STOMP_SCORE;
        triggerEnemyStompSfx();
        say('BUDDY: "BARK! That\'s the way."', '#f0f0aa', 1);
        if (e.hp <= 0) {
          state.enemies.splice(i, 1);
          state.vfx.push({ type: 'dust', x: e.x, y: e.y + e.h, w: e.w, h: 6, t: 0.5 });
        }
        continue;
      }

      damagePlayer('enemy', ENEMY_CONTACT_DAMAGE, e.x + e.w / 2);
    }

    if (e.type === 'sawblade') {
      state.vfx.push({ type: 'sawTrail', x: e.x + e.w / 2, y: e.y + e.h / 2, w: 6, h: 4, t: 0.08 });
    }
  }
}

function updateBoss(dt) {
  const boss = state.boss;
  if (!boss || boss.hp <= 0) return;

  boss.x += boss.speed * boss.dir * dt;
  if (boss.x <= boss.minX || boss.x >= boss.maxX) {
    boss.dir *= -1;
  }

  const dx = (state.player.x - boss.x) * 0.03;
  boss.y += clamp(dx, -15, 15) * dt * 5;
  boss.y = clamp(boss.y, 150, 260);

  if (boss.invuln > 0) boss.invuln -= dt;

  const hitLine = rect(state.player.x, state.player.y, PLAYER_W, PLAYER_H);
  if (intersects(hitLine, boss) && boss.invuln <= 0) {
    if (state.player.vy > 120 && state.player.y + PLAYER_H < boss.y + 16) {
      state.player.vy = ENEMY_STOMP_BOUNCE;
      state.score += BOSS_HIT_SCORE;
      boss.hp -= BOSS_HEADBUTT_DAMAGE;
      triggerBossHitSfx();
      boss.invuln = HEADBUTT_BOSS_INVULN;
      say('BUDDY: "GRRRRL! Catnip is not for him!"', '#ffca75', 1.2);
      setSoundtrackCue('SFX: CATFUSE CHUNK', 0.8);
      return;
    }
    damagePlayer('cat', BOSS_CONTACT_DAMAGE, boss.x + boss.w / 2);
  }

  boss.shootTimer -= dt;
  if (boss.shootTimer <= 0 && boss.hp > 0) {
    boss.shootTimer = BOSS_ATTACK_INTERVAL;
    triggerBossShotSfx();
    const dir = state.player.x >= boss.x ? 1 : -1;
    state.bossBullets.push({
      x: boss.x + boss.w / 2,
      y: boss.y + boss.h * 0.52,
      vx: dir * 320,
      vy: -35,
      w: 12,
      h: 12,
      t: 5,
    });
  }

  for (let i = state.bossBullets.length - 1; i >= 0; i--) {
    const b = state.bossBullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy += 12 * dt * 20;
    b.t -= dt;

    if (intersects(b, { x: state.player.x, y: state.player.y, w: PLAYER_W, h: PLAYER_H })) {
      damagePlayer('pill', BOSS_BULLET_DAMAGE, b.vx > 0 ? b.x : b.x + b.w);
      state.bossBullets.splice(i, 1);
      continue;
    }
    if (b.t <= 0 || b.x < 0 || b.x > state.worldLength || b.y > FLOOR_Y + 60) {
      state.bossBullets.splice(i, 1);
    }
  }
}

function handleRescue() {
  if (!state.rescueCorgi || state.rescueCorgi.taken) return;
  const nearX = Math.abs(state.player.x - state.rescueCorgi.x) < 60;
  const nearY = Math.abs((state.player.y + PLAYER_H) - state.rescueCorgi.y) < 60;
  if (nearX && nearY) {
    state.rescueCorgi.taken = true;
    gainRescue();
  }
}

function tryProgressWorld() {
  const gateLocked = state.worldIndex === 2 && !state.rescued;
  const nearGate = state.player.x > state.worldLength - 220;

  if (nearGate) {
    if (gateLocked) {
      state.player.x = state.worldLength - 230;
      say('Buddy: "Locked gate! Rescue the brown-and-white corgi first."', '#c7f7ff', 1.5);
      return;
    }
    nextWorld();
  }
}

function updateDialogue(dt) {
  if (!state.dialogue) return;
  state.dialogueTime += dt;
  if (state.dialogueTime >= state.dialogue.t) {
    state.dialogue = null;
    state.dialogueTime = 0;
  }
}

function update(dt) {
  if (state.mode !== 'play') return;

  state.time += dt;
  updateMusic(dt);
  updateSoundtrack(dt);
  updateWorldCollisionAndMovement(dt);
  updateEnemies(dt);
  updateBoss(dt);
  handleRescue();
  tryProgressWorld();
  updateDialogue(dt);

  if (state.boss && state.boss.hp <= 0 && state.worldIndex === 3) {
    state.mode = 'win';
    state.vfx.push({ type: 'victory', x: state.player.x + 10, y: state.player.y - 40, w: 24, h: 16, t: 2.5 });
    triggerVictorySfx();
    say('EVIL CAT: "NO! My potion formula!"', '#f2b4b4', 2.8);
    say('BUDDY: "You lost, fishy tyrant."', '#9ef3a2', 3);
    showStartButton('Play Again');
    stopMusic();
  }

  clearPressed();
}

function drawBackground(world, sx) {
  const g = ctx.createLinearGradient(0, 0, 0, WORLD_VIEW_HEIGHT);
  g.addColorStop(0, world.palette.skyTop);
  g.addColorStop(1, world.palette.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);

  for (let i = -2; i < 18; i++) {
    const x = ((i * 210) - (sx * 0.10) % 210);
    const height = 84 + ((i * 37) % 56);
    const hOff = 18 + ((i * 11) % 22);
    const skylineY = WORLD_VIEW_HEIGHT - 190 - hOff;
    ctx.fillStyle = world.palette.mid2;
    ctx.fillRect(x, skylineY, 206, 24 + ((i * 13) % 20));
    ctx.fillStyle = world.palette.mid;
    ctx.fillRect(x + 8, skylineY + 4, 190, 6 + ((i * 19) % 16));

    for (let j = 0; j < 8; j++) {
      if ((i + j) % 3 === 0) {
        const w = 12 + ((i + j) % 4);
        const h = 6 + (((i * 2 + j) % 4));
        const wx = x + 18 + ((j * 23) % 150);
        const wy = WORLD_VIEW_HEIGHT - 182 - (hOff % 12);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(wx, wy, w, h);
      }
    }

    const glow = ((sx * 0.03 + i * 17) % WORLD_VIEW_WIDTH) / WORLD_VIEW_WIDTH;
    if (glow > 0.15 && glow < 0.45) {
      const tx = x + 52;
      const ty = skylineY - height * 0.33;
      ctx.fillStyle = `rgba(250, 225, 150, ${0.05 + (glow * 0.06)})`;
      ctx.fillRect(tx, ty, 14, height * 0.5);
      ctx.fillRect(tx + 4, ty + 2, 4, 2);
    }

    if (world.palette.accent) {
      const poleX = x + 158;
      const poleY = skylineY - height;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(poleX, poleY, 4, height + 4);
      ctx.fillStyle = world.palette.accent;
      ctx.fillRect(poleX - 4, poleY + 16, 12, 8);
    }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = -5; i < 35; i++) {
    const x = ((i * 44) - (sx * 0.1) % 44);
    ctx.fillRect(x, 26 + ((i * 17) % 9), 1, 1);
    ctx.fillRect(x, 78 + ((i * 23) % 5), 1, 1);
  }

  if (state.worldIndex === 1) {
    for (let i = -1; i < 10; i++) {
      const x = ((i * 270) - (sx * 0.28) % 270) + 42;
      const radius = 17 + ((i * 4) % 8);
      ctx.strokeStyle = 'rgba(210, 190, 150, 0.16)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x + 20, WORLD_VIEW_HEIGHT - 196, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(80, 80, 80, 0.22)';
      ctx.fillRect(x, WORLD_VIEW_HEIGHT - 190, 44, 14);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(x + 10, WORLD_VIEW_HEIGHT - 188, 2, 8);
      ctx.fillRect(x + 22, WORLD_VIEW_HEIGHT - 188, 2, 8);
    }
  }

  if (state.worldIndex === 3) {
    const haloX = WORLD_VIEW_WIDTH / 2 - (sx * 0.03) % 260;
    for (let i = 0; i < 3; i++) {
      const x = ((haloX + i * 180) % (WORLD_VIEW_WIDTH + 200)) - 120;
      ctx.fillStyle = 'rgba(70, 45, 35, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x, WORLD_VIEW_HEIGHT - 200);
      ctx.lineTo(x + 88, WORLD_VIEW_HEIGHT - 130);
      ctx.lineTo(x + 172, WORLD_VIEW_HEIGHT - 200);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 215, 130, 0.12)';
      ctx.fillRect(x + 54, WORLD_VIEW_HEIGHT - 166, 44, 6);
    }
  }
}

function drawPlatforms() {
  const world = worldBlueprints[state.worldIndex];

  state.platforms.forEach((p) => {
    const x = p.x - state.cameraX;
    const shimmer = (Math.sin((x + state.time) * 0.03) + 1) / 2;
    const shade = Math.round(2 + shimmer * 8);
    const edge = shade.toString(16).padStart(2, '0');
    const shadeColor = `#${edge}${edge}${edge}`;

    ctx.fillStyle = world.palette.floor;
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = shadeColor;
    ctx.fillRect(x + 4, p.y + 3, p.w - 8, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(x, p.y, p.w, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x, p.y + p.h - 3, p.w, 3);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.strokeRect(x, p.y, p.w, p.h);
  });

  state.breakables.forEach((w) => {
    const x = w.x - state.cameraX;
    const hpRatio = w.hp / 3;
    const hue = 170 + Math.round(90 * (1 - hpRatio));
    ctx.fillStyle = `rgb(${hue}, ${hue}, ${hue})`;
    ctx.fillRect(x, w.y, w.w, w.h);
    ctx.strokeStyle = '#111';
    ctx.strokeRect(x, w.y, w.w, w.h);
  });

  if (state.rescueCorgi && !state.rescueCorgi.taken) {
    drawCorgi(state.rescueCorgi.x - state.cameraX, state.rescueCorgi.y, 28, 28, {
      body: '#8c5a35',
      bodyDark: '#3b220f',
      face: '#e8d1b9',
      ear: '#c27c3d',
      collar: '#b34a3b',
    });
  }
}

function drawCorgi(x, y, w, h, palette) {
  const pawWobble = Math.sin(state.time * 4 + x * 0.05) * 1;

  ctx.fillStyle = palette.body;
  ctx.fillRect(x + 1, y + 6, w - 2, h - 12);
  ctx.fillStyle = palette.bodyDark;
  ctx.fillRect(x + 1, y + h - 10, w - 2, 8);
  ctx.fillStyle = palette.body;
  ctx.fillRect(x + 10, y + 6, w - 20, 7);

  ctx.fillStyle = palette.face;
  ctx.fillRect(x + 8, y + 10, w - 16, h - 22);

  ctx.fillStyle = palette.ear;
  ctx.fillRect(x + 1, y + 2, 8, 8);
  ctx.fillRect(x + w - 9, y + 2, 8, 8);
  ctx.fillRect(x + 2, y + 2 + pawWobble, 4, 2);
  ctx.fillRect(x + w - 6, y + 2 - pawWobble, 4, 2);

  ctx.fillStyle = '#111';
  ctx.fillRect(x + 4, y + 11, 3, 2);
  ctx.fillRect(x + w - 7, y + 11, 3, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 9 + (pawWobble > 0 ? 0.5 : 0), y + 18, 4, 3);
  ctx.fillRect(x + w - 13 - (pawWobble > 0 ? 0.5 : 0), y + 18, 4, 3);

  ctx.fillStyle = palette.collar || '#fff';
  ctx.fillRect(x + 6, y + h - 7, w - 12, 3);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(x + w - 20, y + 20, 3, 2);
  ctx.fillRect(x + 14, y + 20, 3, 2);

  if (palette.tail) {
    ctx.fillStyle = palette.tail;
    ctx.fillRect(x - 2, y + 16 + pawWobble, 5, 8);
  }
}

function drawHero() {
  const x = state.player.x - state.cameraX;
  const y = state.player.y;
  const bodyPalette = {
    body: '#0a0a0a',
    bodyDark: '#222',
    face: '#f6f3eb',
    ear: '#101010',
    collar: '#3f3f3f',
    tail: '#2a2a2a',
  };

  drawCorgi(x, y, PLAYER_W, PLAYER_H, bodyPalette);

  ctx.fillStyle = '#efefef';
  ctx.fillRect(x + 9, y + 16, 4, 3);
  ctx.fillRect(x + 21, y + 16, 4, 3);

  if (state.player.invuln > 0) {
    ctx.strokeStyle = '#ffd66b';
    ctx.strokeRect(x - 2, y - 2, PLAYER_W + 4, PLAYER_H + 4);
  }

  ctx.fillStyle = '#333';
  if (state.player.facing < 0) {
    ctx.fillRect(x + 1, y + 3, 5, 5);
  } else {
    ctx.fillRect(x + PLAYER_W - 6, y + 3, 5, 5);
  }

  if (state.player.onGround && Math.abs(state.player.vx) > 35 && !state.autoRun) {
    ctx.fillStyle = '#444';
    ctx.fillRect(x - 1, y + PLAYER_H - 1, PLAYER_W + 2, 2);
  }
}

function drawBoss() {
  if (!state.boss || state.boss.hp <= 0) return;

  const x = state.boss.x - state.cameraX;
  const y = state.boss.y;
  const pulse = 1 + Math.sin(state.time * 6 + state.boss.x * 0.015) * 0.02;

  const color = state.player.invuln > 0 ? '#5f4b40' : '#111';
  const eyes = state.player.invuln > 0 ? '#d9b57d' : '#ffe8b8';
  ctx.fillStyle = color;
  ctx.fillRect(x, y, state.boss.w, state.boss.h);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.05 + i * 0.02})`;
    ctx.fillRect(x + 3 + i * 5, y + 8, state.boss.w - 6 - i * 8, 2);
  }

  ctx.fillStyle = '#d2a76e';
  ctx.fillRect(x + 10, y + 8, 14, 8);
  ctx.fillRect(x + state.boss.w - 24, y + 8, 14, 8);
  ctx.fillRect(x + state.boss.w / 2 - 7, y + 5, 14, 6);

  ctx.fillStyle = eyes;
  ctx.fillRect(x + 16, y + 22, 6, 4);
  ctx.fillRect(x + state.boss.w - 23, y + 22, 6, 4);

  ctx.fillStyle = '#2f2f2f';
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 42);
  ctx.lineTo(x + 22, y + 42 + 6 * pulse);
  ctx.lineTo(x + 44, y + 42);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2f2f2f';
  ctx.beginPath();
  ctx.moveTo(x + state.boss.w - 8, y + 42);
  ctx.lineTo(x + state.boss.w - 22, y + 42 + 6 * pulse);
  ctx.lineTo(x + state.boss.w - 44, y + 42);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.fillRect(x + state.boss.w / 2 - 12, y + 24, 24, 12);

  const hpBarW = state.boss.w;
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(x, y - 10, hpBarW, 6);
  ctx.fillStyle = '#e24c4c';
  ctx.fillRect(x, y - 10, (hpBarW * (state.boss.hp / state.boss.maxHp)), 6);

  ctx.fillStyle = '#f5f5f5';
  ctx.fillText('Evil Cat', x + 4, y - 16);
}

function drawVfx() {
  for (const fx of state.vfx) {
    const x = fx.x - state.cameraX;
    const y = fx.y;
    if (fx.type === 'poop') {
      ctx.fillStyle = '#5b4728';
      ctx.fillRect(x, y, fx.w, fx.h);
      continue;
    }
    if (fx.type === 'impact') {
      ctx.strokeStyle = '#ffd27a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, fx.w, fx.h);
      continue;
    }
    if (fx.type === 'break') {
      ctx.fillStyle = '#7d6a4f';
      ctx.fillRect(x, y - 12, fx.w, 6);
      continue;
    }
    if (fx.type === 'scratch') {
      ctx.fillStyle = '#bdbdbd';
      ctx.fillRect(x, y - 6, fx.w, 4);
      continue;
    }
    if (fx.type === 'butt') {
      ctx.fillStyle = '#f4d68f';
      ctx.fillRect(x, y, fx.w, fx.h);
      continue;
    }
    if (fx.type === 'boost') {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x, y + 2, fx.w, fx.h);
      continue;
    }
    if (fx.type === 'sawTrail') {
      ctx.fillStyle = 'rgba(255,220,170,0.2)';
      ctx.fillRect(x, y, fx.w, fx.h);
      continue;
    }
    if (fx.type === 'dust') {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(x + i * 5, y + (i % 2), 3, 3);
      }
    }
    if (fx.type === 'victory') {
      ctx.fillStyle = '#fef6bd';
      ctx.fillRect(x, y, fx.w, fx.h);
      continue;
    }
    if (fx.type === 'music') {
      ctx.fillStyle = '#ffd57a';
      ctx.fillRect(x, y, fx.w, fx.h);
    }
  }
}

function drawHUD() {
  ctx.fillStyle = '#f2efe1';
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillText(`WORLD: ${state.worldName}`, 10, 18);
  ctx.fillText(`SCORE: ${state.score}`, 10, 34);
  ctx.fillText(`LIVES: ${state.lives}`, 10, 50);
  ctx.fillText(`POOH: ${state.rescued ? 'RESCUED' : 'MISSING'}`, 10, 66);

  if (state.mode === 'play' && state.boss && state.boss.hp > 0 && state.worldIndex === 3) {
    ctx.fillText(`CAT HP: ${state.boss.hp}`, WORLD_VIEW_WIDTH - 130, 20);
  }

  if (audioEngine.musicEnabled) {
    ctx.fillStyle = '#f9e8b8';
    ctx.fillText('BGM: ACTIVE', WORLD_VIEW_WIDTH - 184, 60);
  }

  if (state.autoRun) {
    ctx.fillStyle = '#f9e8b8';
    ctx.fillText('AUTO-RUN PIPE MODE', WORLD_VIEW_WIDTH - 185, 44);
  }

  if (state.dialogue) {
    const text = state.dialogue.text;
    const x = WORLD_VIEW_WIDTH / 2 - 360;
    const y = WORLD_VIEW_HEIGHT - 56;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - 8, y - 4, 720, 28);
    ctx.fillStyle = state.dialogue.color;
    ctx.fillText(text, x, y + 12);
  }
}

function drawSoundtrackOverlay() {
  const track = SOUNDTRACK_TRACKS[Math.min(state.soundtrack.worldTrack, SOUNDTRACK_TRACKS.length - 1)] || SOUNDTRACK_TRACKS[0];
  const cueText = state.soundtrack.cueTimer > 0 ? state.soundtrack.cue : track.phrases[state.soundtrack.phrase];
  ctx.fillStyle = 'rgba(6,6,8,0.62)';
  ctx.fillRect(WORLD_VIEW_WIDTH - 330, 4, 324, 58);
  ctx.fillStyle = '#c7c4ab';
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.fillText(`TRACK ${state.soundtrack.worldTrack + 1}: ${track.title}`, WORLD_VIEW_WIDTH - 320, 20);
  ctx.fillStyle = '#f4f4d8';
  ctx.fillText(`BEAT ${state.soundtrack.beat.toFixed(1)}`, WORLD_VIEW_WIDTH - 320, 36);
  ctx.fillStyle = '#ffd56b';
  ctx.fillText(cueText, WORLD_VIEW_WIDTH - 320, 52);
}

function drawBossBullets() {
  for (const b of state.bossBullets) {
    const drift = Math.sin((state.time + b.x) * 0.15) * 1.8;
    ctx.fillStyle = '#d96b55';
    ctx.fillRect(b.x - state.cameraX, b.y, b.w, b.h);
    ctx.fillStyle = 'rgba(255, 238, 150, 0.4)';
    ctx.fillRect(b.x - state.cameraX - 1, b.y - 2 + drift, b.w + 2, 1);
    ctx.fillRect(b.x - state.cameraX + 2, b.y + b.h - 1, b.w - 2, 1);
  }
}

function render() {
  const world = worldBlueprints[state.worldIndex];
  const sx = state.cameraX;
  drawBackground(world, sx);

  drawPlatforms();
  drawHero();
  drawBoss();
  drawBossBullets();
  drawVfx();

  if (state.mode === 'play') {
    hud.style.opacity = 0;
    drawHUD();
    drawSoundtrackOverlay();
  } else {
    hud.style.opacity = 1;
    hud.textContent = `Mode: ${state.mode}`;
  }

  if (state.mode === 'menu') {
    ctx.fillStyle = 'rgba(6,6,8,0.76)';
    ctx.fillRect(0, 0, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);
    ctx.fillStyle = '#f7f3df';
    ctx.font = '32px "Press Start 2P", monospace';
    ctx.fillText('Buddy the Game', 190, 130);
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('Dark-noir 16-bit Platformer', 245, 170);
    ctx.fillText('Rescue the brown and white corgi before the cat drinks his life-potion', 80, 196);
    ctx.fillText('WASD to navigate. Space/Up to jump. Space twice for double jump.', 74, 225);
    ctx.fillText('E = HEAD-BUTT (OOOH YEAH).', 300, 250);
    ctx.fillText('When you idle, Buddy might... take a break.', 270, 275);
    ctx.fillText('Press F to toggle fullscreen', 300, 300);
  }

  if (state.mode === 'gameover') {
    ctx.fillStyle = 'rgba(19,0,0,0.72)';
    ctx.fillRect(0, 0, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);
    ctx.fillStyle = '#ffb3b3';
    ctx.font = '34px "Press Start 2P", monospace';
    ctx.fillText('GAME OVER', 320, 220);
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('The evil cat won this round. Try again with more flair.', 170, 270);
  }

  if (state.mode === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    ctx.fillRect(0, 0, WORLD_VIEW_WIDTH, WORLD_VIEW_HEIGHT);
    ctx.fillStyle = '#d3f7a1';
    ctx.font = '34px "Press Start 2P", monospace';
    ctx.fillText('BUDDY SAVED THE DAY', 160, 220);
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText('The cat potion is ruined. Corgi peace is restored.', 120, 270);
  }
}

function renderGameToText() {
  const visibleEntities = [];

  for (const e of state.enemies) {
    const inside = e.x + e.w > state.cameraX && e.x < state.cameraX + WORLD_VIEW_WIDTH;
    if (inside) {
      visibleEntities.push({ type: 'enemy', x: e.x, y: e.y, w: e.w, h: e.h });
    }
  }

  if (state.rescueCorgi && !state.rescueCorgi.taken) {
    visibleEntities.push({ type: 'rescue', x: state.rescueCorgi.x, y: state.rescueCorgi.y, w: state.rescueCorgi.w, h: state.rescueCorgi.h });
  }

  if (state.boss && state.boss.hp > 0) {
    visibleEntities.push({ type: 'boss', x: state.boss.x, y: state.boss.y, w: state.boss.w, h: state.boss.h, hp: state.boss.hp });
  }

  for (const p of state.platforms) {
    if (p.x + p.w > state.cameraX && p.x < state.cameraX + WORLD_VIEW_WIDTH + 80) {
      visibleEntities.push({ type: 'platform', x: p.x, y: p.y, w: p.w, h: p.h });
    }
  }

  return JSON.stringify({
    origin: 'top-left, +x right, +y down',
    mode: state.mode,
    world: state.worldIndex + 1,
    worldName: state.worldName,
    score: state.score,
    lives: state.lives,
    rescued: state.rescued,
    player: {
      x: Number(state.player.x.toFixed(1)),
      y: Number(state.player.y.toFixed(1)),
      vx: Number(state.player.vx.toFixed(1)),
      vy: Number(state.player.vy.toFixed(1)),
      onGround: state.player.onGround,
      facing: state.player.facing,
      autoRun: state.autoRun,
      idleTimer: Number(state.player.idleTimer.toFixed(2)),
      headbuttCd: Number(state.player.headbuttCd.toFixed(2)),
    },
    boss: state.boss ? {
      x: state.boss.x,
      y: state.boss.y,
      hp: state.boss.hp,
      maxHp: state.boss.maxHp,
      alive: state.boss.hp > 0,
    } : null,
    soundtrack: {
      worldTrack: state.soundtrack.worldTrack,
      beat: Number(state.soundtrack.beat.toFixed(2)),
      phrase: state.soundtrack.phrase,
      cue: state.soundtrack.cue,
      cueTimer: Number(state.soundtrack.cueTimer.toFixed(2)),
    },
    audio: {
      musicEnabled: audioEngine.musicEnabled,
      hasAudio: !!audioEngine.ctx,
    },
    cameraX: Number(state.cameraX.toFixed(1)),
    entities: visibleEntities,
  });
}

window.render_game_to_text = renderGameToText;

window.advanceTime = (ms) => {
  const dt = 1 / 60;
  const steps = Math.max(1, Math.round(ms / (1000 * dt)));
  for (let i = 0; i < steps; i++) {
    update(dt);
    render();
  }
};

function setCanvasScale() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const targetRatio = WORLD_VIEW_WIDTH / WORLD_VIEW_HEIGHT;
  const availRatio = viewportWidth / viewportHeight;

  if (availRatio > targetRatio) {
    canvas.style.height = `${Math.min(viewportHeight * 0.92, viewportHeight)}px`;
    canvas.style.width = `${Math.round(canvas.offsetHeight * targetRatio)}px`;
  } else {
    canvas.style.width = `${Math.min(viewportWidth * 0.96, viewportWidth)}px`;
    canvas.style.height = `${Math.round(canvas.offsetWidth / targetRatio)}px`;
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function gameStep() {
  update(1 / 60);
  render();
}

function gameLoop() {
  if (state.mode === 'play') gameStep();
  else {
    render();
  }
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyF') toggleFullscreen();
  if (event.code === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (state.mode === 'menu' && event.code === 'Enter') {
    beginRun();
  }
});

startButton.addEventListener('click', () => {
  beginRun();
});

window.addEventListener('resize', () => {
  setCanvasScale();
});

createWorld(0);
render();
setCanvasScale();
gameLoop();
showStartButton('Start BUDDY\'S QUEST');
