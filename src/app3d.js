import * as THREE from '../node_modules/three/build/three.module.js';
import { hasSave, writeSave, readSave, clearSave, loadSettings, saveSettings } from './engine/save.js';
import { InputState } from './engine/input.js';
import { ColliderRegistry } from './engine/collision.js';
import { createRenderer } from './engine/renderer.js';
import { installLighting } from './engine/lighting.js';
import { updateThirdPersonCamera } from './engine/camera.js';
import * as decor from './world/decor.js';
import { World } from './world/world.js';
import { createEnemy, updateEnemies, clearEnemies, spawnMissionEnemies } from './entities/enemy.js';
import { createChariot, updateChariot, enterChariot, exitChariot } from './entities/chariot.js';
import { createPlayer, updatePlayer, updatePlayerAnimation, doDodge, damagePlayer } from './entities/player.js';
import { doSwordAttack } from './combat/sword.js';
import { fireArrow, spawnEnemyOrb, updateProjectiles, updateEnemyProjectiles } from './combat/bow.js';
import { HUD } from './ui/hud.js';

const WORLD_LIMIT = 210;
const PLAYER_RADIUS = 1.1;
const VEHICLE_RADIUS = 2.55;
const TMP_A = new THREE.Vector3();
const TMP_B = new THREE.Vector3();

const MISSION_ORDER = [
  {
    id: 'ayodhya',
    chapter: 'Ayodhya',
    title: 'The Eastern Gate',
    objective: 'Take the royal chariot through the eastern gate and leave Ayodhya behind.',
    marker: new THREE.Vector3(-90, 0, -8),
    spawn: new THREE.Vector3(-148, 0, -16),
    vehicleSpawn: new THREE.Vector3(-138, 0, -10),
    vehicleYaw: Math.PI / 2,
    radius: 14,
    requiresVehicle: true,
    intro: [
      "Dasharatha's capital still shines behind Rama.",
      'The exile begins on the road out of Ayodhya, not in a menu screen.',
    ],
    completion: 'The walls of Ayodhya fade behind the chariot. The forest now owns the road ahead.',
    enemies: [],
  },
  {
    id: 'forest',
    chapter: 'Forest Exile',
    title: 'Rakshasas in the Woods',
    objective: 'Reach the forest clearing and defeat the rakshasas threatening the exile camp.',
    marker: new THREE.Vector3(-26, 0, 54),
    spawn: new THREE.Vector3(-68, 0, 18),
    vehicleSpawn: new THREE.Vector3(-58, 0, 10),
    vehicleYaw: 0.48,
    radius: 15,
    intro: [
      'The road narrows into the forest and danger stops hiding.',
      'Rama must secure the camp before exile can become a life.',
    ],
    completion: 'The clearing is safe for a moment, but the exile is far from over.',
    enemies: [
      { type: 'rakshasa', position: [-12, 0, 60] },
      { type: 'rakshasa', position: [-30, 0, 68] },
      { type: 'rakshasa', position: [-44, 0, 50] },
    ],
  },
  {
    id: 'abduction',
    chapter: 'The Abduction',
    title: 'The Broken Camp',
    objective: 'Push deeper into the ruined grove and survive Ravana’s ambush.',
    marker: new THREE.Vector3(36, 0, 18),
    spawn: new THREE.Vector3(-6, 0, 46),
    vehicleSpawn: new THREE.Vector3(8, 0, 34),
    vehicleYaw: -0.18,
    radius: 15,
    intro: [
      'A false lure has drawn Rama away from camp.',
      'When he returns, the clearing is broken and the pursuit begins.',
    ],
    completion: 'Sita is gone. The forest is no longer a refuge but a trail to war.',
    enemies: [
      { type: 'rakshasa', position: [18, 0, 14] },
      { type: 'rakshasa', position: [32, 0, 32] },
      { type: 'guard', position: [52, 0, 16] },
    ],
  },
  {
    id: 'kishkindha',
    chapter: 'Kishkindha',
    title: 'Alliance on the Heights',
    objective: 'Climb into Kishkindha and defeat the challengers blocking Sugriva’s alliance.',
    marker: new THREE.Vector3(76, 0, -58),
    spawn: new THREE.Vector3(26, 0, 12),
    vehicleSpawn: new THREE.Vector3(18, 0, 2),
    vehicleYaw: -1.26,
    radius: 16,
    intro: [
      'In the rocky heights, grief finally meets help.',
      'Hanuman and Sugriva become allies only after strength is proven.',
    ],
    completion: 'The alliance is sealed. Lanka is no longer beyond reach.',
    enemies: [
      { type: 'guard', position: [60, 0, -42] },
      { type: 'guard', position: [78, 0, -64] },
      { type: 'brute', position: [92, 0, -56] },
    ],
  },
  {
    id: 'lanka',
    chapter: 'Lanka',
    title: 'Break the Outer City',
    objective: 'Cross into Lanka, breach the outer district, and clear Ravana’s defenders.',
    marker: new THREE.Vector3(132, 0, 44),
    spawn: new THREE.Vector3(82, 0, -46),
    vehicleSpawn: new THREE.Vector3(94, 0, -54),
    vehicleYaw: 0.92,
    radius: 17,
    intro: [
      'The sea has been crossed. Lanka rises ahead in red stone and fire.',
      'This is no corridor. You enter the enemy city from the street.',
    ],
    completion: 'The outer district falls. Ravana’s palace stands exposed.',
    enemies: [
      { type: 'guard', position: [116, 0, 34] },
      { type: 'guard', position: [128, 0, 58] },
      { type: 'guard', position: [142, 0, 40] },
      { type: 'rakshasa', position: [150, 0, 56] },
    ],
  },
  {
    id: 'ravana',
    chapter: 'War for Lanka',
    title: 'Ravana’s Last Court',
    objective: 'Advance into the throne court and defeat Ravana.',
    marker: new THREE.Vector3(158, 0, 114),
    spawn: new THREE.Vector3(126, 0, 42),
    vehicleSpawn: new THREE.Vector3(114, 0, 34),
    vehicleYaw: 1.58,
    radius: 18,
    intro: [
      'The final court opens ahead. Ravana waits at the heart of Lanka.',
      'This is the last fight between exile and homecoming.',
    ],
    completion: 'Ravana falls. The road now turns back toward Ayodhya and coronation.',
    enemies: [
      { type: 'guard', position: [144, 0, 100] },
      { type: 'guard', position: [168, 0, 100] },
      { type: 'rakshasa', position: [144, 0, 124] },
      { type: 'boss', position: [158, 0, 114] },
    ],
  },
];

