/**
 * Story data: each chapter has an intro cutscene (camera shots over the live
 * world + dialogue), a mission (spawn, objective marker, enemies), and a
 * completion line that leads into the next chapter.
 *
 * Coordinates reference the world built in world.js:
 *   Ayodhya palace ~(-150..-106, -48..32), eastern gate (-88, -6)
 *   Forest ~(-58..60, 20..110), exile camp (36, 22)
 *   Kishkindha rocks ~(68..125, -78..-20)
 *   Lanka walls ~(102..142, 38..80), Ravana's palace (150, 105)
 */
export const CHAPTERS = [
  {
    id: 'exile',
    title: 'The Exile Road',
    cutscene: [
      {
        duration: 9,
        cam: [[-180, 26, 40], [-120, 18, 28]],
        look: [[-128, 8, -42], [-128, 6, -42]],
        lines: [
          { at: 0.05, speaker: 'Narrator', text: 'Ayodhya stood radiant at the height of Dasharatha’s reign — ordered, golden, and full of promise.' },
          { at: 0.55, speaker: 'Dasharatha', text: 'Rama, the weight of an old vow falls upon this house. The crown must wait. Exile cannot.' },
        ],
      },
      {
        duration: 8,
        cam: [[-100, 10, 14], [-92, 6, 6]],
        look: [[-88, 4, -6], [-88, 4, -6]],
        lines: [
          { at: 0.1, speaker: 'Kaikeyi', text: 'The promise was mine to call, and the kingdom must honor it.' },
          { at: 0.45, speaker: 'Sita', text: 'If the road leads you into the wild, it leads me there as well.' },
          { at: 0.75, speaker: 'Lakshmana', text: 'Ayodhya can keep its walls. My place is at your side.' },
        ],
      },
      {
        duration: 6,
        cam: [[-130, 4, -2], [-110, 3.4, -4]],
        look: [[-88, 5, -6], [-88, 5, -6]],
        lines: [
          { at: 0.15, speaker: 'Narrator', text: 'So the prince stepped away from the throne, toward the eastern gate and fourteen years of wilderness.' },
        ],
      },
    ],
    mission: {
      spawn: [-138, -8],
      objective: 'Walk the exile road and pass through the eastern gate of Ayodhya.',
      marker: [-84, -6],
      radius: 8,
      enemies: [],
    },
    completion: 'The walls of Ayodhya fade behind you. The forest now owns the road.',
  },
  {
    id: 'forest',
    title: 'Forest of Demons',
    cutscene: [
      {
        duration: 8,
        cam: [[-70, 22, 60], [-30, 12, 80]],
        look: [[-10, 4, 50], [-20, 3, 56]],
        lines: [
          { at: 0.1, speaker: 'Narrator', text: 'Deep in Dandaka, the exiles built a life among the trees.' },
          { at: 0.55, speaker: 'Lakshmana', text: 'Brother — the forest has eyes tonight. Rakshasas hunt the clearing.' },
        ],
      },
      {
        duration: 5,
        cam: [[-26, 5, 70], [-22, 4, 62]],
        look: [[-20, 3, 56], [-20, 3, 56]],
        lines: [
          { at: 0.2, speaker: 'Rama', text: 'Then they will learn why the wild bows to no demon.' },
        ],
      },
    ],
    mission: {
      spawn: [-60, 16],
      objective: 'Reach the forest clearing and defeat the rakshasas stalking the camp.',
      marker: [-20, 56],
      radius: 13,
      enemies: [
        ['rakshasa', [-10, 62]],
        ['rakshasa', [-30, 68]],
        ['rakshasa', [-38, 48]],
      ],
    },
    completion: 'The clearing falls silent. But silence in Dandaka never lasts.',
  },
  {
    id: 'abduction',
    title: 'The Abduction',
    cutscene: [
      {
        duration: 8,
        cam: [[10, 16, 50], [30, 8, 34]],
        look: [[36, 3, 22], [36, 3, 22]],
        lines: [
          { at: 0.08, speaker: 'Narrator', text: 'A golden deer drew Rama from the camp — a lure, woven from demon craft.' },
          { at: 0.55, speaker: 'Narrator', text: 'When he returned, the hut stood empty. Sita was gone.' },
        ],
      },
      {
        duration: 6,
        cam: [[40, 4, 28], [44, 6, 30]],
        look: [[36, 2.5, 22], [120, 8, 60]],
        lines: [
          { at: 0.2, speaker: 'Rama', text: 'Ravana. His shadow runs south — to Lanka. We follow it to the end of the earth.' },
        ],
      },
    ],
    mission: {
      spawn: [10, 40],
      objective: 'Search the broken camp and cut down Ravana’s rear guard.',
      marker: [36, 22],
      radius: 13,
      enemies: [
        ['rakshasa', [24, 16]],
        ['rakshasa', [44, 30]],
        ['guard', [52, 18]],
      ],
    },
    completion: 'The trail is clear now: south, over the rocks of Kishkindha, toward the sea.',
  },
  {
    id: 'kishkindha',
    title: 'Alliance on the Heights',
    cutscene: [
      {
        duration: 8,
        cam: [[60, 24, -10], [85, 14, -35]],
        look: [[95, 4, -50], [95, 4, -50]],
        lines: [
          { at: 0.1, speaker: 'Narrator', text: 'In the rock kingdom of Kishkindha, grief finally met help.' },
          { at: 0.5, speaker: 'Hanuman', text: 'Son of Dasharatha — prove your strength to Sugriva’s challengers, and the vanara host marches with you.' },
        ],
      },
    ],
    mission: {
      spawn: [62, -18],
      objective: 'Climb into Kishkindha and defeat the challengers blocking the alliance.',
      marker: [95, -50],
      radius: 14,
      enemies: [
        ['guard', [82, -42]],
        ['guard', [104, -58]],
        ['brute', [96, -64]],
      ],
    },
    completion: 'The alliance is sealed. Lanka is no longer beyond reach.',
  },
  {
    id: 'lanka',
    title: 'Gates of Lanka',
    cutscene: [
      {
        duration: 9,
        cam: [[80, 20, 10], [105, 12, 30]],
        look: [[122, 8, 50], [128, 8, 60]],
        lines: [
          { at: 0.1, speaker: 'Narrator', text: 'The sea was crossed on a bridge of stone and prayer. Lanka rose ahead in red rock and firelight.' },
          { at: 0.6, speaker: 'Rama', text: 'No more corridors, no more forests. We take the city street by street.' },
        ],
      },
    ],
    mission: {
      spawn: [84, 14],
      objective: 'Breach Lanka’s outer district and clear Ravana’s defenders.',
      marker: [122, 60],
      radius: 14,
      enemies: [
        ['guard', [112, 46]],
        ['guard', [128, 64]],
        ['guard', [136, 48]],
        ['rakshasa', [126, 72]],
      ],
    },
    completion: 'The outer district falls. Only the palace remains — and the king of demons within it.',
  },
  {
    id: 'ravana',
    title: 'The Last Court',
    cutscene: [
      {
        duration: 9,
        cam: [[120, 16, 70], [138, 10, 88]],
        look: [[150, 10, 105], [150, 8, 105]],
        lines: [
          { at: 0.1, speaker: 'Narrator', text: 'Ten heads, twenty arms, a boon against gods and demons — but not against a man.' },
          { at: 0.55, speaker: 'Ravana', text: 'Come then, exile. Lanka has burned brighter for less.' },
          { at: 0.85, speaker: 'Rama', text: 'For Sita. For the road home.' },
        ],
      },
    ],
    mission: {
      spawn: [118, 66],
      objective: 'Enter the throne court and defeat Ravana.',
      marker: [150, 95],
      radius: 16,
      enemies: [
        ['guard', [140, 92]],
        ['guard', [160, 92]],
        ['ravana', [150, 105]],
      ],
    },
    completion: 'Ravana falls. The long road turns home at last.',
  },
];

export const ENDING = [
  {
    duration: 9,
    cam: [[160, 14, 120], [140, 20, 60]],
    look: [[150, 6, 105], [120, 4, 0]],
    lines: [
      { at: 0.1, speaker: 'Narrator', text: 'The war was over. Sita was free, and fourteen years of exile were spent.' },
      { at: 0.6, speaker: 'Narrator', text: 'In Ayodhya, lamps were lit in every window for the prince’s return — the first Diwali.' },
    ],
  },
  {
    duration: 8,
    cam: [[-60, 30, 40], [-120, 14, 20]],
    look: [[-128, 6, -40], [-128, 6, -40]],
    lines: [
      { at: 0.3, speaker: 'Narrator', text: 'Rama came home, and the city that wept at his leaving sang at his crowning.' },
    ],
  },
];
