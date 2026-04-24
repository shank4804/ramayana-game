# Ramayana Game — P0 Design Spec

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Platform | Enhance existing 2D browser game (HTML5 Canvas) | Validate full game flow before committing to 3D engine |
| Build approach | Chapter-first (Approach 1) | Always playable, story grows naturally, each milestone is shippable |
| World system | Room-based (Zelda-style) | Exploration feel without scrolling camera complexity |
| Narrative delivery | In-engine animated cutscenes | Use existing sprite system, speech bubbles, character movement |
| Audio | Deferred | Focus on gameplay and story first, layer audio later |

---

## Section 1: Room-Based World System

### Current State
3 fixed-screen levels (16x12 tiles each): Forest, Lanka Gates, Ravana's Palace.

### New System
Chapters containing multiple interconnected rooms.

**Room:** A 16x12 tile grid (same as current). Each room has an ID like `"1-3"` (chapter 1, room 3).

**Transitions:** Player walks to a room edge -> screen fades -> adjacent room loads. Player appears at the corresponding opposite edge. Each room defines exits:
```js
{ north: "1-3", east: "1-4", south: null, west: "1-1" }
```

### Chapter Room Counts

| Chapter | Name | Rooms | Key Features |
|---|---|---|---|
| 1 | Ayodhya | 4-5 | Palace, courtyard, throne room, gardens, gate |
| 2 | Forest Exile | 5-6 | Forest paths, sage camp, river crossing, demon clearing |
| 3 | The Abduction | 3-4 | Camp, golden deer chase, abduction scene |
| 4 | Kishkindha Alliance | 3-4 | Mountain path, vanara village, duel arena |
| 5 | Hanuman's Lanka Mission | 4-5 | Ocean crossing, Lanka walls, inner city, Sita's prison |
| 6 | War for Lanka | 5-6 | Bridge, battlefield, palace gates, throne room, Ravana arena |

### Data Format
Each room is an ASCII tile string (same as current levels), grouped into chapter objects with metadata:
- Name, subtitle, ambient text
- Exit connections (north/south/east/west -> room ID)
- Entity spawns (enemies, NPCs, pickups)
- Trigger zones (cutscenes, events)

---

## Section 2: Combat System (TO BE DESIGNED)

Planned scope:
- Light melee combo system (sword)
- Existing bow/ranged attacks retained
- Dodge and simple block/parry mechanic
- Special mythic ability per hero
- Lock-on for boss fights and elite enemies

---

## Section 3: Playable Characters (TO BE DESIGNED)

Planned scope:
- **Rama** — main hero, sword + bow, balanced
- **Lakshmana** — faster, more aggressive, introduced Ch 1 as companion then playable in select sections
- **Hanuman** — long jumps, heavy strikes, crowd control, playable in Ch 5

---

## Section 4: Companion AI (TO BE DESIGNED)

Planned scope:
- Simple follow-and-assist behavior
- Contextual story actions
- No deep squad tactics in P0

---

## Section 5: Cutscene / Narrative Engine (TO BE DESIGNED)

Planned scope:
- In-engine animated scenes using game sprites
- Characters walk, face each other, speech bubbles for dialogue
- Chapter intro/outro cards (title + text)
- Short codex/journal for story recap

---

## Section 6: Save System (TO BE DESIGNED)

Planned scope:
- Autosave at chapter start
- Checkpoint save before major encounters
- Manual save at shrines/camps
- localStorage-based
- Continue from latest save on title screen

---

## Section 7: Enemy & Boss Expansion (TO BE DESIGNED)

Planned scope:
- 4 enemy archetypes: basic rakshasa, ranged demon, heavy brute, fast scout
- 3-4 boss encounters across campaign
- Ravana as final multi-phase boss
- One Hanuman-focused boss

---

## Section 8: HUD & UI Expansion (TO BE DESIGNED)

Planned scope:
- Character portrait for active hero
- Melee/ranged weapon indicator
- Boss health bars
- Pause menu with save option
- Chapter select (after completion)

---

## Known Bugs to Fix

1. `ENEMY_DAMAGE_COOLDOWN` referenced in `enemy.js` but never defined in `constants.js` — causes NaN damage cooldown
2. `C.SHADOW` referenced in `player.js` and `enemy.js` but not in the color palette — shadow renders with wrong color
3. `Enemy._doStunned()` is an empty stub — dead code, stun state never triggered

---

## Build Order (Chapter-First)

### Phase 1: Foundation
- [x] Fix known bugs
- [x] Build room-based world system (room data format, transitions, multi-room chapters)
- [x] Build save system baseline (localStorage autosave + continue; manual save/checkpoints still pending)
- [x] Build cutscene/narrative baseline (chapter intro cards + chapter opening/ending dialogue scenes)

### Phase 2: Chapter 1 — Ayodhya
- [ ] Design 4-5 rooms for Ayodhya (palace, courtyard, throne room, gardens, gate)
- [ ] Add melee combat (sword attacks, light combo)
- [ ] Add Lakshmana as companion AI (follow + assist)
- [ ] Add NPC characters (Dasharatha, Kaikeyi, Sita)
- [ ] Intro cutscene: royal family, court life
- [ ] Ending cutscene: Kaikeyi's demand, exile decision

### Phase 3: Chapter 2 — Forest Exile
- [ ] Design 5-6 forest rooms
- [ ] Add dodge mechanic
- [ ] Introduce ranged demon enemy type
- [ ] Add sage NPCs to protect
- [ ] Camp scene cutscenes with Sita (emotional grounding)

### Phase 4: Chapter 3 — The Abduction
- [ ] Design 3-4 rooms
- [ ] Add Maricha (golden deer) chase sequence
- [ ] Major cutscene: Ravana abducts Sita
- [ ] Surpanakha encounter

### Phase 5: Chapter 4 — Kishkindha Alliance
- [ ] Design 3-4 rooms
- [ ] Introduce Hanuman and Sugriva as NPCs
- [ ] Optional duel boss encounter
- [ ] Alliance-building cutscenes

### Phase 6: Chapter 5 — Hanuman's Lanka Mission
- [ ] Design 4-5 rooms
- [ ] Hanuman becomes playable (long jumps, heavy strikes, crowd control)
- [ ] Traversal-heavy gameplay
- [ ] Find Sita cutscene
- [ ] Destruction/sabotage set piece

### Phase 7: Chapter 6 — War for Lanka
- [ ] Design 5-6 rooms
- [ ] Bridge crossing sequence
- [ ] Heavy brute + fast scout enemy types
- [ ] Elite enemy encounters
- [ ] Multi-phase Ravana final boss
- [ ] Ending cutscene: return to Ayodhya, dharma restored

### Phase 8: Polish
- [ ] Chapter select / replay
- [ ] Difficulty settings
- [ ] Balance pass on combat and pacing
- [ ] Lock-on system for bosses
- [ ] Collectibles and lore pickups