const INTRO_SCENE = [
  {
    speaker: 'Narrator',
    text: 'Ayodhya stood at the height of Dasharatha’s reign, radiant, ordered, and full of promise.',
  },
  {
    speaker: 'Dasharatha',
    text: 'Rama, the weight of an old vow now falls on this house. The crown must wait. Exile cannot.',
  },
  {
    speaker: 'Kaikeyi',
    text: 'The promise was mine to call, and the kingdom must now honor it.',
  },
  {
    speaker: 'Sita',
    text: 'If the road leads you into the wild, it leads me there as well.',
  },
  {
    speaker: 'Lakshmana',
    text: 'Ayodhya can keep its walls. My place is at your side.',
  },
  {
    speaker: 'Narrator',
    text: 'So the prince steps away from the throne and into the journey that will cross forests, kingdoms, and war.',
  },
];

function damp(value, target, lambda, dt) {
  return THREE.MathUtils.lerp(value, target, 1 - Math.exp(-lambda * dt));
}

function shortestAngleDiff(current, target) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function dampAngle(current, target, lambda, dt) {
  return current + shortestAngleDiff(current, target) * (1 - Math.exp(-lambda * dt));
}

class Ramayana3DGame {
  constructor() {
    this.root = document.getElementById('app-root');
    this.chapterTitle = document.getElementById('chapter-title');
    this.objectiveText = document.getElementById('objective-text');
    this.healthFill = document.getElementById('health-fill');
    this.healthValue = document.getElementById('health-value');
    this.enemyValue = document.getElementById('enemy-value');
    this.modeValue = document.getElementById('mode-value');
    this.weaponValue = document.getElementById('weapon-value');
    this.speedValue = document.getElementById('speed-value');
    this.prompt = document.getElementById('prompt');
    this.radarCanvas = document.getElementById('radar');
    this.radarCtx = this.radarCanvas.getContext('2d');
    this.crosshair = document.getElementById('crosshair');
    this.overlay = document.getElementById('overlay');
    this.overlayEyebrow = document.getElementById('overlay-eyebrow');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlaySpeaker = document.getElementById('overlay-speaker');
    this.overlayBody = document.getElementById('overlay-body');
    this.overlayHint = document.getElementById('overlay-hint');
    this.menuButtons = document.getElementById('menu-buttons');
    this.menuNewGame = document.getElementById('menu-new-game');
    this.menuLoadGame = document.getElementById('menu-load-game');
    this.menuSettings = document.getElementById('menu-settings');
    this.menuExit = document.getElementById('menu-exit');
    this.settingsPanel = document.getElementById('settings-panel');
    this.sensitivityInput = document.getElementById('setting-sensitivity');
    this.qualityInput = document.getElementById('setting-quality');
    this.invertYInput = document.getElementById('setting-invert-y');
    this.overlayActions = document.getElementById('overlay-actions');
    this.primaryAction = document.getElementById('primary-action');
    this.secondaryAction = document.getElementById('secondary-action');
    this.toast = document.getElementById('toast');

    this.renderer = createRenderer();
    this.root.prepend(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa6c7f7);
    this.scene.fog = new THREE.Fog(0x98b5df, 90, 320);
    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.clock = new THREE.Clock();

    this.input = new InputState();
    this.keys = this.input.keys;
    this.mouseButtons = this.input.mouseButtons;
    this.pointer = this.input.pointer;
    this.uiMode = 'title';
    this.overlayMode = 'menu';
    this.menuIndex = 0;
    this.isAiming = false;
    this.cameraYaw = Math.PI * 1.08;
    this.cameraPitch = 0.38;
    this.cameraDistance = 7.4;
    this.currentCameraDistance = this.cameraDistance;
    this.vehicleCameraDistance = 10.2;

    this.colliderRegistry = new ColliderRegistry(WORLD_LIMIT);
    this.colliders = this.colliderRegistry.colliders;
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.decor = new THREE.Group();
    this.scene.add(this.decor);
    this.settings = this._loadSettings();

    this.player = createPlayer(MISSION_ORDER[0].spawn);
    this.scene.add(this.player.group);

    this.vehicle = createChariot(MISSION_ORDER[0].vehicleSpawn, MISSION_ORDER[0].vehicleYaw);
    this.scene.add(this.vehicle.group);

    this.marker = this._createMissionMarker();
    this.scene.add(this.marker);

    this.missionIndex = 0;
    this.activeMission = MISSION_ORDER[0];
    this.missionState = 'travel';

    this._buildWorld();
    this._syncSettingsUI();
    this._applySettings();
    this.hud = new HUD({
      chapterTitle: this.chapterTitle,
      objectiveText: this.objectiveText,
      healthFill: this.healthFill,
      healthValue: this.healthValue,
      enemyValue: this.enemyValue,
      modeValue: this.modeValue,
      weaponValue: this.weaponValue,
      speedValue: this.speedValue,
      prompt: this.prompt,
      radarCanvas: this.radarCanvas,
      radarCtx: this.radarCtx,
      toastEl: this.toast,
    });

    this._bindEvents();
    this._showTitle();
    this._updateHUD();
    this._animate();
  }

