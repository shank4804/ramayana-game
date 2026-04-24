# Ramayana Game Roadmap

## Vision

Create a stylized third-person action-adventure based on the full arc of the Ramayana.

The target feel is:

- Not pixel art
- Not AAA realism
- Cinematic, mythic, and approachable
- Story-forward with playable action set pieces
- Built around Rama as the main hero, with key sections played as Hanuman, Lakshmana, and a small number of other characters where it strengthens the story

The game should cover the major emotional and narrative beats:

- Ayodhya and the royal family
- Dasharatha, Kaikeyi, and the exile
- Forest life and the early demon encounters
- The abduction of Sita
- Rama's alliance with Hanuman and the vanaras
- Lanka, the war, and the final battle with Ravana
- The return to Ayodhya

## Product Pillars

### 1. Full Ramayana Arc

Even the first shippable version should tell the entire journey in a condensed but coherent way.

### 2. Hero-Driven Action

The player should feel like they are stepping into the role of legendary heroes, with each playable character having a clear identity.

### 3. Cinematic Storytelling

Major story beats should land through in-engine cutscenes, chapter intros, and strong environmental presentation.

### 4. Mythic but Playable Scope

The game should feel epic without trying to match AAA production complexity.

### 5. Save-Friendly Campaign Structure

The story should be easy to continue through chapter saves, checkpoints, and simple manual save support.

## Technical Direction

The current repository is a small 2D browser prototype. It is useful as a thematic and combat reference, but the target direction described here is larger in scope.

If the goal is a real third-person action-adventure, the practical direction is:

- Treat the current repo as prototype/reference material
- Build the new version in a 3D-friendly engine
- Keep scope disciplined so the first version is finishable

Recommended engine direction:

- Godot if the goal is manageable scope, fast iteration, and stylized presentation
- Unreal only if the team wants heavier cinematic tooling and accepts higher production complexity

## P0: First Playable Full-Story Version

### P0 Goal

Ship the smallest version of the game that still captures the full Ramayana journey from Ayodhya to the return home.

This should be a complete, coherent game, not just a demo.

### P0 Player Experience

- Third-person camera
- Linear story campaign with chapter-based progression
- Light exploration, combat, and traversal
- Short in-engine cutscenes at key story moments
- Local save system with autosaves and manual save slots
- Approximate playtime target: 3 to 5 hours

### P0 Story Structure

#### Chapter 1: Ayodhya

- Introduce Dasharatha, Rama, Lakshmana, Sita, and the royal setting
- Establish court life, family relationships, and Rama's duty
- End with Kaikeyi's demand and the exile decision

#### Chapter 2: Forest Exile

- Explore the forest with Rama and Lakshmana
- Protect sages and defeat early rakshasa enemies
- Show quieter camp moments with Sita to build emotional grounding

#### Chapter 3: The Abduction

- Surpanakha and the chain of events that leads to Maricha's deception
- Rama and Lakshmana are pulled away
- Ravana abducts Sita in a major cinematic turning point

#### Chapter 4: Kishkindha Alliance

- Rama meets Hanuman and Sugriva
- A condensed alliance chapter focused on trust, loyalty, and preparation
- Optional short boss or duel sequence tied to this chapter

#### Chapter 5: Hanuman's Lanka Mission

- Play as Hanuman
- Traversal-heavy gameplay, infiltration, and discovery of Sita in Lanka
- End with destruction/sabotage set piece and a strong transition into war

#### Chapter 6: War for Lanka

- Bridge crossing, battlefield progression, elite enemy encounters, and major bosses
- Final Ravana battle as the climax
- End with recovery of Sita and the return to Ayodhya

### P0 Playable Characters

#### Rama

- Main playable hero
- Sword or melee attacks, bow combat, defensive movement, and limited divine abilities

#### Lakshmana

- Secondary playable hero in selected sections
- Faster and more aggressive than Rama
- Best used for short combat-driven sequences rather than full campaign leadership

#### Hanuman

- Major alternate hero for traversal and power moments
- Long jumps, heavy strikes, crowd control, environmental interaction

### P0 Core Gameplay Systems

#### Combat

- Light melee combo system
- Bow aiming and ranged attacks
- Dodge and simple block/parry mechanic
- Special mythic ability per hero
- Lock-on for boss fights and elite enemies

#### Exploration

- Linear levels with side paths for pickups and lore
- Small platforming/traversal sections
- Environmental storytelling rather than a large open world

#### Companions

- Simple AI companions
- Follow, assist, and contextual story actions
- No deep squad tactics in P0

