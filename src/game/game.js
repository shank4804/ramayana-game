import * as THREE from 'three';
import { createRenderer } from '../core/renderer.js';
import { Input } from '../core/input.js';
import { Colliders } from '../core/collision.js';
import { hasSave, readSave, writeSave, clearSave } from '../core/save.js';
import { buildWorld } from './world.js';
import { Player, FollowCamera } from './player.js';
import { Enemy } from './enemy.js';
import { Combat } from './combat.js';
import { CutscenePlayer } from './cutscene.js';
import { HUD } from './hud.js';
import { CHAPTERS, ENDING } from './story.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.renderer = createRenderer();
    root.prepend(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x98b5df, 90, 320);
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.clock = new THREE.Clock();

    this.colliders = new Colliders(200);
    buildWorld(this.scene, this.colliders);

    this.input = new Input(this.renderer.domElement);
    this.hud = new HUD();
    this.combat = new Combat(this.scene, this.colliders);
    this.player = new Player(this.scene, new THREE.Vector3(-138, 0, -8));
    this.followCam = new FollowCamera(this.camera);

    this.cutscenes = new CutscenePlayer(this.camera, {
      letterboxTop: document.getElementById('letterbox-top'),
      letterboxBottom: document.getElementById('letterbox-bottom'),
      subtitle: document.getElementById('subtitle'),
      subtitleSpeaker: document.getElementById('subtitle-speaker'),
      subtitleText: document.getElementById('subtitle-text'),
      hint: document.getElementById('cutscene-hint'),
    });

    // Objective marker
    this.marker = this._buildMarker();
    this.scene.add(this.marker);

    this.state = 'title';      // title | cutscene | play | end
    this.chapterIndex = 0;
    this.missionPhase = 'travel'; // travel | combat
    this.enemies = [];

    this._bindUI();
    this._bindCombatKeys();
    this._showTitle();
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._loop();
  }

  // ---------- UI ----------

  _bindUI() {
    this.titleScreen = document.getElementById('title-screen');
    this.endScreen = document.getElementById('end-screen');
    const btnNew = document.getElementById('btn-new');
    const btnContinue = document.getElementById('btn-continue');
    const btnHelp = document.getElementById('btn-help');
    const helpPanel = document.getElementById('help-panel');

    btnNew.addEventListener('click', () => this.startNewGame());
    btnContinue.addEventListener('click', () => this.continueGame());
    btnHelp.addEventListener('click', () => helpPanel.classList.remove('hidden'));
    document.getElementById('btn-help-close')
      .addEventListener('click', () => helpPanel.classList.add('hidden'));
    document.getElementById('btn-end-primary')
      .addEventListener('click', () => this._endPrimary());

    // Keyboard menu navigation
    this._menuIndex = 0;
    window.addEventListener('keydown', (e) => {
      if (this.state !== 'title' || !helpPanel.classList.contains('hidden')) return;
      const buttons = [btnNew, btnContinue, btnHelp].filter((b) => !b.disabled);
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this._menuIndex = (this._menuIndex + 1) % buttons.length;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this._menuIndex = (this._menuIndex - 1 + buttons.length) % buttons.length;
      } else if (e.code === 'Enter') {
        buttons[this._menuIndex]?.click();
        return;
      } else {
        return;
      }
      buttons.forEach((b, i) => b.classList.toggle('focused', i === this._menuIndex));
    });
  }

  _bindCombatKeys() {
    window.addEventListener('keydown', (e) => {
      if (this.state !== 'play') return;
      if (e.code === 'Space') this.player.dodge();
    });
    window.addEventListener('mousedown', (e) => {
      if (this.state !== 'play') return;
      if (e.button === 0) {
        if (this.player.aiming) {
          this.combat.fireArrow(this.player, this.camera);
        } else {
          const hits = this.combat.swordAttack(this.player, this.enemies);
          if (hits > 0) this.hud.toast(`Sword strike — ${hits} hit${hits > 1 ? 's' : ''}`);
        }
      }
    });
  }

  _showTitle() {
    this.state = 'title';
    this.input.releaseLock();
    this.titleScreen.classList.remove('hidden');
    this.endScreen.classList.add('hidden');
    this.hud.hide();
    document.getElementById('btn-continue').disabled = !hasSave();
    // Idle title camera drifts over Ayodhya.
    this.camera.position.set(-170, 22, 36);
    this.camera.lookAt(-120, 6, -30);
  }

  _buildMarker() {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.2, 12, 40),
      new THREE.MeshStandardMaterial({
        color: 0xf0c66b, emissive: 0x8d5f12, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.3,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 1, 13, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd37c, transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
    );
    beam.position.y = 6.5;
    group.add(beam);
    group.visible = false;
    return group;
  }

  // ---------- game flow ----------

  startNewGame() {
    clearSave();
    this.chapterIndex = 0;
    this._startChapter(0);
  }

  continueGame() {
    const save = readSave();
    const index = Math.min(save?.chapterIndex ?? 0, CHAPTERS.length - 1);
    this._startChapter(index);
  }

  _startChapter(index) {
    this.chapterIndex = index;
    const chapter = CHAPTERS[index];
    this.titleScreen.classList.add('hidden');
    this.endScreen.classList.add('hidden');
    this.hud.hide();
    this._clearEnemies();
    this.combat.clear();

    // Position the player before the cutscene so the world reads right.
    this.player.group.position.set(chapter.mission.spawn[0], 0, chapter.mission.spawn[1]);
    this.player.hp = this.player.maxHp;
    this.player.velocity.set(0, 0, 0);

    this.state = 'cutscene';
    this.input.releaseLock();
    this.cutscenes.play(chapter.cutscene, () => this._beginMission());
  }

  _beginMission() {
    const chapter = CHAPTERS[this.chapterIndex];
    this.state = 'play';
    this.missionPhase = 'travel';

    this.hud.show();
    this.hud.setChapter(`Chapter ${this.chapterIndex + 1} — ${chapter.title}`);
    this.hud.setObjective(chapter.mission.objective);
    this.hud.setHealth(this.player.hp, this.player.maxHp);
    this.hud.setEnemies(0);
    this.hud.splash(`Chapter ${this.chapterIndex + 1}`, chapter.title);

    this.marker.visible = true;
    this.marker.position.set(chapter.mission.marker[0], 0.3, chapter.mission.marker[1]);

    // Reset follow camera behind the player.
    this.followCam.yaw = this.player.group.rotation.y + Math.PI;
    writeSave({ chapterIndex: this.chapterIndex });
  }

  _enterCombat() {
    const chapter = CHAPTERS[this.chapterIndex];
    this.missionPhase = 'combat';
    this.marker.visible = false;
    for (const [type, pos] of chapter.mission.enemies) {
      this.enemies.push(new Enemy(this.scene, type, pos));
    }
    this.hud.setObjective(`Defeat the enemies — ${chapter.title}`);
    this.hud.toast('Enemies ahead!');
  }

  _completeChapter() {
    if (this.missionPhase === 'done') return;
    this.missionPhase = 'done';
    const chapter = CHAPTERS[this.chapterIndex];
    this.hud.toast(chapter.completion);
    this.marker.visible = false;
    this._clearEnemies();
    this.combat.clear();

    const next = this.chapterIndex + 1;
    if (next >= CHAPTERS.length) {
      clearSave();
      this.state = 'cutscene';
      this.hud.hide();
      this.input.releaseLock();
      this.cutscenes.play(ENDING, () => this._showEnd(
        'Victory', 'The Road Home',
        'Ravana has fallen and Sita walks free. Fourteen years end where they began — at the gates of Ayodhya, beneath ten thousand lamps.',
        'Return to Title',
      ));
    } else {
      setTimeout(() => this._startChapter(next), 1600);
    }
  }

  _showEnd(eyebrow, title, body, button) {
    this.state = 'end';
    this.hud.hide();
    this.input.releaseLock();
    document.getElementById('end-eyebrow').textContent = eyebrow;
    document.getElementById('end-title').textContent = title;
    document.getElementById('end-body').textContent = body;
    document.getElementById('btn-end-primary').textContent = button;
    this.endScreen.classList.remove('hidden');
  }

  _endPrimary() {
    if (this._diedThisRun) {
      this._diedThisRun = false;
      this._startChapter(this.chapterIndex);
    } else {
      this._showTitle();
    }
  }

  _onPlayerDeath() {
    this._diedThisRun = true;
    this._showEnd(
      'Fallen', 'Rama Has Fallen',
      'The journey does not end here. Rise and take the chapter again.',
      'Retry Chapter',
    );
  }

  _clearEnemies() {
    for (const enemy of this.enemies) enemy.dispose();
    this.enemies = [];
  }

  _damagePlayer(amount) {
    if (!this.player.takeDamage(amount)) return;
    this.hud.setHealth(this.player.hp, this.player.maxHp);
    this.hud.toast(`Rama takes ${amount} damage`);
    if (this.player.hp <= 0) this._onPlayerDeath();
  }

  // ---------- loop ----------

  _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state === 'cutscene') {
      this.cutscenes.update(dt);
    } else if (this.state === 'play') {
      this._updatePlay(dt);
    } else if (this.state === 'title') {
      // Slow drift on the title backdrop.
      this.camera.position.x += Math.sin(this.clock.elapsedTime * 0.1) * 0.01;
    }

    this.hud.update(dt);
    this.marker.rotation.y += dt;
    this.renderer.render(this.scene, this.camera);
  }

  _updatePlay(dt) {
    const chapter = CHAPTERS[this.chapterIndex];

    this.player.aiming = this.input.mouse.has(2);
    this.hud.setAiming(this.player.aiming);

    this.followCam.applyInput(this.input, dt);
    this.player.update(dt, this.input, this.followCam.yaw, this.colliders);
    this.followCam.update(dt, this.player.group.position, this.player.aiming);

    const ctx = {
      targetPos: this.player.group.position,
      colliders: this.colliders,
      inCombat: this.missionPhase === 'combat',
      damagePlayer: (amount) => this._damagePlayer(amount),
      spawnOrb: (enemy) => this.combat.spawnOrb(enemy, this.player.group.position),
    };
    for (const enemy of this.enemies) enemy.update(dt, ctx);
    this.combat.update(dt, this.enemies, this.player, (amount) => this._damagePlayer(amount));

    const alive = this.enemies.filter((e) => e.alive).length;
    this.hud.setEnemies(alive);
    this.hud.setHealth(this.player.hp, this.player.maxHp);

    if (this.missionPhase === 'travel') {
      const m = chapter.mission;
      const distance = this.player.group.position
        .distanceTo(new THREE.Vector3(m.marker[0], 0, m.marker[1]));
      if (distance <= m.radius) {
        if (m.enemies.length === 0) {
          this._completeChapter();
        } else {
          this._enterCombat();
        }
      }
    } else if (this.missionPhase === 'combat' && alive === 0 && this.enemies.length > 0) {
      this._completeChapter();
    }
  }
}
