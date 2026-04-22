// ─────────────────────────────────────────────────────────────────────────────
// Chapter & Room Data
// Each chapter contains multiple interconnected rooms plus narrative metadata.
// Room IDs follow the format "chapterIndex-roomIndex" (for example "2-1").
// ─────────────────────────────────────────────────────────────────────────────

const CHAPTERS = [

  // ══════════════════════════════════════════════════════════════════════════
  // CHAPTER 1: AYODHYA
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Ayodhya',
    subtitle: 'Before the Exile',
    introText: [
      "Ayodhya shines under Dasharatha's rule.",
      'Rama must leave that peace behind and walk toward exile.',
    ],
    openingScene: [
      { speaker: 'Narrator', text: "Ayodhya stands in order and light under King Dasharatha's care." },
      { speaker: 'Dasharatha', text: 'My son, the crown once seemed near. Today duty asks something harder.' },
      { speaker: 'Rama', text: 'If exile preserves my father\'s word, I will walk into the forest without anger.' },
    ],
    endingScene: [
      { speaker: 'Kaikeyi', text: 'The vow is spoken. Rama must leave the city and surrender the throne.' },
      { speaker: 'Rama', text: 'Ayodhya will remain in my heart. I leave not in defeat, but in obedience to dharma.' },
    ],
    rooms: [
      {
        id: '0-0',
        name: 'Palace Courtyard',
        mapStr: `
PPPPPPPPPPPPPPPP
P..............P
P..L........L..P
P..............P
P....P....P....P
P..............P
P....P....P....P
P..............P
P..L........L..P
P..............P
P..............P
PPPPPPPPPPPPPPPP`.trim(),
        bgColor: '#0f0f24',
        ambientText: 'Dasharatha watches over a city built on order and duty.',
        playerStart: { col: 2, row: 5 },
        enemies: [
          { type: 'guard', col: 11, row: 3 },
          { type: 'guard', col: 12, row: 8 },
        ],
        lotus: [
          { col: 2, row: 1 },
        ],
        exits: { east: '0-1' },
      },
      {
        id: '0-1',
        name: 'Royal Gardens',
        mapStr: `
################
#..............#
#..##....##....#
#......~~......#
#..............#
#..##......##..#
#..............#
#....##..##....#
#..............#
#..##......##..#
#..............#
################`.trim(),
        bgColor: '#102010',
        ambientText: 'The gardens are calm, but Kaikeyi has already changed the fate of the court.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'guard', col: 10, row: 2 },
          { type: 'guard', col: 13, row: 7 },
        ],
        lotus: [
          { col: 12, row: 10 },
        ],
        exits: { west: '0-0', south: '0-2' },
      },
      {
        id: '0-2',
        name: 'Eastern Gate',
        mapStr: `
BBBBBBBBBBBBBBBB
B..............B
B.BBB......BBB.B
B..............B
B..BB......BB..B
B..............B
B..BB......BB..B
B..............B
B.BBB......BBB.B
B..............B
B..............B
BBBBBBBBBBBBBBBB`.trim(),
        bgColor: '#241208',
        ambientText: 'Rama departs Ayodhya, carrying exile with quiet resolve.',
        playerStart: { col: 8, row: 1 },
        enemies: [
          { type: 'guard', col: 4, row: 4 },
          { type: 'guard', col: 11, row: 4 },
          { type: 'guard', col: 8, row: 8 },
        ],
        lotus: [
          { col: 14, row: 10 },
        ],
        exits: { north: '0-1' },
        isChapterEnd: true,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHAPTER 2: FOREST EXILE
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Forest Exile',
    subtitle: 'The Forest Years',
    introText: [
      'Rama, Sita, and Lakshmana walk the forest in obedience to dharma.',
      'Rakshasas and hardship now replace the calm of Ayodhya.',
    ],
    openingScene: [
      { speaker: 'Narrator', text: 'The forest receives the exiles with silence, distance, and hidden danger.' },
      { speaker: 'Sita', text: 'The path is harsh, but I would rather share hardship with you than comfort without you.' },
      { speaker: 'Lakshmana', text: 'Brother, I will keep watch. No demon will pass me while we endure this exile.' },
    ],
    endingScene: [
      { speaker: 'Narrator', text: 'The years in exile temper sorrow into patience and sharpen grief into resolve.' },
      { speaker: 'Rama', text: 'The forest has not broken us. But I feel the shadow of a greater trial ahead.' },
    ],
    rooms: [
      {
        id: '1-0',
        name: 'River Trail',
        mapStr: `
################
#......~~......#
#..##..~~..##..#
#..............#
#.####....####.#
#..............#
#..##......##..#
#..............#
#..####..####..#
#..............#
#..............#
################`.trim(),
        bgColor: '#0a1205',
        ambientText: 'The path south grows darker with every step into exile.',
        playerStart: { col: 1, row: 3 },
        enemies: [
          { type: 'rakshasa', col: 9, row: 2 },
          { type: 'rakshasa', col: 12, row: 7 },
          { type: 'rakshasa', col: 4, row: 9 },
        ],
        lotus: [
          { col: 14, row: 1 },
        ],
        exits: { east: '1-1' },
      },
      {
        id: '1-1',
        name: 'Hermit Clearing',
        mapStr: `
################
#..............#
#..##......##..#
#..............#
#......##......#
#..............#
#..####..####..#
#..............#
#..##......##..#
#..............#
#..............#
################`.trim(),
        bgColor: '#0a1205',
        ambientText: 'Sages call for protection as the forest fills with hostile eyes.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'rakshasa', col: 10, row: 3 },
          { type: 'rakshasa', col: 6, row: 6 },
          { type: 'rakshasa', col: 13, row: 9 },
        ],
        lotus: [
          { col: 2, row: 10 },
        ],
        exits: { west: '1-0', south: '1-2' },
      },
      {
        id: '1-2',
        name: 'Night Camp',
        mapStr: `
################
#..............#
#..##......##..#
#..............#
#......##......#
#..............#
#..............#
#..####..####..#
#..............#
#..##......##..#
#..............#
################`.trim(),
        bgColor: '#091005',
        ambientText: 'The campfire is small against the weight of the long exile.',
        playerStart: { col: 8, row: 1 },
        enemies: [
          { type: 'rakshasa', col: 4, row: 4 },
          { type: 'rakshasa', col: 11, row: 4 },
          { type: 'rakshasa', col: 8, row: 8 },
          { type: 'rakshasa', col: 13, row: 9 },
        ],
        lotus: [
          { col: 1, row: 10 },
          { col: 14, row: 10 },
        ],
        exits: { north: '1-1' },
        isChapterEnd: true,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHAPTER 3: THE ABDUCTION
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'The Abduction',
    subtitle: 'Sita is Taken',
    introText: [
      'A golden lure draws Rama away from camp.',
      'By the time he returns, Ravana has taken Sita.',
    ],
    openingScene: [
      { speaker: 'Narrator', text: 'A glittering illusion enters the forest and turns peace into catastrophe.' },
      { speaker: 'Lakshmana', text: 'This deer feels wrong to me, yet its beauty has already pulled us off the safer path.' },
      { speaker: 'Rama', text: 'I will return swiftly. Stay alert. Evil often arrives wearing wonder.' },
    ],
    endingScene: [
      { speaker: 'Narrator', text: 'The clearing is broken. Sita has been taken across the southern sky by Ravana.' },
      { speaker: 'Rama', text: 'I will not rest while Sita remains in the hands of Lanka\'s king.' },
      { speaker: 'Lakshmana', text: 'Then south is where we go. We search until the world yields her path.' },
    ],
    rooms: [
      {
        id: '2-0',
        name: 'Forest Camp',
        mapStr: `
################
#..............#
#..##......##..#
#..............#
#......##......#
#..............#
#..##......##..#
#..............#
#..####..####..#
#..............#
#..............#
################`.trim(),
        bgColor: '#0a1205',
        ambientText: 'For a moment the forest is quiet enough to feel like home.',
        playerStart: { col: 2, row: 5 },
        enemies: [
          { type: 'rakshasa', col: 11, row: 2 },
          { type: 'rakshasa', col: 12, row: 8 },
        ],
        lotus: [
          { col: 1, row: 1 },
        ],
        exits: { east: '2-1' },
      },
      {
        id: '2-1',
        name: 'Golden Trail',
        mapStr: `
################
#..............#
#..##....##....#
#..............#
#....##..##....#
#..............#
#..##......##..#
#..............#
#....##..##....#
#..............#
#..............#
################`.trim(),
        bgColor: '#0b1406',
        ambientText: 'The shining deer darts deeper into the trees, always just ahead.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'rakshasa', col: 9, row: 2 },
          { type: 'rakshasa', col: 12, row: 5 },
          { type: 'rakshasa', col: 10, row: 9 },
        ],
        lotus: [
          { col: 14, row: 10 },
        ],
        exits: { west: '2-0', south: '2-2' },
      },
      {
        id: '2-2',
        name: 'Broken Clearing',
        mapStr: `
################
#..............#
#..##......##..#
#..............#
#..............#
#....####......#
#..............#
#......####....#
#..............#
#..##......##..#
#..............#
################`.trim(),
        bgColor: '#091005',
        ambientText: 'The clearing lies in ruin. Sita is gone, and grief turns into purpose.',
        playerStart: { col: 8, row: 1 },
        enemies: [
          { type: 'rakshasa', col: 4, row: 4 },
          { type: 'rakshasa', col: 11, row: 4 },
          { type: 'guard', col: 8, row: 8 },
        ],
        lotus: [
          { col: 8, row: 10 },
        ],
        exits: { north: '2-1' },
        isChapterEnd: true,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHAPTER 4: KISHKINDHA
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Kishkindha',
    subtitle: 'Hanuman and Sugriva',
    introText: [
      'On the southern mountains, Rama finds Hanuman and Sugriva.',
      'An alliance is forged to search the world for Sita.',
    ],
    openingScene: [
      { speaker: 'Narrator', text: 'Among the mountain strongholds of Kishkindha, allies finally appear.' },
      { speaker: 'Hanuman', text: 'Your sorrow is honest, Rama. If Sita lives, we will help you find her.' },
      { speaker: 'Sugriva', text: 'Stand with me, and my vanaras will stand with you.' },
    ],
    endingScene: [
      { speaker: 'Hanuman', text: 'Give the word, and I will cross any sea, scale any wall, and search every corner of Lanka.' },
      { speaker: 'Rama', text: 'Then go with my trust. The hope of our journey now travels with you.' },
    ],
    rooms: [
      {
        id: '3-0',
        name: 'Rishyamukha Pass',
        mapStr: `
BBBBBBBBBBBBBBBB
B..............B
B..BB......BB..B
B..............B
B......BB......B
B..............B
B..BBB....BBB..B
B..............B
B..BB......BB..B
B..............B
B..............B
BBBBBBBBBBBBBBBB`.trim(),
        bgColor: '#1f1408',
        ambientText: 'Hanuman approaches first, measuring Rama with careful wisdom.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'guard', col: 10, row: 2 },
          { type: 'guard', col: 12, row: 7 },
        ],
        lotus: [
          { col: 14, row: 10 },
        ],
        exits: { east: '3-1' },
      },
      {
        id: '3-1',
        name: 'Sugriva Refuge',
        mapStr: `
################
#..............#
#..##......##..#
#..............#
#....####......#
#..............#
#......####....#
#..............#
#..##......##..#
#..............#
#..............#
################`.trim(),
        bgColor: '#11200a',
        ambientText: 'Sugriva agrees to help, but only after trust is earned.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'guard', col: 9, row: 2 },
          { type: 'guard', col: 12, row: 5 },
          { type: 'guard', col: 8, row: 9 },
        ],
        lotus: [
          { col: 13, row: 1 },
        ],
        exits: { west: '3-0', south: '3-2' },
      },
      {
        id: '3-2',
        name: 'Alliance Oath',
        mapStr: `
PPPPPPPPPPPPPPPP
P..............P
P..L........L..P
P..............P
P....P....P....P
P..............P
P....P....P....P
P..............P
P..L........L..P
P..............P
P..............P
PPPPPPPPPPPPPPPP`.trim(),
        bgColor: '#181828',
        ambientText: 'Hanuman bows, and the search for Sita gains its first true hope.',
        playerStart: { col: 8, row: 1 },
        enemies: [
          { type: 'guard', col: 4, row: 4 },
          { type: 'guard', col: 11, row: 4 },
          { type: 'guard', col: 8, row: 8 },
        ],
        lotus: [
          { col: 1, row: 10 },
        ],
        exits: { north: '3-1' },
        isChapterEnd: true,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHAPTER 5: SEARCH FOR SITA
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Search for Sita',
    subtitle: 'Into Lanka',
    introText: [
      'The search reaches Lanka, where Sita is held behind demon walls.',
      'Devotion and courage carry the mission forward.',
    ],
    openingScene: [
      { speaker: 'Narrator', text: 'The sea gives way to Lanka, and the search enters the enemy\'s heart.' },
      { speaker: 'Hanuman', text: 'I carry Rama\'s purpose with me. I will not return until I have found Sita.' },
      { speaker: 'Narrator', text: 'Inside Lanka, stealth, speed, and courage matter more than numbers.' },
    ],
    endingScene: [
      { speaker: 'Sita', text: 'Tell Rama I endure. Let him come when the hour is right.' },
      { speaker: 'Hanuman', text: 'Lanka has seen his warning. Next it will feel his army.' },
    ],
    rooms: [
      {
        id: '4-0',
        name: 'Shore of the Sea',
        mapStr: `
~~~~~~~~~~~~~~~~
~..............~
~..##......##..~
~..............~
~....##..##....~
~..............~
~..##......##..~
~..............~
~....##..##....~
~..............~
~..............~
~~~~~~~~~~~~~~~~`.trim(),
        bgColor: '#081228',
        ambientText: 'Across the sea waits Lanka, fortress of the king who stole Sita.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'guard', col: 10, row: 2 },
          { type: 'guard', col: 12, row: 8 },
        ],
        lotus: [
          { col: 14, row: 1 },
        ],
        exits: { east: '4-1' },
      },
      {
        id: '4-1',
        name: 'Lanka Wall',
        mapStr: `
BBBBBBBBBBBBBBBB
B..............B
B.BBB......BBB.B
B..............B
B..BB......BB..B
B..............B
B..BB......BB..B
B..............B
B.BBB......BBB.B
B..............B
B..............B
BBBBBBBBBBBBBBBB`.trim(),
        bgColor: '#210b05',
        ambientText: 'The first ring of Lanka bristles with soldiers and fear.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'guard', col: 10, row: 2 },
          { type: 'guard', col: 5, row: 5 },
          { type: 'guard', col: 12, row: 8 },
        ],
        lotus: [
          { col: 13, row: 10 },
        ],
        exits: { west: '4-0', south: '4-2' },
      },
      {
        id: '4-2',
        name: 'Ashoka Grove',
        mapStr: `
################
#..............#
#..##......##..#
#..............#
#....##..##....#
#..............#
#..##......##..#
#..............#
#....##..##....#
#..............#
#..............#
################`.trim(),
        bgColor: '#0d1508',
        ambientText: 'At last, Sita is found. Lanka must now answer for Ravana\'s crime.',
        playerStart: { col: 8, row: 1 },
        enemies: [
          { type: 'guard', col: 4, row: 3 },
          { type: 'guard', col: 11, row: 3 },
          { type: 'guard', col: 8, row: 8 },
        ],
        lotus: [
          { col: 1, row: 10 },
          { col: 14, row: 10 },
        ],
        exits: { north: '4-1' },
        isChapterEnd: true,
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CHAPTER 6: WAR FOR LANKA
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'War for Lanka',
    subtitle: 'The Final Battle',
    introText: [
      'The vanara host crosses into Lanka for the final war.',
      "Rama must break Ravana's power and return home.",
    ],
    openingScene: [
      { speaker: 'Narrator', text: 'The bridge holds and the war for Lanka begins in full.' },
      { speaker: 'Hanuman', text: 'The city is strong, but its fear is stronger. We can break it.' },
      { speaker: 'Rama', text: 'Today the war ends. Ravana will answer for the pain he has caused.' },
    ],
    endingScene: [
      { speaker: 'Narrator', text: 'Ravana falls, and with him falls the weight that darkened Lanka.' },
      { speaker: 'Rama', text: 'Sita is free. Our road now turns homeward, back to Ayodhya.' },
      { speaker: 'Narrator', text: 'After war and exile, dharma endures and the kingdom may breathe again.' },
    ],
    rooms: [
      {
        id: '5-0',
        name: 'Bridgehead',
        mapStr: `
BBBBBBBBBBBBBBBB
B..............B
B..BB......BB..B
B..............B
B....BBB..BBB..B
B..............B
B..BBB....BBB..B
B..............B
B..BB......BB..B
B..............B
B..............B
BBBBBBBBBBBBBBBB`.trim(),
        bgColor: '#230c04',
        ambientText: 'The bridge holds. Lanka will fall only through battle.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'guard', col: 9, row: 2 },
          { type: 'guard', col: 12, row: 5 },
          { type: 'rakshasa', col: 8, row: 8 },
        ],
        lotus: [
          { col: 14, row: 10 },
        ],
        exits: { east: '5-1' },
      },
      {
        id: '5-1',
        name: 'Palace Approach',
        mapStr: `
PPPPPPPPPPPPPPPP
P..............P
P.L..........L.P
P..............P
P.PPP......PPP.P
P..............P
P.PPP......PPP.P
P..............P
P.L..........L.P
P..............P
P..............P
PPPPPPPPPPPPPPPP`.trim(),
        bgColor: '#11112a',
        ambientText: 'Ravana\'s palace rises ahead as the war closes around its king.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'rakshasa', col: 3, row: 2 },
          { type: 'rakshasa', col: 12, row: 2 },
          { type: 'guard', col: 4, row: 8 },
          { type: 'guard', col: 11, row: 8 },
        ],
        lotus: [
          { col: 8, row: 10 },
        ],
        exits: { west: '5-0', east: '5-2' },
      },
      {
        id: '5-2',
        name: 'Ravana\'s Hall',
        mapStr: `
PPPPPPPPPPPPPPPP
P..............P
P.L..........L.P
P..............P
P.PPP......PPP.P
P..............P
P.PPP......PPP.P
P..............P
P.L..........L.P
P..............P
P.L..........L.P
PPPPPPPPPPPPPPPP`.trim(),
        bgColor: '#090916',
        ambientText: 'Ravana waits at the heart of Lanka with all his pride and fury.',
        playerStart: { col: 1, row: 5 },
        enemies: [
          { type: 'rakshasa', col: 3, row: 2 },
          { type: 'rakshasa', col: 12, row: 2 },
          { type: 'rakshasa', col: 3, row: 9 },
          { type: 'rakshasa', col: 12, row: 9 },
          { type: 'ravana', col: 8, row: 5 },
        ],
        lotus: [
          { col: 7, row: 1 },
          { col: 8, row: 10 },
        ],
        exits: {},
        isBoss: true,
        isChapterEnd: true,
        isFinalRoom: true,
      },
    ],
  },
];

function findRoomDef(roomId) {
  for (const chapter of CHAPTERS) {
    for (const room of chapter.rooms) {
      if (room.id === roomId) return room;
    }
  }
  return null;
}

function getChapterIndex(roomId) {
  return parseInt(roomId.split('-')[0], 10);
}

function getChapterDef(roomId) {
  return CHAPTERS[getChapterIndex(roomId)];
}