#### Narrative Delivery

- Chapter intro cards
- In-engine cutscenes
- Dialogue scenes before and after major missions
- Short codex/journal for story recap

#### Save System

- Autosave at chapter start
- Checkpoint save before major encounters
- Manual save at shrines, camps, or chapter hubs
- Continue from latest save on title screen

### P0 Enemy and Boss Scope

Enemy archetypes:

- Basic rakshasa melee enemy
- Ranged demon enemy
- Heavy brute enemy
- Fast scout or assassin enemy

Boss scope:

- 3 to 4 meaningful boss encounters across the campaign
- Ravana must be the final multi-phase boss
- One Hanuman-focused or alliance-era boss to vary pacing

### P0 Visual and Audio Target

- Stylized 3D visuals
- Mid-detail character models
- Hand-painted or painterly texture direction
- Strong silhouettes and readable combat effects
- Simple but polished cutscene framing
- Music and narration used to carry epic tone without huge cinematic cost

### P0 Out of Scope

- Open world exploration across all of India and Lanka
- Branching story paths
- Large skill trees or loot systems
- Fully dynamic party control
- AAA facial animation or motion capture pipeline
- Large number of side quests

### P0 Success Criteria

- The full Ramayana arc is playable from beginning to end
- Rama, Lakshmana, and Hanuman all feel distinct
- The core combat loop is fun enough to sustain a full campaign
- The story is understandable even in condensed form
- Save/load works reliably

## P1: Expanded Cinematic Edition

### P1 Goal

Expand the P0 game into a richer and more visually impressive version without losing the clean story structure.

P1 is where the game becomes broader, deeper, and more polished.

### P1 Expansion Areas

#### Visual Fidelity

- Higher quality character models and animations
- Better materials, lighting, atmosphere, and VFX
- More detailed Ayodhya, forest, Kishkindha, and Lanka environments
- Stronger facial performance in cutscenes

#### Story Expansion

- Add more life to Ayodhya before the exile
- Expand Mithila and the marriage sequence if desired
- Add more forest incidents and emotional camp scenes
- Deepen Kishkindha politics and the Hanuman-Rama bond
- Expand the return to Ayodhya into a stronger ending chapter

#### Gameplay Expansion

- More combat depth with combo branches, upgrades, and hero-specific skills
- More traversal options, especially for Hanuman
- Better companion coordination and team attacks
- More enemy variety and encounter types
- More meaningful boss mechanics and multi-stage fights

#### World Structure

- Larger chapter hubs
- Optional side paths, shrines, lore pickups, and challenge encounters
- Greater sense of place without turning the game into an open world

#### Narrative Systems

- More cutscenes and stronger transitions between chapters
- Character journal/codex expansion
- Optional narrator voiceover or chapter recaps

#### Save and Meta Systems

- More save slots
- Chapter replay
- Collectibles and completion tracking
- Difficulty settings and accessibility polish

### P1 Playable Character Expansion

Possible additions:

- More playable Lakshmana sections
- Short Sita-focused narrative or stealth sequences
- Short Bharata perspective chapter for emotional contrast
- Optional special mission chapters centered on vanara allies

These should only be added if they strengthen pacing and do not distract from Rama's central role.

### P1 Boss and Encounter Expansion

- More named mythic encounters across the journey
- Stronger battlefield scripting during the Lanka war
- Multi-phase Ravana fight with more spectacle
- Hero-specific boss interactions to reinforce character identity

### P1 Experience Target

- Approximate playtime target: 8 to 12 hours
- More polished action-adventure feel
- Stronger replay value through chapter replay, optional challenges, and collectible lore

## Production Recommendation

### Step 1: Preproduction

- Lock art direction
- Lock engine choice
- Define camera, controls, and hero combat identities
- Write condensed story script for P0

### Step 2: Vertical Slice

Build one polished sample chapter that proves:

- Third-person movement and camera
- Rama combat
- One companion
- One short cutscene
- One boss or elite encounter
- Save/load flow

Best candidate: Forest Exile or Hanuman in Lanka

### Step 3: Build P0

- Finish the full condensed campaign
- Implement chapter saves and core content pipeline
- Balance story pacing and combat variety

### Step 4: Build P1

- Upgrade assets and presentation
- Expand chapters and encounter variety
- Improve combat depth and cinematic quality

## Final Scope Principle

P0 should be the smallest version that feels like a real Ramayana game.

P1 should make that game richer, not replace it with an unfinishable dream scope.