  _loadSettings() {
    return loadSettings();
  }

  _saveSettings() {
    saveSettings(this.settings);
  }

  _syncSettingsUI() {
    this.sensitivityInput.value = String(this.settings.lookSensitivity);
    this.qualityInput.value = this.settings.quality;
    this.invertYInput.checked = this.settings.invertLookY;
  }

  _applySettings() {
    const quality = this.settings.quality;
    const pixelRatio = quality === 'medium'
      ? Math.min(window.devicePixelRatio, 1.2)
      : quality === 'epic'
        ? Math.min(window.devicePixelRatio, 2.1)
        : Math.min(window.devicePixelRatio, 1.6);

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.toneMappingExposure = quality === 'epic' ? 1.14 : quality === 'medium' ? 0.98 : 1.05;

    if (this.sun) {
      const shadowSize = quality === 'medium' ? 1024 : quality === 'epic' ? 2048 : 1536;
      this.sun.shadow.mapSize.set(shadowSize, shadowSize);
    }
  }



  _createMissionMarker() {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.2, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0xf0c66b, emissive: 0x8d5f12, emissiveIntensity: 0.6, metalness: 0.74, roughness: 0.3 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.receiveShadow = true;
    group.add(ring);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 1, 14, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd37c, transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
    );
    beam.position.y = 7;
    group.add(beam);

    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 2.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xffe3a9, emissive: 0x946518, emissiveIntensity: 0.75 }),
    );
    arrow.position.y = 10.6;
    arrow.castShadow = true;
    group.add(arrow);

    return group;
  }

  _buildWorld() {
    this.lighting = installLighting(this.scene);
    this.sun = this.lighting.sun;
    this.world = new World();
    this.world.build(this.scene, this.colliderRegistry, this.decor);
  }

  _addGroundPatch(x, z, width, depth, color) { decor.addGroundPatch(this.scene, this.colliderRegistry, x, z, width, depth, color); }
  _addRoad(x, z, width, depth, color) { decor.addRoad(this.scene, this.colliderRegistry, x, z, width, depth, color); }
  _addLaneMark(x, z, width, depth) { decor.addLaneMark(this.scene, this.colliderRegistry, x, z, width, depth); }
  _addBuilding(x, z, width, depth, height, wallColor, roofColor, solid) { decor.addBuilding(this.scene, this.colliderRegistry, x, z, width, depth, height, wallColor, roofColor, solid); }
  _addWall(x, z, width, depth, height, color) { decor.addWall(this.scene, this.colliderRegistry, x, z, width, depth, height, color); }
  _addGateArch(x, z) { decor.addGateArch(this.scene, this.colliderRegistry, x, z); }
  _addTower(x, z, radius, height, wallColor, roofColor) { decor.addTower(this.scene, this.colliderRegistry, x, z, radius, height, wallColor, roofColor); }
  _addStreetLamp(x, z) { decor.addStreetLamp(this.scene, this.colliderRegistry, x, z); }
  _addTorch(x, z) { decor.addTorch(this.scene, this.colliderRegistry, x, z); }
  _addTree(x, z, radius, height) { decor.addTree(this.scene, this.colliderRegistry, x, z, radius, height); }
  _addRock(x, z, size, color) { decor.addRock(this.scene, this.colliderRegistry, x, z, size, color); }
  _addRuin(x, z, width, depth, height) { decor.addRuin(this.scene, this.colliderRegistry, x, z, width, depth, height); }
  _addBridge(x, z, width, depth) { decor.addBridge(this.scene, this.colliderRegistry, x, z, width, depth); }
  _addBanner(x, z, color) { decor.addBanner(this.scene, this.colliderRegistry, x, z, color); }

  _registerCollider(x, z, width, depth, padding = 0) {
    return this.colliderRegistry.register(x, z, width, depth, padding);
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._handleResize());
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseButtons.clear();
    });

    window.addEventListener('keydown', event => {
      if (event.repeat && ['KeyF', 'KeyJ', 'KeyK', 'Space', 'Enter'].includes(event.code)) return;
      this.keys.add(event.code);

      if (this.uiMode === 'title') {
        this._handleTitleKey(event);
        return;
      }

      if (this.uiMode === 'cutscene') {
        if (event.code === 'Enter' || event.code === 'Space') this._advanceOverlay();
        if (event.code === 'Escape') this._secondaryOverlayAction();
        return;
      }

      if (this.uiMode !== 'playing') return;

      if (event.code === 'KeyF') this._toggleVehicle();
      if (event.code === 'KeyJ') this._doSwordAttack();
      if (event.code === 'KeyK') this._fireArrow();
      if (event.code === 'Space') this._doDodge();
    });

    window.addEventListener('keyup', event => {
      this.keys.delete(event.code);
    });

    this.renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
    this.renderer.domElement.addEventListener('mousedown', event => {
      if (this.uiMode !== 'playing') return;
      this.mouseButtons.add(event.button);
      if (document.pointerLockElement !== this.renderer.domElement) {
        this.renderer.domElement.requestPointerLock?.();
      }

      if (event.button === 0 && !this.player.inVehicle) {
        if (this.isAiming) {
          this._fireArrow();
        } else {
          this._doSwordAttack();
        }
      }

      if (document.pointerLockElement !== this.renderer.domElement) {
        this.pointer.dragging = true;
        this.pointer.lastX = event.clientX;
        this.pointer.lastY = event.clientY;
      }
    });

    window.addEventListener('mouseup', event => {
      this.mouseButtons.delete(event.button);
      this.pointer.dragging = false;
    });

    window.addEventListener('mousemove', event => {
      if (this.uiMode !== 'playing') return;

      const sensitivity = this.settings.lookSensitivity;
      const invert = this.settings.invertLookY ? 1 : -1;

      if (document.pointerLockElement === this.renderer.domElement) {
        this.cameraYaw -= event.movementX * 0.0028 * sensitivity;
        this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + event.movementY * 0.0022 * sensitivity * invert, 0.16, 0.76);
        return;
      }

      if (!this.pointer.dragging) return;
      const dx = event.clientX - this.pointer.lastX;
      const dy = event.clientY - this.pointer.lastY;
      this.pointer.lastX = event.clientX;
      this.pointer.lastY = event.clientY;
      this.cameraYaw -= dx * 0.006 * sensitivity;
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + dy * 0.004 * sensitivity * invert, 0.16, 0.76);
    });

    this.renderer.domElement.addEventListener('wheel', event => {
      const min = this.player.inVehicle ? 8 : 5.6;
      const max = this.player.inVehicle ? 13.5 : 11.2;
      this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + event.deltaY * 0.01, min, max);
    });

    document.addEventListener('pointerlockchange', () => {
      this.root.classList.toggle('pointer-locked', document.pointerLockElement === this.renderer.domElement);
    });

    this.menuNewGame.addEventListener('click', () => this._startNewGame());
    this.menuLoadGame.addEventListener('click', () => this._continueGame());
    this.menuSettings.addEventListener('click', () => this._showSettingsMenu());
    this.menuExit.addEventListener('click', () => this._attemptExitGame());
    this.sensitivityInput.addEventListener('input', () => {
      this.settings.lookSensitivity = Number(this.sensitivityInput.value);
      this._saveSettings();
    });
    this.qualityInput.addEventListener('change', () => {
      this.settings.quality = this.qualityInput.value;
      this._applySettings();
      this._saveSettings();
    });
    this.invertYInput.addEventListener('change', () => {
      this.settings.invertLookY = this.invertYInput.checked;
      this._saveSettings();
    });
    this.primaryAction.addEventListener('click', () => this._advanceOverlay());
    this.secondaryAction.addEventListener('click', () => this._secondaryOverlayAction());
  }

  _handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._applySettings();
  }

  _handleTitleKey(event) {
    if (this.overlayMode === 'settings') {
      if (event.code === 'Escape' || event.code === 'Enter') {
        this._showTitleMenu();
      }
      return;
    }

    if (this.overlayMode !== 'menu') {
      if (event.code === 'Enter' || event.code === 'Space') this._advanceOverlay();
      if (event.code === 'Escape') this._secondaryOverlayAction();
      return;
    }

    const buttons = this._menuButtons();
    if (buttons.length === 0) return;

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      event.preventDefault();
      this.menuIndex = (this.menuIndex + 1) % buttons.length;
      this._focusMenuButton();
      return;
    }

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      this.menuIndex = (this.menuIndex - 1 + buttons.length) % buttons.length;
      this._focusMenuButton();
      return;
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      buttons[this.menuIndex]?.click();
    }
  }

  _menuButtons() {
    return [this.menuNewGame, this.menuLoadGame, this.menuSettings, this.menuExit]
      .filter(button => !button.disabled);
  }

  _focusMenuButton() {
    [this.menuNewGame, this.menuLoadGame, this.menuSettings, this.menuExit].forEach(button => {
      button.classList.remove('is-active');
    });
    const buttons = this._menuButtons();
    const clampedIndex = THREE.MathUtils.clamp(this.menuIndex, 0, Math.max(buttons.length - 1, 0));
    this.menuIndex = clampedIndex;
    buttons.forEach((button, index) => {
      button.classList.toggle('is-active', index === this.menuIndex);
    });
  }

  _showTitle() {
    this._showTitleMenu();
  }

  _showTitleMenu() {
    this.uiMode = 'title';
    this.overlayMode = 'menu';
    this.menuLoadGame.disabled = !this._hasSave();
    this._focusMenuButton();
    this._showOverlay({
      eyebrow: 'Ramayana 3D',
      title: 'The Exile of Rama',
      body: 'A story-driven third-person action prototype. Start a new journey from Ayodhya, continue from your autosave, or tune the presentation before entering the world.',
      showMenu: true,
      showActions: false,
      hint: null,
    });
  }

  _showSettingsMenu() {
    this.uiMode = 'title';
    this.overlayMode = 'settings';
    this._syncSettingsUI();
    this._showOverlay({
      eyebrow: 'Settings',
      title: 'Presentation And Camera',
      body: 'Tune look sensitivity, graphics quality, and look inversion before re-entering the world.',
      showSettings: true,
      primary: 'Back To Menu',
      secondary: null,
      primaryAction: () => this._showTitleMenu(),
      secondaryAction: null,
      hint: null,
    });
  }

  _attemptExitGame() {
    window.close();
    this._toast('Close the browser tab to exit the build');
  }

  _showOverlay({
    eyebrow,
    title,
    body,
    primary,
    secondary,
    primaryAction,
    secondaryAction,
    speaker = null,
    hint = 'Enter or click to continue',
    showMenu = false,
    showSettings = false,
    showActions = true,
  }) {
    document.exitPointerLock?.();
    this.overlay.classList.remove('hidden');
    this.overlayEyebrow.textContent = eyebrow;
    this.overlayTitle.textContent = title;
    this.overlayBody.textContent = body;
    this.overlaySpeaker.textContent = speaker || '';
    this.overlaySpeaker.classList.toggle('hidden', !speaker);
    this.overlayHint.textContent = hint || '';
    this.overlayHint.classList.toggle('hidden', !hint);
    this.menuButtons.classList.toggle('hidden', !showMenu);
    this.settingsPanel.classList.toggle('hidden', !showSettings);
    this.overlayActions.classList.toggle('hidden', !showActions);
    this.primaryAction.textContent = primary || 'Continue';
    this.secondaryAction.classList.toggle('hidden', !secondary || !showActions);
    if (secondary && showActions) this.secondaryAction.textContent = secondary;
    this._overlayPrimaryAction = primaryAction || null;
    this._overlaySecondaryAction = secondaryAction || null;
  }

  _closeOverlay() {
    this.overlay.classList.add('hidden');
  }

  _advanceOverlay() {
    if (typeof this._overlayPrimaryAction === 'function') this._overlayPrimaryAction();
  }

  _secondaryOverlayAction() {
    if (typeof this._overlaySecondaryAction === 'function') this._overlaySecondaryAction();
  }

  _normalizeSceneLine(line) {
    if (typeof line === 'string') {
      return { speaker: 'Narrator', text: line };
    }
    return {
      speaker: line.speaker || 'Narrator',
      text: line.text || '',
    };
  }

  _renderSceneLine(line) {
    this.overlaySpeaker.textContent = line.speaker;
    this.overlaySpeaker.classList.toggle('hidden', !line.speaker);
    this.overlayBody.textContent = line.text;
  }

  _playScene(eyebrow, title, lines, onDone) {
    this.overlayMode = 'scene';
    this.sceneLines = lines.map(line => this._normalizeSceneLine(line));
    this.sceneOnDone = onDone;
    this.uiMode = 'cutscene';
    this._showOverlay({
      eyebrow,
      title,
      body: this.sceneLines[0].text,
      speaker: this.sceneLines[0].speaker,
      primary: 'Continue',
      secondary: 'Skip',
      hint: 'Enter, Space, or click to continue',
      primaryAction: () => this._advanceSceneLine(),
      secondaryAction: () => {
        this.sceneLines = [];
        this._closeOverlay();
        if (this.sceneOnDone) this.sceneOnDone();
      },
    });
  }

  _advanceSceneLine() {
    this.sceneLines.shift();
    if (this.sceneLines.length === 0) {
      this._closeOverlay();
      if (this.sceneOnDone) this.sceneOnDone();
      return;
    }
    this._renderSceneLine(this.sceneLines[0]);
  }

  _startNewGame() {
    this._clearSave();
    this.missionIndex = 0;
    this.activeMission = MISSION_ORDER[0];
    this.missionState = 'travel';
    this._resetActorsForMission(this.activeMission);
    this.player.hp = this.player.maxHp;
    this._clearEnemies();
    this._setMarker(this.activeMission.marker, true);
    this._playScene('Prologue', 'The Exile Begins', INTRO_SCENE, () => {
      this._playScene(this.activeMission.chapter, this.activeMission.title, this.activeMission.intro, () => {
        this.uiMode = 'playing';
        this._updateHUD();
        this._saveGame();
      });
    });
  }

  _continueGame() {
    const save = this._loadSave();
    if (!save) {
      this._startNewGame();
      return;
    }

    this.missionIndex = THREE.MathUtils.clamp(save.missionIndex || 0, 0, MISSION_ORDER.length - 1);
    this.activeMission = MISSION_ORDER[this.missionIndex];
    this.missionState = save.missionState || 'travel';
    this._clearEnemies();
    this._restoreActorState(save);
    this._spawnMissionEnemies(save.enemies || null);
    this._setMarker(this.activeMission.marker, this.missionState === 'travel');
    this._closeOverlay();
    this.uiMode = 'playing';
    this._toast(`Continued: ${this.activeMission.chapter}`);
    this._updateHUD();
  }

  _resetActorsForMission(mission) {
    this._exitVehicle(true);
    this.player.group.position.copy(mission.spawn);
    this.player.group.rotation.set(0, mission.vehicleYaw || 0, 0);
    this.player.velocity.set(0, 0, 0);
    this.player.moveDir.set(0, 0, 1);
    this.player.attackTime = 0;
    this.player.bowPose = 0;
    this.player.dodgeTime = 0;

    this.vehicle.group.position.copy(mission.vehicleSpawn || mission.spawn.clone().add(new THREE.Vector3(8, 0, 0)));
    this.vehicle.group.rotation.y = mission.vehicleYaw || 0;
    this.vehicle.speed = 0;
    this.vehicle.steering = 0;
    this.vehicle.occupied = false;

    this.cameraYaw = this.vehicle.group.rotation.y + Math.PI * 0.95;
    this.cameraDistance = mission.requiresVehicle ? this.vehicleCameraDistance : 7.6;
  }

  _restoreActorState(save) {
    this.player.hp = Math.max(1, Math.min(this.player.maxHp, save.player?.hp ?? this.player.maxHp));
    this.player.velocity.set(0, 0, 0);
    this.player.group.visible = true;
    if (this.player.group.parent !== this.scene) this.scene.attach(this.player.group);
    this.player.group.position.set(save.player?.x ?? this.activeMission.spawn.x, 0, save.player?.z ?? this.activeMission.spawn.z);

    this.vehicle.group.position.set(
      save.vehicle?.x ?? (this.activeMission.vehicleSpawn?.x ?? this.activeMission.spawn.x + 8),
      0,
      save.vehicle?.z ?? (this.activeMission.vehicleSpawn?.z ?? this.activeMission.spawn.z),
    );
    this.vehicle.group.rotation.y = save.vehicle?.yaw ?? (this.activeMission.vehicleYaw || 0);
    this.vehicle.speed = save.vehicle?.speed ?? 0;
    this.vehicle.occupied = false;
    this.cameraYaw = save.cameraYaw ?? this.cameraYaw;
    this.cameraPitch = save.cameraPitch ?? this.cameraPitch;
    this.cameraDistance = save.cameraDistance ?? this.cameraDistance;

    if (save.player?.inVehicle) {
      this._enterVehicle();
    } else {
      this._exitVehicle(true);
    }
  }

  _setMarker(position, visible) {
    this.hud.setMarker(this.marker, position, visible);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this._update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  _update(dt) {
    this.hud.tick(dt);

    this._updateCamera(dt);
    this._updateRadar();

    if (this.uiMode !== 'playing') return;

    this.player.swordCooldown = Math.max(0, this.player.swordCooldown - dt);
    this.player.bowCooldown = Math.max(0, this.player.bowCooldown - dt);
    this.player.dodgeCooldown = Math.max(0, this.player.dodgeCooldown - dt);
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    this.player.attackTime = Math.max(0, this.player.attackTime - dt * 2.8);
    this.player.bowPose = Math.max(0, this.player.bowPose - dt * 2.4);
    this.player.dodgeTime = Math.max(0, this.player.dodgeTime - dt * 3.6);

    this.isAiming = !this.player.inVehicle && this.mouseButtons.has(2);
    this.crosshair.classList.toggle('hidden', !this.isAiming || this.uiMode !== 'playing');

    if (this.player.inVehicle) {
      this._updateVehicle(dt);
    } else {
      this._updatePlayer(dt);
    }

    this._updatePlayerAnimation(dt);
    this._updateProjectiles(dt);
    this._updateEnemyProjectiles(dt);
    this._updateEnemies(dt);
    this._updateMission(dt);
    this._updateInteractionPrompt();
    this._updateHUD();
  }

  _isPressed(...codes) {
    return this.input.isPressed(...codes);
  }

  _updatePlayer(dt) {
    updatePlayer(this.player, dt, {
      isPressed: (...codes) => this.input.isPressed(...codes),
      isAiming: this.isAiming,
      colliders: this.colliderRegistry,
      state: this,
    });
  }

  _updateVehicle(dt) {
    updateChariot(this.vehicle, dt, {
      isPressed: (...codes) => this.input.isPressed(...codes),
      colliders: this.colliderRegistry,
      state: this,
    });
  }

  _moveBody(position, delta, radius) {
    return this.colliderRegistry.moveBody(position, delta, radius);
  }

  _resolveCollisions(position, radius) {
    return this.colliderRegistry.resolveCollisions(position, radius);
  }

  _doDodge() {
    doDodge(this.player);
  }

  _doSwordAttack() {
    const result = doSwordAttack(this.player, this.enemies);
    if (!result.fired) return;
    this.weaponValue.textContent = 'Blade';
    if (result.hits > 0) this._toast(`Sword strike: ${result.hits} hit${result.hits > 1 ? 's' : ''}`);
    this._saveGame();
  }

  _fireArrow() {
    if (!fireArrow(this.player, this.camera, this.scene, this.projectiles)) return;
    this.weaponValue.textContent = 'Bow';
  }

  _spawnEnemyOrb(enemy) {
    spawnEnemyOrb(enemy, this._getCombatTargetPosition(), this.scene, this.enemyProjectiles);
  }

  _updateProjectiles(dt) {
    this.projectiles = updateProjectiles(this.projectiles, dt, {
      scene: this.scene,
      colliders: this.colliderRegistry,
      enemies: this.enemies,
    });
  }

  _updateEnemyProjectiles(dt) {
    this.enemyProjectiles = updateEnemyProjectiles(this.enemyProjectiles, dt, {
      scene: this.scene,
      colliders: this.colliderRegistry,
      targetPos: this._getCombatTargetPosition(),
      playerInVehicle: this.player.inVehicle,
      damagePlayer: amount => this._damagePlayer(amount),
    });
  }

  _pointHitsCollider(point, padding) {
    return this.colliderRegistry.pointHitsCollider(point, padding);
  }

  _updateEnemies(dt) {
    updateEnemies(this.enemies, dt, {
      missionState: this.missionState,
      playerInVehicle: this.player.inVehicle,
      colliders: this.colliderRegistry,
      getCombatTargetPosition: () => this._getCombatTargetPosition(),
      spawnEnemyOrb: enemy => this._spawnEnemyOrb(enemy),
      damagePlayer: amount => this._damagePlayer(amount),
    });
  }

  _damagePlayer(amount) {
    if (!damagePlayer(this.player, amount)) return;
    this._toast(`Rama takes ${amount} damage`);
    if (this.player.hp <= 0) {
      this._showOverlay({
        eyebrow: 'Fallen',
        title: 'Rama Has Fallen',
        body: 'This 3D build restarts from your latest autosave.',
        primary: 'Continue',
        secondary: 'Restart Journey',
        primaryAction: () => this._continueGame(),
        secondaryAction: () => this._startNewGame(),
      });
      this.uiMode = 'title';
    }
    this._saveGame();
  }

  _updateMission(dt) {
    this.marker.visible = this.missionState === 'travel';
    this.marker.rotation.y += dt * 1.1;
    this.marker.position.y = 0.35 + Math.sin(this.clock.elapsedTime * 2.4) * 0.14;
    this.marker.children[1].material.opacity = 0.2 + Math.sin(this.clock.elapsedTime * 3.1) * 0.05;
    this.marker.children[2].position.y = 10.6 + Math.sin(this.clock.elapsedTime * 3.1) * 0.35;

    const actorPos = this.player.inVehicle ? this.vehicle.group.position : this.player.group.position;
    if (this.missionState === 'travel') {
      const distance = actorPos.distanceTo(this.activeMission.marker);
      if (distance <= this.activeMission.radius) {
        if (this.activeMission.requiresVehicle && !this.player.inVehicle) {
          this._toast('This route expects the royal chariot');
          return;
        }

        this.missionState = 'combat';
        this._spawnMissionEnemies();
        if (this.activeMission.enemies.length === 0) {
          this._completeMission();
        } else {
          this._toast(`Combat started: ${this.activeMission.chapter}`);
        }
        this._saveGame();
      }
      return;
    }

    if (this.missionState === 'combat' && this.enemies.every(enemy => !enemy.alive)) {
      this._completeMission();
    }
  }

  _completeMission() {
    const mission = this.activeMission;
    const nextMission = MISSION_ORDER[this.missionIndex + 1];
    this._clearEnemies();

    if (!nextMission) {
      this._showOverlay({
        eyebrow: mission.chapter,
        title: 'Victory in Lanka',
        body: `${mission.completion} The repo now runs on a true 3D third-person prototype path instead of the old 2D renderer.`,
        primary: 'Start Fresh',
        secondary: 'Continue Roaming',
        primaryAction: () => this._startNewGame(),
        secondaryAction: () => {
          this.uiMode = 'playing';
          this._closeOverlay();
        },
      });
      this.uiMode = 'cutscene';
      clearSave();
      return;
    }

    this.missionIndex += 1;
    this.activeMission = nextMission;
    this.missionState = 'travel';
    this._resetActorsForMission(nextMission);
    this._setMarker(nextMission.marker, true);
    this._playScene(nextMission.chapter, nextMission.title, [mission.completion, ...nextMission.intro], () => {
      this.uiMode = 'playing';
      this._updateHUD();
      this._saveGame();
    });
  }

  _spawnMissionEnemies(savedEnemies = null) {
    this._clearEnemies();
    this.enemies = spawnMissionEnemies(this.activeMission, savedEnemies, this.scene);
  }

  _createEnemy(type, position) {
    return createEnemy(type, position);
  }

  _clearEnemies() {
    clearEnemies(this.enemies, this.scene);
    this.enemies = [];
    this.projectiles.forEach(projectile => this.scene.remove(projectile.mesh));
    this.enemyProjectiles.forEach(projectile => this.scene.remove(projectile.mesh));
    this.projectiles = [];
    this.enemyProjectiles = [];
  }

  _toggleVehicle() {
    if (this.player.inVehicle) {
      this._exitVehicle();
      return;
    }

    if (this.player.group.position.distanceTo(this.vehicle.group.position) <= 5.2) {
      this._enterVehicle();
    }
  }

  _enterVehicle() {
    if (this.player.inVehicle) return;
    enterChariot(this.vehicle, this.player, this);
    this._toast('Entered the royal chariot');
    this._saveGame();
  }

  _exitVehicle(silent = false) {
    if (!this.player.inVehicle) return;
    exitChariot(this.vehicle, this.player, this.scene, this);
    if (!silent) {
      this._toast('Exited the royal chariot');
      this._saveGame();
    }
  }

  _getCombatTargetPosition() {
    return this.player.inVehicle ? this.vehicle.group.position : this.player.group.position;
  }

  _updatePlayerAnimation(dt) {
    updatePlayerAnimation(this.player, dt, {
      vehicleSpeed: this.vehicle.speed,
      isAiming: this.isAiming,
      elapsedTime: this.clock.elapsedTime,
    });
  }

  _updateCamera(dt) {
    const target = this.player.inVehicle ? this.vehicle : this.player;
    const mode = this.player.inVehicle ? 'vehicle' : 'foot';
    updateThirdPersonCamera(this.camera, this, target, mode, dt);
  }

  _updateInteractionPrompt() {
    this.hud.updateInteractionPrompt(this.player, this.vehicle, this.uiMode);
  }

  _updateHUD() {
    this.hud.update(this);
  }

  _updateRadar() {
    this.hud.updateRadar(this.player, this.vehicle, this.enemies, this.activeMission);
  }

  _toast(message) {
    this.hud.toast(message);
  }

  _hasSave() {
    return hasSave();
  }

  _saveGame() {
    if (!this.activeMission) return;
    const payload = {
      missionIndex: this.missionIndex,
      missionState: this.missionState,
      cameraYaw: this.cameraYaw,
      cameraPitch: this.cameraPitch,
      cameraDistance: this.cameraDistance,
      player: {
        x: this.player.group.getWorldPosition(new THREE.Vector3()).x,
        z: this.player.group.getWorldPosition(new THREE.Vector3()).z,
        hp: this.player.hp,
        inVehicle: this.player.inVehicle,
      },
      vehicle: {
        x: this.vehicle.group.position.x,
        z: this.vehicle.group.position.z,
        yaw: this.vehicle.group.rotation.y,
        speed: this.vehicle.speed,
      },
      enemies: this.enemies.map(enemy => ({
        type: enemy.type,
        hp: enemy.hp,
        alive: enemy.alive,
        position: [enemy.group.position.x, 0, enemy.group.position.z],
      })),
    };
    writeSave(payload);
  }

  _loadSave() {
    return readSave();
  }

  _clearSave() {
    clearSave();
  }
}

const bootGame = () => {
  new Ramayana3DGame();
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGame, { once: true });
} else {
  bootGame();
}
