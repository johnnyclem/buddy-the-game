// Level definitions — 7 hand-crafted levels with distinct themes
// Each level defines: theme, platforms, hazards, enemies, collectibles layout

const LEVEL_DEFS = [
  // ── Level 1: Puppy Park ─────────────────────────────────────────────────────
  // Tutorial level — gentle platforms, no hazards, lots of bones
  {
    name: 'PUPPY PARK',
    theme: 'park',
    width: 4000,
    skyTop: '#4a90d9',
    skyBot: '#87ceeb',
    groundColor: '#2ecc40',
    dirtColor: '#7d4e2b',
    platformColor: '#8b7355',
    platformHi: '#a0896a',
    platformLo: '#6b5540',
    bgElements: 'trees',
    generate(rand) {
      const platforms = [
        { x: -200, y: GROUND_Y, w: 4400, h: 60, isGround: true },
      ];

      // Gentle, well-spaced floating platforms with easy jumps
      const defs = [
        { x: 300,  y: 400, w: 160 },
        { x: 520,  y: 370, w: 128 },
        { x: 740,  y: 340, w: 192 },
        { x: 1000, y: 380, w: 128 },
        { x: 1200, y: 350, w: 160 },
        { x: 1450, y: 320, w: 192 },
        { x: 1700, y: 360, w: 128 },
        { x: 1900, y: 390, w: 160 },
        { x: 2150, y: 340, w: 192 },
        { x: 2400, y: 370, w: 128 },
        { x: 2600, y: 400, w: 160 },
        { x: 2850, y: 350, w: 192 },
        { x: 3100, y: 380, w: 128 },
        { x: 3350, y: 340, w: 160 },
      ];
      for (const d of defs) {
        platforms.push({ x: d.x, y: d.y, w: d.w, h: TILE, isGround: false });
      }

      return { platforms, hazards: [], enemies: [], movingPlatforms: [] };
    },
  },

  // ── Level 2: Backyard Bash ──────────────────────────────────────────────────
  // Mud puddles slow you down, fence-like tall platforms to jump over
  {
    name: 'BACKYARD BASH',
    theme: 'backyard',
    width: 5000,
    skyTop: '#5b9bd5',
    skyBot: '#a8d8ea',
    groundColor: '#2ecc40',
    dirtColor: '#6b3f1e',
    platformColor: '#a0522d',
    platformHi: '#b8763e',
    platformLo: '#7a3c1a',
    bgElements: 'fences',
    generate(rand) {
      const platforms = [
        { x: -200, y: GROUND_Y, w: 5400, h: 60, isGround: true },
      ];

      const defs = [
        { x: 350,  y: 390, w: 128 },
        { x: 560,  y: 350, w: 160 },
        { x: 820,  y: 310, w: 128 },
        { x: 1050, y: 370, w: 192 },
        { x: 1350, y: 330, w: 128 },
        { x: 1580, y: 290, w: 160 },
        { x: 1850, y: 350, w: 192 },
        { x: 2100, y: 310, w: 128 },
        { x: 2400, y: 370, w: 160 },
        { x: 2650, y: 280, w: 192 },
        { x: 2950, y: 340, w: 128 },
        { x: 3200, y: 300, w: 160 },
        { x: 3500, y: 360, w: 192 },
        { x: 3800, y: 320, w: 128 },
        { x: 4100, y: 350, w: 160 },
        { x: 4400, y: 290, w: 128 },
      ];
      for (const d of defs) {
        platforms.push({ x: d.x, y: d.y, w: d.w, h: TILE, isGround: false });
      }

      // Mud puddles (slow zones on the ground)
      const hazards = [
        { x: 700,  y: GROUND_Y - 4, w: 120, h: 8, type: 'mud' },
        { x: 1500, y: GROUND_Y - 4, w: 150, h: 8, type: 'mud' },
        { x: 2300, y: GROUND_Y - 4, w: 100, h: 8, type: 'mud' },
        { x: 3100, y: GROUND_Y - 4, w: 130, h: 8, type: 'mud' },
        { x: 4000, y: GROUND_Y - 4, w: 140, h: 8, type: 'mud' },
      ];

      return { platforms, hazards, enemies: [], movingPlatforms: [] };
    },
  },

  // ── Level 3: Downtown Dash ──────────────────────────────────────────────────
  // Moving platforms, gaps in the ground, fire hydrant obstacles
  {
    name: 'DOWNTOWN DASH',
    theme: 'city',
    width: 5500,
    skyTop: '#2c3e50',
    skyBot: '#5d6d7e',
    groundColor: '#555555',
    dirtColor: '#3d3d3d',
    platformColor: '#7f8c8d',
    platformHi: '#95a5a6',
    platformLo: '#566573',
    bgElements: 'buildings',
    generate(rand) {
      // Ground with gaps (pits)
      const platforms = [
        { x: -200, y: GROUND_Y, w: 1200, h: 60, isGround: true },
        // gap 1: 1000-1160
        { x: 1160, y: GROUND_Y, w: 900, h: 60, isGround: true },
        // gap 2: 2060-2240
        { x: 2240, y: GROUND_Y, w: 1100, h: 60, isGround: true },
        // gap 3: 3340-3480
        { x: 3480, y: GROUND_Y, w: 800, h: 60, isGround: true },
        // gap 4: 4280-4440
        { x: 4440, y: GROUND_Y, w: 1260, h: 60, isGround: true },
      ];

      const defs = [
        { x: 400,  y: 380, w: 128 },
        { x: 700,  y: 340, w: 160 },
        { x: 1020, y: 360, w: 128 },  // over gap 1
        { x: 1300, y: 320, w: 160 },
        { x: 1600, y: 280, w: 128 },
        { x: 1900, y: 340, w: 160 },
        { x: 2100, y: 370, w: 128 },  // over gap 2
        { x: 2500, y: 310, w: 192 },
        { x: 2800, y: 350, w: 128 },
        { x: 3100, y: 290, w: 160 },
        { x: 3380, y: 350, w: 128 },  // over gap 3
        { x: 3700, y: 310, w: 160 },
        { x: 4000, y: 270, w: 128 },
        { x: 4320, y: 360, w: 128 },  // over gap 4
        { x: 4600, y: 320, w: 160 },
        { x: 4900, y: 350, w: 128 },
      ];
      for (const d of defs) {
        platforms.push({ x: d.x, y: d.y, w: d.w, h: TILE, isGround: false });
      }

      // Moving platforms over the gaps
      const movingPlatforms = [
        { x: 1040, y: 420, w: 96, h: TILE, minX: 1000, maxX: 1140, speed: 40, axis: 'x' },
        { x: 2100, y: 430, w: 96, h: TILE, minX: 2060, maxX: 2200, speed: 50, axis: 'x' },
        { x: 3380, y: 410, w: 96, h: TILE, minX: 3340, maxX: 3460, speed: 35, axis: 'x' },
        { x: 4320, y: 420, w: 96, h: TILE, minX: 4280, maxX: 4420, speed: 45, axis: 'x' },
      ];

      const hazards = [
        { x: 500,  y: GROUND_Y - 28, w: 20, h: 28, type: 'hydrant' },
        { x: 1400, y: GROUND_Y - 28, w: 20, h: 28, type: 'hydrant' },
        { x: 2600, y: GROUND_Y - 28, w: 20, h: 28, type: 'hydrant' },
        { x: 3600, y: GROUND_Y - 28, w: 20, h: 28, type: 'hydrant' },
        { x: 4700, y: GROUND_Y - 28, w: 20, h: 28, type: 'hydrant' },
      ];

      return { platforms, hazards, enemies: [], movingPlatforms };
    },
  },

  // ── Level 4: Spooky Forest ──────────────────────────────────────────────────
  // Dark theme, bats that swoop, crumbling platforms
  {
    name: 'SPOOKY FOREST',
    theme: 'forest',
    width: 5500,
    skyTop: '#0a0a1a',
    skyBot: '#1a1a3a',
    groundColor: '#1a4a1a',
    dirtColor: '#2a1a0a',
    platformColor: '#4a3a2a',
    platformHi: '#5a4a3a',
    platformLo: '#3a2a1a',
    bgElements: 'deadtrees',
    generate(rand) {
      const platforms = [
        { x: -200, y: GROUND_Y, w: 1400, h: 60, isGround: true },
        { x: 1600, y: GROUND_Y, w: 800, h: 60, isGround: true },
        { x: 2700, y: GROUND_Y, w: 600, h: 60, isGround: true },
        { x: 3500, y: GROUND_Y, w: 900, h: 60, isGround: true },
        { x: 4600, y: GROUND_Y, w: 1100, h: 60, isGround: true },
      ];

      const defs = [
        { x: 300,  y: 380, w: 128 },
        { x: 550,  y: 320, w: 96 },
        { x: 800,  y: 280, w: 128 },
        { x: 1050, y: 350, w: 96 },
        { x: 1300, y: 300, w: 128 },
        { x: 1480, y: 400, w: 96 },   // over gap
        { x: 1700, y: 340, w: 128 },
        { x: 1950, y: 280, w: 96 },
        { x: 2200, y: 350, w: 96, crumble: true },
        { x: 2450, y: 310, w: 96, crumble: true },
        { x: 2800, y: 360, w: 128 },
        { x: 3050, y: 300, w: 96, crumble: true },
        { x: 3250, y: 380, w: 96 },
        { x: 3600, y: 330, w: 128 },
        { x: 3900, y: 270, w: 96 },
        { x: 4150, y: 340, w: 96, crumble: true },
        { x: 4400, y: 390, w: 128 },
        { x: 4700, y: 320, w: 160 },
        { x: 5000, y: 360, w: 128 },
      ];
      for (const d of defs) {
        platforms.push({
          x: d.x, y: d.y, w: d.w, h: TILE, isGround: false,
          crumble: d.crumble || false, crumbleTimer: 0, crumbled: false,
        });
      }

      // Bats that patrol horizontally
      const enemies = [
        { x: 600,  y: 240, w: 24, h: 16, type: 'bat', minX: 500,  maxX: 800,  speed: 80, dir: 1 },
        { x: 1200, y: 220, w: 24, h: 16, type: 'bat', minX: 1100, maxX: 1400, speed: 90, dir: -1 },
        { x: 2000, y: 200, w: 24, h: 16, type: 'bat', minX: 1850, maxX: 2200, speed: 70, dir: 1 },
        { x: 2900, y: 230, w: 24, h: 16, type: 'bat', minX: 2750, maxX: 3100, speed: 85, dir: -1 },
        { x: 3800, y: 210, w: 24, h: 16, type: 'bat', minX: 3650, maxX: 4000, speed: 75, dir: 1 },
        { x: 4500, y: 250, w: 24, h: 16, type: 'bat', minX: 4350, maxX: 4700, speed: 95, dir: -1 },
      ];

      return { platforms, hazards: [], enemies, movingPlatforms: [] };
    },
  },

  // ── Level 5: Snowy Peaks ────────────────────────────────────────────────────
  // Ice physics (slippery platforms), snowball enemies rolling on ground
  {
    name: 'SNOWY PEAKS',
    theme: 'snow',
    width: 5500,
    skyTop: '#4a6fa5',
    skyBot: '#c8dbe8',
    groundColor: '#e8e8f0',
    dirtColor: '#8899aa',
    platformColor: '#d0d8e0',
    platformHi: '#e8eef4',
    platformLo: '#aabbcc',
    bgElements: 'mountains',
    icy: true, // special physics flag
    generate(rand) {
      const platforms = [
        { x: -200, y: GROUND_Y, w: 1300, h: 60, isGround: true },
        { x: 1500, y: GROUND_Y, w: 700,  h: 60, isGround: true },
        { x: 2400, y: GROUND_Y, w: 800,  h: 60, isGround: true },
        { x: 3400, y: GROUND_Y, w: 1000, h: 60, isGround: true },
        { x: 4600, y: GROUND_Y, w: 1100, h: 60, isGround: true },
      ];

      const defs = [
        { x: 300,  y: 400, w: 160 },
        { x: 560,  y: 350, w: 128 },
        { x: 820,  y: 290, w: 160 },
        { x: 1100, y: 350, w: 128 },
        { x: 1350, y: 410, w: 96 },   // over gap
        { x: 1600, y: 340, w: 160 },
        { x: 1880, y: 280, w: 128 },
        { x: 2150, y: 360, w: 96 },   // over gap
        { x: 2500, y: 310, w: 160 },
        { x: 2800, y: 260, w: 128 },
        { x: 3050, y: 340, w: 96 },
        { x: 3250, y: 400, w: 96 },   // over gap
        { x: 3550, y: 330, w: 160 },
        { x: 3850, y: 270, w: 128 },
        { x: 4100, y: 350, w: 96 },
        { x: 4350, y: 410, w: 96 },   // over gap
        { x: 4700, y: 320, w: 160 },
        { x: 5000, y: 370, w: 128 },
      ];
      for (const d of defs) {
        platforms.push({ x: d.x, y: d.y, w: d.w, h: TILE, isGround: false });
      }

      // Snowballs that roll along the ground
      const enemies = [
        { x: 400,  y: GROUND_Y - 20, w: 20, h: 20, type: 'snowball', minX: 200,  maxX: 1100, speed: 100, dir: 1 },
        { x: 1700, y: GROUND_Y - 20, w: 20, h: 20, type: 'snowball', minX: 1500, maxX: 2100, speed: 120, dir: -1 },
        { x: 2600, y: GROUND_Y - 20, w: 20, h: 20, type: 'snowball', minX: 2400, maxX: 3100, speed: 90, dir: 1 },
        { x: 3600, y: GROUND_Y - 20, w: 20, h: 20, type: 'snowball', minX: 3400, maxX: 4300, speed: 110, dir: -1 },
        { x: 4800, y: GROUND_Y - 20, w: 24, h: 24, type: 'snowball', minX: 4600, maxX: 5400, speed: 130, dir: 1 },
      ];

      return { platforms, hazards: [], enemies, movingPlatforms: [] };
    },
  },

  // ── Level 6: Volcano Ridge ──────────────────────────────────────────────────
  // Lava pits (instant death replacing ground gaps), fire hazards
  {
    name: 'VOLCANO RIDGE',
    theme: 'volcano',
    width: 6000,
    skyTop: '#1a0000',
    skyBot: '#4a1a0a',
    groundColor: '#3a3a3a',
    dirtColor: '#2a1a0a',
    platformColor: '#5a4a3a',
    platformHi: '#6a5a4a',
    platformLo: '#4a3a2a',
    bgElements: 'volcanoes',
    generate(rand) {
      const platforms = [
        { x: -200, y: GROUND_Y, w: 900,  h: 60, isGround: true },
        // lava pit 1
        { x: 900,  y: GROUND_Y, w: 600,  h: 60, isGround: true },
        // lava pit 2
        { x: 1700, y: GROUND_Y, w: 700,  h: 60, isGround: true },
        // lava pit 3
        { x: 2600, y: GROUND_Y, w: 500,  h: 60, isGround: true },
        // lava pit 4
        { x: 3300, y: GROUND_Y, w: 800,  h: 60, isGround: true },
        // lava pit 5
        { x: 4300, y: GROUND_Y, w: 600,  h: 60, isGround: true },
        // lava pit 6
        { x: 5100, y: GROUND_Y, w: 1100, h: 60, isGround: true },
      ];

      const defs = [
        { x: 300,  y: 380, w: 128 },
        { x: 550,  y: 310, w: 96 },
        { x: 780,  y: 260, w: 128 },
        { x: 1000, y: 340, w: 128 },
        { x: 1250, y: 280, w: 96 },
        { x: 1500, y: 360, w: 128 },
        { x: 1800, y: 310, w: 128 },
        { x: 2100, y: 250, w: 96 },
        { x: 2350, y: 340, w: 96 },
        { x: 2650, y: 290, w: 128 },
        { x: 2900, y: 360, w: 96 },
        { x: 3100, y: 290, w: 96 },
        { x: 3400, y: 340, w: 128 },
        { x: 3700, y: 270, w: 96 },
        { x: 3950, y: 340, w: 96 },
        { x: 4150, y: 400, w: 96 },
        { x: 4400, y: 320, w: 128 },
        { x: 4700, y: 260, w: 96 },
        { x: 4950, y: 350, w: 96 },
        { x: 5200, y: 300, w: 160 },
        { x: 5500, y: 350, w: 128 },
      ];
      for (const d of defs) {
        platforms.push({ x: d.x, y: d.y, w: d.w, h: TILE, isGround: false });
      }

      // Lava pits between ground segments
      const hazards = [
        { x: 700,  y: GROUND_Y + 10, w: 200, h: 50, type: 'lava' },
        { x: 1500, y: GROUND_Y + 10, w: 200, h: 50, type: 'lava' },
        { x: 2400, y: GROUND_Y + 10, w: 200, h: 50, type: 'lava' },
        { x: 3100, y: GROUND_Y + 10, w: 200, h: 50, type: 'lava' },
        { x: 4100, y: GROUND_Y + 10, w: 200, h: 50, type: 'lava' },
        { x: 4900, y: GROUND_Y + 10, w: 200, h: 50, type: 'lava' },
      ];

      // Fire geysers that shoot up periodically (rendered as fire columns)
      const enemies = [
        { x: 800,  y: GROUND_Y - 60, w: 16, h: 60, type: 'fire', period: 180, offset: 0 },
        { x: 1600, y: GROUND_Y - 60, w: 16, h: 60, type: 'fire', period: 150, offset: 60 },
        { x: 2500, y: GROUND_Y - 60, w: 16, h: 60, type: 'fire', period: 200, offset: 30 },
        { x: 3200, y: GROUND_Y - 60, w: 16, h: 60, type: 'fire', period: 160, offset: 90 },
        { x: 4200, y: GROUND_Y - 60, w: 16, h: 60, type: 'fire', period: 170, offset: 45 },
        { x: 5000, y: GROUND_Y - 60, w: 16, h: 60, type: 'fire', period: 140, offset: 75 },
      ];

      return { platforms, hazards, enemies, movingPlatforms: [] };
    },
  },

  // ── Level 7: Sky Palace ─────────────────────────────────────────────────────
  // Dissolving cloud platforms, wind gusts, epic finale — no ground!
  {
    name: 'SKY PALACE',
    theme: 'sky',
    width: 6000,
    skyTop: '#1a0a3a',
    skyBot: '#4a2a8a',
    groundColor: '#d0c0ff',
    dirtColor: '#a090cc',
    platformColor: '#e0d0ff',
    platformHi: '#f0e8ff',
    platformLo: '#c0b0dd',
    bgElements: 'stars',
    generate(rand) {
      // Very limited ground — mostly sky platforms!
      const platforms = [
        { x: -200, y: GROUND_Y, w: 500, h: 60, isGround: true },  // starting area only
        { x: 5600, y: GROUND_Y, w: 600, h: 60, isGround: true },  // finish area
      ];

      // Cloud platforms — the main path
      const defs = [
        { x: 250,  y: 400, w: 128 },
        { x: 450,  y: 340, w: 96, dissolve: true },
        { x: 650,  y: 380, w: 128 },
        { x: 880,  y: 310, w: 96, dissolve: true },
        { x: 1100, y: 360, w: 128 },
        { x: 1300, y: 290, w: 96 },
        { x: 1520, y: 350, w: 128, dissolve: true },
        { x: 1750, y: 280, w: 96 },
        { x: 1950, y: 340, w: 128 },
        { x: 2150, y: 260, w: 96, dissolve: true },
        { x: 2380, y: 320, w: 128 },
        { x: 2600, y: 380, w: 96 },
        { x: 2800, y: 300, w: 128, dissolve: true },
        { x: 3050, y: 250, w: 96 },
        { x: 3280, y: 330, w: 128 },
        { x: 3500, y: 270, w: 96, dissolve: true },
        { x: 3720, y: 350, w: 128 },
        { x: 3950, y: 280, w: 96 },
        { x: 4150, y: 340, w: 128, dissolve: true },
        { x: 4380, y: 260, w: 96 },
        { x: 4600, y: 320, w: 128 },
        { x: 4830, y: 370, w: 128, dissolve: true },
        { x: 5050, y: 300, w: 96 },
        { x: 5280, y: 360, w: 128 },
        { x: 5480, y: 420, w: 128 },
      ];
      for (const d of defs) {
        platforms.push({
          x: d.x, y: d.y, w: d.w, h: TILE, isGround: false,
          dissolve: d.dissolve || false, dissolveTimer: 0, dissolved: false,
        });
      }

      // Wind gusts (horizontal force zones)
      const hazards = [
        { x: 600,  y: 200, w: 200, h: 300, type: 'wind', dir: 1, strength: 120 },
        { x: 1400, y: 150, w: 200, h: 350, type: 'wind', dir: -1, strength: 100 },
        { x: 2300, y: 180, w: 250, h: 300, type: 'wind', dir: 1, strength: 140 },
        { x: 3400, y: 200, w: 200, h: 300, type: 'wind', dir: -1, strength: 110 },
        { x: 4500, y: 150, w: 250, h: 350, type: 'wind', dir: 1, strength: 130 },
      ];

      // Floating enemies
      const enemies = [
        { x: 800,  y: 280, w: 24, h: 16, type: 'bat', minX: 700,  maxX: 1000, speed: 90, dir: 1 },
        { x: 1600, y: 240, w: 24, h: 16, type: 'bat', minX: 1450, maxX: 1750, speed: 80, dir: -1 },
        { x: 2500, y: 260, w: 24, h: 16, type: 'bat', minX: 2350, maxX: 2650, speed: 100, dir: 1 },
        { x: 3300, y: 220, w: 24, h: 16, type: 'bat', minX: 3150, maxX: 3500, speed: 85, dir: -1 },
        { x: 4200, y: 250, w: 24, h: 16, type: 'bat', minX: 4050, maxX: 4400, speed: 95, dir: 1 },
        { x: 5100, y: 270, w: 24, h: 16, type: 'bat', minX: 4950, maxX: 5300, speed: 90, dir: -1 },
      ];

      // Moving platforms for some gaps
      const movingPlatforms = [
        { x: 1800, y: 400, w: 96, h: TILE, minY: 300, maxY: 440, speed: 30, axis: 'y' },
        { x: 3100, y: 380, w: 96, h: TILE, minY: 280, maxY: 420, speed: 35, axis: 'y' },
        { x: 4400, y: 390, w: 96, h: TILE, minY: 310, maxY: 430, speed: 25, axis: 'y' },
      ];

      return { platforms, hazards, enemies, movingPlatforms };
    },
  },
];

// ── Helper: get current level def ──────────────────────────────────────────────
function getLevelDef(levelNum) {
  const idx = Math.min(levelNum - 1, LEVEL_DEFS.length - 1);
  return LEVEL_DEFS[idx];
}

// Command display names — used by HUD and training screen
const COMMAND_DISPLAY_NAMES = {
  get_treat:   'GET THE TREAT',
  come:        'COME',
  stay:        'STAY',
  sit_trick:   'SIT',
  double_jump: 'DOUBLE-JUMP',
  jump_trick:  'JUMP',
  attack:      'ATTACK',
  play_dead:   'PLAY DEAD',
  fly:         'FLY',
};
