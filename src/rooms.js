// Room definitions for the top-down world
// Tile grid: ROOM_COLS × ROOM_ROWS  (30 × 15 = 960 × 480 px)
// Tile IDs come from the T constant in state.js
//
// Exit format:
//   { dir:'south', minCol, maxCol, targetRoom, targetCol, targetRow }
//   { dir:'north', minCol, maxCol, targetRoom, targetCol, targetRow }
//   { dir:'west',  minRow, maxRow, targetRoom, targetCol, targetRow }
//   { dir:'east',  minRow, maxRow, targetRoom, targetCol, targetRow }

const ROOMS = [

  // ─────────────────────────────────────────────────────────────────────
  //  Room 0 — Buddy's Backyard
  // ─────────────────────────────────────────────────────────────────────
  {
    name:    "Buddy's Backyard",
    bgColor: '#3a6b41',

    //          col: 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
    tiles: [
      /* r 0 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      /* r 1 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 2 */ [1, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 9, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 3 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 0, 0, 2, 0, 0, 0, 0, 1],
      /* r 4 */ [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 5 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0, 0, 1],
      /* r 6 */ [1, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0, 0, 1],
      /* r 7 */ [1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 8 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
      /* r 9 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r10 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r11 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r12 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r13 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r14 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],

    playerStart: { col: 14, row: 11 },

    npcs: [
      {
        id:    'bob',
        name:  'Bob',
        type:  'human',
        col:   24,
        row:   2,
        color: '#3d7abf',  // blue shirt
        dialogue: [
          "Buddy! There you are, boy!",
          "Listen — old Mr. Whiskers has been",
          "stealing BONES from every dog in",
          "the neighborhood.",
          "Real supervillain energy.",
          "Start by exploring the street.",
          "The other dogs will know more!",
        ],
      },
    ],

    items: [
      { id: 'b0', type: 'bone',  col: 8,  row: 7  },
      { id: 'b1', type: 'bone',  col: 20, row: 10 },
      { id: 'b2', type: 'bone',  col: 26, row: 6  },
      { id: 'b3', type: 'ball',  col: 11, row: 9  },
      { id: 'b4', type: 'treat', col: 22, row: 12 },
    ],

    exits: [
      { dir: 'south', minCol: 12, maxCol: 17, targetRoom: 1, targetCol: 14, targetRow: 1 },
    ],
  },


  // ─────────────────────────────────────────────────────────────────────
  //  Room 1 — Maple Street
  // ─────────────────────────────────────────────────────────────────────
  {
    name:    'Maple Street',
    bgColor: '#5a7c5a',

    tiles: [
      /* r 0 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      /* r 1 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 2 */ [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
      /* r 3 */ [1, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 1],
      /* r 4 */ [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 5 */ [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 6 */ [0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 7 */ [1, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 1],
      /* r 8 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 9 */ [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
      /* r10 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r11 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r12 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r13 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r14 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],

    playerStart: { col: 14, row: 2 },

    npcs: [
      {
        id:    'henderson',
        name:  'Henderson',
        type:  'human',
        col:   4,
        row:   2,
        color: '#c47a4a',  // brown jacket
        dialogue: [
          "GET THAT DOG OFF MY— oh.",
          "Oh. It's you, Buddy.",
          "...Fine. Whiskers lives in the alley",
          "behind the dog park. To the WEST.",
          "He's been hoarding everything.",
          "Real menace to society.",
          "Also stay off my petunias.",
        ],
      },
      {
        id:    'cat_fence',
        name:  'Whiskers Jr.',
        type:  'cat',
        col:   24,
        row:   2,
        color: '#aaaaaa',
        dialogue: [
          "Hmm. A dog. Charming.",
          "...",
          "FINE. My uncle Mr. Whiskers",
          "lives in the alley in the park.",
          "Head west. You can't miss it.",
          "Just... don't say I told you.",
          "We have a complicated relationship.",
        ],
      },
    ],

    items: [
      { id: 'b0', type: 'bone', col: 14, row: 5  },
      { id: 'b1', type: 'bone', col: 22, row: 10 },
      { id: 'b2', type: 'bone', col:  5, row: 11 },
    ],

    exits: [
      { dir: 'north', minCol: 12, maxCol: 17, targetRoom: 0, targetCol: 14, targetRow: 13 },
      { dir: 'west',  minRow:  4, maxRow:  6, targetRoom: 2, targetCol: 28, targetRow:  5 },
    ],
  },


  // ─────────────────────────────────────────────────────────────────────
  //  Room 2 — Bark Park  (+ Mr. Whiskers' alley)
  // ─────────────────────────────────────────────────────────────────────
  {
    name:    'Bark Park',
    bgColor: '#2d5e2d',

    tiles: [
      /* r 0 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      /* r 1 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 2 */ [1, 0, 0, 2, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
      /* r 3 */ [1, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 4 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      /* r 5 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      /* r 6 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      /* r 7 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 8 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r 9 */ [1, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r10 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r11 */ [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
      /* r12 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r13 */ [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      /* r14 */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],

    playerStart: { col: 28, row: 5 },

    npcs: [
      {
        id:          'chester',
        name:        'Chester',
        type:        'dog',
        col:         8,
        row:         5,
        color:       '#d4a843',
        dialogue: [
          "*panting at maximum capacity*",
          "OH HEY BUDDY oh boy oh boy oh boy!",
          "The bone situation is REAL BAD.",
          "Mr. Whiskers took ALL of them.",
          "He's in the alley — south end of",
          "the park, follow the path tiles.",
          "He's crafty. He once stole my",
          "collar. TWICE. Be careful.",
        ],
      },
      {
        id:          'rex',
        name:        'Rex',
        type:        'dog',
        col:         20,
        row:         9,
        color:       '#8b6914',
        dialogue: [
          "*enormous dog lying face-down in grass*",
          "...Hi, Buddy.",
          "I heard about the bone thing.",
          "What if the cat HISSES at you?",
          "I can't handle hissing.",
          "You're much braver than me.",
          "Also I ate a sock this morning.",
          "I don't know why I said that.",
        ],
      },
      {
        id:          'squirrel',
        name:        '???',
        type:        'squirrel',
        col:         16,
        row:         3,
        color:       '#8b5e3c',
        dialogue: [
          "SQUIRREL.",
          "...",
          "That is all I have to say.",
        ],
      },
      {
        id:          'whiskers',
        name:        'Mr. Whiskers',
        type:        'cat',
        col:         15,
        row:         13,
        color:       '#888899',
        isFinalBoss: true,
        dialogue: [
          "Oh. A dog. In MY alley.",
          "How utterly... predictable.",
          "Fine. You want the bones back?",
          "I took them because I was going",
          "to build a SCULPTURE.",
          "I was going to call it 'Hubris'.",
          "It was going to be ART, Buddy.",
          "...",
          "Fine. You wouldn't get it anyway.",
          "*slowly pushes a pile of bones over*",
          "There. Take them. All of them.",
          "And tell Chester to stop barking",
          "at my fence at 3am.",
          "It is EXTREMELY rude.",
        ],
      },
    ],

    items: [
      { id: 'b0', type: 'bone',  col: 10, row: 8  },
      { id: 'b1', type: 'bone',  col: 22, row: 4  },
      { id: 'b2', type: 'bone',  col:  7, row: 12 },
      { id: 'b3', type: 'treat', col: 18, row: 7  },
      { id: 'b4', type: 'bone',  col:  3, row: 10 },
    ],

    exits: [
      { dir: 'east', minRow: 4, maxRow: 6, targetRoom: 1, targetCol: 1, targetRow: 5 },
    ],
  },
];
