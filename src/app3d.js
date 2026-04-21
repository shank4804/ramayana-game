import * as THREE from '../node_modules/three/build/three.module.js';

const SAVE_KEY = 'ramayana-3d-openworld-v3';
const SETTINGS_KEY = 'ramayana-3d-settings-v1';
const WORLD_LIMIT = 210;
const PLAYER_RADIUS = 1.1;
const VEHICLE_RADIUS = 2.55;
const RADAR_RANGE = 90;

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

    this.renderer = this._createRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.id = 'viewport';
    this.root.prepend(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa6c7f7);
    this.scene.fog = new THREE.Fog(0x98b5df, 90, 320);
    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.clock = new THREE.Clock();

    this.keys = new Set();
    this.mouseButtons = new Set();
    this.pointer = { dragging: false, lastX: 0, lastY: 0 };
    this.toastTimer = 0;
    this.uiMode = 'title';
    this.overlayMode = 'menu';
    this.menuIndex = 0;
    this.isAiming = false;
    this.cameraYaw = Math.PI * 1.08;
    this.cameraPitch = 0.38;
    this.cameraDistance = 7.4;
    this.currentCameraDistance = this.cameraDistance;
    this.vehicleCameraDistance = 10.2;

    this.colliders = [];
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.decor = new THREE.Group();
    this.scene.add(this.decor);
    this.settings = this._loadSettings();

    this.player = this._createPlayer();
    this.scene.add(this.player.group);

    this.vehicle = this._createChariot();
    this.scene.add(this.vehicle.group);

    this.marker = this._createMissionMarker();
    this.scene.add(this.marker);

    this.missionIndex = 0;
    this.activeMission = MISSION_ORDER[0];
    this.missionState = 'travel';

    this._buildWorld();
    this._syncSettingsUI();
    this._applySettings();
    this._bindEvents();
    this._showTitle();
    this._updateHUD();
    this._animate();
  }

  _createRenderer() {
    const attempts = [
      { antialias: true, powerPreference: 'high-performance' },
      { antialias: false, powerPreference: 'default' },
    ];

    let lastError = null;
    for (const options of attempts) {
      try {
        return new THREE.WebGLRenderer(options);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to create a WebGL renderer');
  }

  _loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        lookSensitivity: typeof parsed.lookSensitivity === 'number' ? parsed.lookSensitivity : 1,
        quality: ['medium', 'high', 'epic'].includes(parsed.quality) ? parsed.quality : 'high',
        invertLookY: !!parsed.invertLookY,
      };
    } catch {
      return {
        lookSensitivity: 1,
        quality: 'high',
        invertLookY: false,
      };
    }
  }

  _saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
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

  _createPlayer() {
    const group = new THREE.Group();
    group.position.copy(MISSION_ORDER[0].spawn);

    const clothMaterial = new THREE.MeshStandardMaterial({ color: 0x295ec0, roughness: 0.72, metalness: 0.06 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xe4bb8a, roughness: 0.8 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xdca749, roughness: 0.5, metalness: 0.32 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x322414, roughness: 0.85 });

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.55), clothMaterial);
    hips.castShadow = true;
    hips.position.y = 1.05;
    group.add(hips);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.3, 0.66), clothMaterial);
    torso.castShadow = true;
    torso.position.y = 1.93;
    group.add(torso);

    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.07, 8, 28), accentMaterial);
    sash.rotation.x = Math.PI / 2;
    sash.position.y = 1.62;
    group.add(sash);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18), skinMaterial);
    head.castShadow = true;
    head.position.y = 2.98;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.37, 18, 18), darkMaterial);
    hair.castShadow = true;
    hair.position.y = 3.04;
    hair.scale.set(1.02, 0.86, 1.02);
    hair.position.z = -0.05;
    group.add(hair);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.72, 2.32, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 0.24), skinMaterial);
    leftArmMesh.castShadow = true;
    leftArmMesh.position.y = -0.48;
    leftArm.add(leftArmMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.72, 2.32, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 0.24), skinMaterial);
    rightArmMesh.castShadow = true;
    rightArmMesh.position.y = -0.48;
    rightArm.add(rightArmMesh);
    group.add(rightArm);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.26, 0.9, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.2, 0.3), darkMaterial);
    leftLegMesh.castShadow = true;
    leftLegMesh.position.y = -0.58;
    leftLeg.add(leftLegMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.26, 0.9, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.2, 0.3), darkMaterial);
    rightLegMesh.castShadow = true;
    rightLegMesh.position.y = -0.58;
    rightLeg.add(rightLegMesh);
    group.add(rightLeg);

    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.04, 6, 24, Math.PI), accentMaterial);
    bow.rotation.z = Math.PI / 2;
    bow.position.set(0.78, 1.95, -0.12);
    group.add(bow);

    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.8, 10), darkMaterial);
    quiver.castShadow = true;
    quiver.rotation.z = 0.34;
    quiver.position.set(-0.44, 1.9, -0.34);
    group.add(quiver);

    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.12), accentMaterial);
    sword.castShadow = true;
    sword.position.set(-0.58, 1.24, 0.1);
    sword.rotation.z = 0.22;
    group.add(sword);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    group.add(shadow);

    return {
      group,
      hp: 100,
      maxHp: 100,
      radius: PLAYER_RADIUS,
      walkSpeed: 7.5,
      sprintSpeed: 12.5,
      velocity: new THREE.Vector3(),
      moveDir: new THREE.Vector3(0, 0, 1),
      swordCooldown: 0,
      bowCooldown: 0,
      dodgeCooldown: 0,
      invulnerable: 0,
      attackTime: 0,
      bowPose: 0,
      dodgeTime: 0,
      walkPhase: 0,
      inVehicle: false,
      parts: {
        torso,
        hips,
        head,
        hair,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        sword,
        bow,
      },
    };
  }

  _createChariot() {
    const group = new THREE.Group();

    const red = new THREE.MeshStandardMaterial({ color: 0x8d2e28, roughness: 0.72, metalness: 0.08 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x76502f, roughness: 0.84 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xd8ad4f, roughness: 0.4, metalness: 0.42 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.88 });

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.68, 4.8), red);
    chassis.position.y = 1.72;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    group.add(chassis);

    const floor = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 3.3), wood);
    floor.position.set(0, 1.45, -0.1);
    floor.castShadow = true;
    floor.receiveShadow = true;
    group.add(floor);

    const frontBar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 5.2), wood);
    frontBar.position.set(0, 1.52, 4.1);
    frontBar.castShadow = true;
    group.add(frontBar);

    const frontYoke = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 1.6), gold);
    frontYoke.position.set(0, 1.58, 6.3);
    frontYoke.castShadow = true;
    group.add(frontYoke);

    const wheelPositions = [
      [-1.9, 0.95, -1.6],
      [1.9, 0.95, -1.6],
      [-1.9, 0.95, 1.6],
      [1.9, 0.95, 1.6],
    ];

    const wheels = wheelPositions.map(([x, y, z]) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.18, 12, 24), dark);
      wheel.castShadow = true;
      wheel.position.set(x, y, z);
      wheel.rotation.y = Math.PI / 2;
      group.add(wheel);
      return wheel;
    });

    const rails = [
      [-1.52, 2.24, -0.18, 0.18, 1.5, 3.2],
      [1.52, 2.24, -0.18, 0.18, 1.5, 3.2],
      [0, 2.24, -1.66, 2.86, 1.5, 0.18],
    ];

    rails.forEach(([x, y, z, sx, sy, sz]) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), gold);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(x, y, z);
      group.add(mesh);
    });

    const canopyPoles = [
      [-1.2, 3.45, -1.14],
      [1.2, 3.45, -1.14],
      [-1.2, 3.45, 1.06],
      [1.2, 3.45, 1.06],
    ];

    canopyPoles.forEach(([x, y, z]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), gold);
      pole.castShadow = true;
      pole.position.set(x, y, z);
      group.add(pole);
    });

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 3.0), red);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    canopy.position.set(0, 4.48, -0.04);
    group.add(canopy);

    const seat = new THREE.Group();
    seat.position.set(0, 1.52, -0.1);
    group.add(seat);

    group.position.copy(MISSION_ORDER[0].vehicleSpawn);
    group.rotation.y = MISSION_ORDER[0].vehicleYaw;

    return {
      group,
      seat,
      wheels,
      speed: 0,
      steering: 0,
      occupied: false,
      radius: VEHICLE_RADIUS,
    };
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
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(520, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xaec8f6, side: THREE.BackSide }),
    );
    this.scene.add(sky);

    const hemi = new THREE.HemisphereLight(0xd9e6ff, 0x4b311b, 1.18);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0cf, 2.35);
    sun.position.set(-75, 110, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -240;
    sun.shadow.camera.right = 240;
    sun.shadow.camera.top = 240;
    sun.shadow.camera.bottom = -240;
    this.scene.add(sun);
    this.sun = sun;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(480, 480),
      new THREE.MeshStandardMaterial({ color: 0x6b865a, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this._addGroundPatch(-120, -18, 120, 80, 0xc8b082);
    this._addGroundPatch(-6, 52, 124, 98, 0x58754a);
    this._addGroundPatch(74, -58, 90, 82, 0x7a6a4f);
    this._addGroundPatch(142, 80, 108, 136, 0x5a2422);
    this._addGroundPatch(146, 4, 80, 62, 0x49646f);

    this._buildRoadNetwork();
    this._buildAyodhyaDistrict();
    this._buildForestDistrict();
    this._buildKishkindhaDistrict();
    this._buildLankaDistrict();
    this._buildBackdrop();
  }

  _buildRoadNetwork() {
    const roadColor = 0x65513e;
    this._addRoad(-32, -10, 230, 16, roadColor);
    this._addRoad(-8, 16, 16, 92, roadColor);
    this._addRoad(48, -10, 104, 16, roadColor);
    this._addRoad(118, 18, 16, 150, roadColor);
    this._addRoad(118, 80, 56, 16, roadColor);
    this._addRoad(150, 98, 16, 78, roadColor);

    for (let x = -150; x <= 146; x += 16) {
      this._addLaneMark(x, -10, 6, 0.5);
    }
    for (let z = -18; z <= 138; z += 16) {
      this._addLaneMark(118, z, 0.5, 6);
    }
  }

  _buildAyodhyaDistrict() {
    const palace = [
      [-158, -42, 18, 16, 12, 0xd7d0c2, 0xc8a24e],
      [-136, -42, 18, 18, 15, 0xd8d2c5, 0xc49a45],
      [-114, -42, 16, 14, 11, 0xd5cebc, 0xcda14d],
      [-152, 20, 14, 12, 10, 0xd8cbb5, 0xb8893d],
      [-130, 24, 18, 16, 12, 0xd5c9b7, 0xc49d52],
      [-110, 18, 16, 12, 9, 0xd6cfbf, 0xba8a39],
    ];

    palace.forEach(([x, z, w, d, h, wall, roof]) => {
      this._addBuilding(x, z, w, d, h, wall, roof, true);
    });

    this._addGateArch(-92, -8);
    this._addWall(-176, -8, 8, 24, 10, 0xbaa171);
    this._addWall(-78, 38, 112, 6, 8, 0xc3ab7c);
    this._addWall(-78, -54, 112, 6, 8, 0xc3ab7c);
    this._addWall(-132, 26, 6, 20, 8, 0xc3ab7c);
    this._addWall(-132, -42, 6, 20, 8, 0xc3ab7c);

    [
      [-175, 36],
      [-175, -54],
      [-85, 36],
      [-85, -54],
    ].forEach(([x, z]) => this._addTower(x, z, 6.2, 13, 0xd7c49a, 0xc99d43));

    [
      [-154, -8],
      [-136, -8],
      [-118, -8],
      [-100, -8],
      [-82, -8],
    ].forEach(([x, z]) => this._addStreetLamp(x, z));
  }

  _buildForestDistrict() {
    const safeSpots = [
      { x: -26, z: 54, r: 20 },
      { x: 34, z: 18, r: 18 },
      { x: -58, z: 18, r: 14 },
    ];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const x = -66 + col * 14 + (row % 2 ? 4 : -2);
        const z = 18 + row * 16 + ((row * 7 + col * 5) % 4);
        const blocked = safeSpots.some(spot => Math.hypot(x - spot.x, z - spot.z) < spot.r);
        if (blocked) continue;
        this._addTree(x, z, 1.5 + (col % 3) * 0.2, 7 + (row % 3));
      }
    }

    const camp = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 5.2, 4.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x9d6d3d, roughness: 0.86 }),
    );
    camp.rotation.y = Math.PI / 4;
    camp.position.set(34, 2.1, 18);
    camp.castShadow = true;
    this.decor.add(camp);

    const fire = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffa548 }),
    );
    fire.position.set(34, 0.7, 18);
    this.decor.add(fire);

    const fireLight = new THREE.PointLight(0xffa04a, 1.5, 22, 2);
    fireLight.position.copy(fire.position);
    this.scene.add(fireLight);

    this._addRuin(10, 22, 9, 9, 5);
    this._addRuin(48, 12, 8, 8, 4.5);
  }

  _buildKishkindhaDistrict() {
    const rockMaterial = 0x77644d;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 56 + col * 14 + (row % 2 ? 5 : -2);
        const z = -86 + row * 14 + ((row * 9 + col * 3) % 4);
        const size = 4.8 + ((row + col) % 3) * 1.2;
        this._addRock(x, z, size, rockMaterial);
      }
    }

    this._addBridge(56, -10, 28, 6);
    this._addBridge(82, -28, 32, 6);
    this._addBanner(70, -42, 0xcf8134);
    this._addBanner(90, -62, 0xcf8134);
  }

  _buildLankaDistrict() {
    const wall = 0x6d2e22;
    this._addWall(124, 42, 48, 4, 12, wall);
    this._addWall(104, 62, 4, 44, 12, wall);
    this._addWall(144, 62, 4, 44, 12, wall);
    this._addWall(124, 82, 48, 4, 12, wall);

    [
      [104, 42],
      [144, 42],
      [104, 82],
      [144, 82],
    ].forEach(([x, z]) => this._addTower(x, z, 5.4, 15, 0x7a3424, 0x9f562a));

    this._addBuilding(158, 114, 44, 34, 18, 0x33191b, 0x7a3726, false);
    this._addBuilding(126, 34, 18, 16, 10, 0x58221e, 0x944b38, true);
    this._addBuilding(150, 30, 14, 14, 9, 0x58221e, 0x944b38, true);

    [
      [114, 38],
      [136, 38],
      [114, 86],
      [136, 86],
      [154, 94],
      [154, 134],
    ].forEach(([x, z]) => this._addTorch(x, z));
  }

  _buildBackdrop() {
    const sea = new THREE.Mesh(
      new THREE.PlaneGeometry(260, 120),
      new THREE.MeshStandardMaterial({ color: 0x3b6b8e, roughness: 0.35, metalness: 0.08 }),
    );
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(174, 0.02, -52);
    this.scene.add(sea);

    for (let i = 0; i < 10; i++) {
      const hill = new THREE.Mesh(
        new THREE.ConeGeometry(18 + i * 2, 24 + i * 1.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x4b5d75, roughness: 1 }),
      );
      hill.castShadow = true;
      hill.position.set(-188 + i * 42, 12 + i * 0.4, -172 + (i % 2) * 18);
      this.scene.add(hill);
    }

    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(52, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xb48f63, roughness: 0.85 }),
    );
    bridge.position.set(104, 0.7, -22);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    this.scene.add(bridge);
  }

  _addGroundPatch(x, z, width, depth, color) {
    const patch = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({ color, roughness: 1 }),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(x, 0.03, z);
    patch.receiveShadow = true;
    this.scene.add(patch);
  }

  _addRoad(x, z, width, depth, color) {
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.12, depth),
      new THREE.MeshStandardMaterial({ color, roughness: 0.96 }),
    );
    road.position.set(x, 0.09, z);
    road.receiveShadow = true;
    this.scene.add(road);
  }

  _addLaneMark(x, z, width, depth) {
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshBasicMaterial({ color: 0xf8d38a }),
    );
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.16, z);
    this.scene.add(line);
  }

  _addBuilding(x, z, width, depth, height, wallColor, roofColor, solid) {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.75 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.46, metalness: 0.28 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMaterial);
    body.position.set(x, height / 2, z);
    body.castShadow = true;
    body.receiveShadow = true;
    this.scene.add(body);

    const roof = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.22, width * 0.32, 2, 18), roofMaterial);
    roof.position.set(x, height + 1, z);
    roof.scale.z = depth / width;
    roof.castShadow = true;
    roof.receiveShadow = true;
    this.scene.add(roof);

    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1e2a, emissive: 0x4d3a14, emissiveIntensity: 0.16 });
    const windowRows = Math.max(1, Math.floor(height / 4));
    const windowCols = Math.max(2, Math.floor(width / 5));
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const wx = x - width / 2 + 2 + col * ((width - 4) / Math.max(1, windowCols - 1));
        const wy = 2 + row * 3;
        const front = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), windowMaterial);
        front.position.set(wx, wy, z + depth / 2 + 0.04);
        this.scene.add(front);
      }
    }

    if (solid) this._registerCollider(x, z, width, depth, 0.8);
  }

  _addWall(x, z, width, depth, height, color) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color, roughness: 0.82 }),
    );
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this._registerCollider(x, z, width, depth, 0.5);
  }

  _addGateArch(x, z) {
    const material = new THREE.MeshStandardMaterial({ color: 0x9f7c47, roughness: 0.76 });
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(2.2, 11, 3.2), material);
    leftPost.position.set(x - 4.4, 5.5, z);
    leftPost.castShadow = true;
    leftPost.receiveShadow = true;
    this.scene.add(leftPost);
    this._registerCollider(x - 4.4, z, 2.2, 3.2, 0.4);

    const rightPost = leftPost.clone();
    rightPost.position.x = x + 4.4;
    this.scene.add(rightPost);
    this._registerCollider(x + 4.4, z, 2.2, 3.2, 0.4);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(11.2, 2.2, 3.6), material);
    lintel.position.set(x, 10.4, z);
    lintel.castShadow = true;
    lintel.receiveShadow = true;
    this.scene.add(lintel);
  }

  _addTower(x, z, radius, height, wallColor, roofColor) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius + 0.5, height, 12),
      new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.78 }),
    );
    base.position.set(x, height / 2, z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.82, 16, 16),
      new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.5, metalness: 0.22 }),
    );
    cap.position.set(x, height + radius * 0.2, z);
    cap.scale.y = 0.66;
    cap.castShadow = true;
    this.scene.add(cap);

    this._registerCollider(x, z, radius * 2.2, radius * 2.2, 0.6);
  }

  _addStreetLamp(x, z) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 5.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x5b4630, roughness: 0.86 }),
    );
    pole.position.set(x, 2.8, z);
    pole.castShadow = true;
    this.scene.add(pole);

    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd477, emissive: 0xffb650, emissiveIntensity: 1, roughness: 0.35 }),
    );
    lamp.position.set(x, 5.4, z);
    this.scene.add(lamp);

    const light = new THREE.PointLight(0xffd36c, 0.75, 18, 2);
    light.position.copy(lamp.position);
    this.scene.add(light);
  }

  _addTorch(x, z) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x573822, roughness: 0.9 }),
    );
    pole.position.set(x, 1.3, z);
    pole.castShadow = true;
    this.scene.add(pole);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffaa54, emissive: 0xff7f22, emissiveIntensity: 1.4, roughness: 0.2 }),
    );
    flame.position.set(x, 2.75, z);
    this.scene.add(flame);

    const light = new THREE.PointLight(0xff8f44, 1.4, 24, 2);
    light.position.copy(flame.position);
    this.scene.add(light);
  }

  _addTree(x, z, radius, height) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.18, radius * 0.26, height, 10),
      new THREE.MeshStandardMaterial({ color: 0x603718, roughness: 0.98 }),
    );
    trunk.position.set(x, height / 2, z);
    trunk.castShadow = true;
    this.scene.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 2.1, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0x355f31, roughness: 0.96 }),
    );
    crown.position.set(x, height + radius * 1.2, z);
    crown.castShadow = true;
    this.scene.add(crown);

    this._registerCollider(x, z, radius * 2.2, radius * 2.2, 0.7);
  }

  _addRock(x, z, size, color) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({ color, roughness: 1 }),
    );
    rock.position.set(x, size * 0.42, z);
    rock.rotation.set((x + z) * 0.02, x * 0.01, z * 0.01);
    rock.castShadow = true;
    rock.receiveShadow = true;
    this.scene.add(rock);
    this._registerCollider(x, z, size * 1.6, size * 1.6, 0.7);
  }

  _addRuin(x, z, width, depth, height) {
    const material = new THREE.MeshStandardMaterial({ color: 0x8d7a62, roughness: 0.94 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    base.position.set(x, height / 2, z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);
    this._registerCollider(x, z, width, depth, 0.5);
  }

  _addBridge(x, z, width, depth) {
    const wood = new THREE.MeshStandardMaterial({ color: 0x8b6743, roughness: 0.9 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(width, 0.8, depth), wood);
    deck.position.set(x, 1.2, z);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scene.add(deck);

    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(width, 0.3, 0.2), wood);
    rail1.position.set(x, 2.3, z - depth / 2);
    rail1.castShadow = true;
    this.scene.add(rail1);

    const rail2 = rail1.clone();
    rail2.position.z = z + depth / 2;
    this.scene.add(rail2);
  }

  _addBanner(x, z, color) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 7, 8),
      new THREE.MeshStandardMaterial({ color: 0x5f4631, roughness: 0.86 }),
    );
    pole.position.set(x, 3.5, z);
    pole.castShadow = true;
    this.scene.add(pole);

    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.8),
      new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.7 }),
    );
    cloth.position.set(x + 1.2, 5.2, z);
    this.scene.add(cloth);
  }

  _registerCollider(x, z, width, depth, padding = 0) {
    this.colliders.push({
      minX: x - width / 2 - padding,
      maxX: x + width / 2 + padding,
      minZ: z - depth / 2 - padding,
      maxZ: z + depth / 2 + padding,
    });
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
    this.marker.position.copy(position);
    this.marker.position.y = 0.35;
    this.marker.visible = visible;
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this._update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  _update(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toast.classList.add('hidden');
    }

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
    return codes.some(code => this.keys.has(code));
  }

  _updatePlayer(dt) {
    if (this._isPressed('KeyQ')) this.cameraYaw += dt * 1.65;
    if (this._isPressed('KeyE')) this.cameraYaw -= dt * 1.65;

    const inputX = (this._isPressed('KeyD', 'ArrowRight') ? 1 : 0) - (this._isPressed('KeyA', 'ArrowLeft') ? 1 : 0);
    const inputY = (this._isPressed('KeyW', 'ArrowUp') ? 1 : 0) - (this._isPressed('KeyS', 'ArrowDown') ? 1 : 0);
    const input = new THREE.Vector2(inputX, inputY);

    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
    const move = new THREE.Vector3();

    if (input.lengthSq() > 0) {
      input.normalize();
      move.addScaledVector(right, input.x).addScaledVector(forward, input.y).normalize();
      this.player.moveDir.copy(move);
    }

    const targetSpeed = input.lengthSq() > 0
      ? (this._isPressed('ShiftLeft', 'ShiftRight') ? this.player.sprintSpeed : this.player.walkSpeed)
      : 0;

    const desiredVelocity = move.multiplyScalar(targetSpeed);
    this.player.velocity.x = damp(this.player.velocity.x, desiredVelocity.x, input.lengthSq() > 0 ? 12 : 9, dt);
    this.player.velocity.z = damp(this.player.velocity.z, desiredVelocity.z, input.lengthSq() > 0 ? 12 : 9, dt);

    if (this.player.dodgeTime > 0) {
      this.player.velocity.addScaledVector(this.player.moveDir, dt * 4.6);
    }

    TMP_A.copy(this.player.group.position);
    TMP_B.copy(this.player.velocity).multiplyScalar(dt);
    this._moveBody(TMP_A, TMP_B, this.player.radius);
    this.player.group.position.copy(TMP_A);

    const horizontalSpeed = Math.hypot(this.player.velocity.x, this.player.velocity.z);
    if (horizontalSpeed > 0.2) {
      this.player.walkPhase += dt * horizontalSpeed * 0.95;
    }

    const aimYaw = Math.atan2(forward.x, forward.z);
    if (this.isAiming) {
      this.player.group.rotation.y = dampAngle(this.player.group.rotation.y, aimYaw, 18, dt);
    } else if (horizontalSpeed > 0.25) {
      const moveYaw = Math.atan2(this.player.velocity.x, this.player.velocity.z);
      this.player.group.rotation.y = dampAngle(this.player.group.rotation.y, moveYaw, 15, dt);
    }
  }

  _updateVehicle(dt) {
    if (this._isPressed('KeyQ')) this.cameraYaw += dt * 1.35;
    if (this._isPressed('KeyE')) this.cameraYaw -= dt * 1.35;

    const throttle = (this._isPressed('KeyW', 'ArrowUp') ? 1 : 0) - (this._isPressed('KeyS', 'ArrowDown') ? 1 : 0);
    const steer = (this._isPressed('KeyD', 'ArrowRight') ? 1 : 0) - (this._isPressed('KeyA', 'ArrowLeft') ? 1 : 0);
    const brakeFactor = this._isPressed('Space') ? 8.5 : 2.8;

    this.vehicle.speed += throttle * 28 * dt;
    this.vehicle.speed = damp(this.vehicle.speed, 0, brakeFactor, dt);
    this.vehicle.speed = THREE.MathUtils.clamp(this.vehicle.speed, -10, 18);

    const steerAuthority = THREE.MathUtils.clamp(Math.abs(this.vehicle.speed) / 10, 0, 1);
    this.vehicle.steering = damp(this.vehicle.steering, steer * 0.5, 10, dt);
    this.vehicle.group.rotation.y -= this.vehicle.steering * steerAuthority * dt * 2.2 * Math.sign(this.vehicle.speed || 1);

    const forward = new THREE.Vector3(Math.sin(this.vehicle.group.rotation.y), 0, Math.cos(this.vehicle.group.rotation.y));
    TMP_A.copy(this.vehicle.group.position);
    TMP_B.copy(forward).multiplyScalar(this.vehicle.speed * dt);
    const collided = this._moveBody(TMP_A, TMP_B, this.vehicle.radius);
    this.vehicle.group.position.copy(TMP_A);
    if (collided) this.vehicle.speed *= -0.08;

    const wheelSpin = this.vehicle.speed * dt * 1.8;
    this.vehicle.wheels.forEach((wheel, index) => {
      wheel.rotation.x -= wheelSpin;
      if (index >= 2) wheel.rotation.z = this.vehicle.steering * 0.7;
    });
  }

  _moveBody(position, delta, radius) {
    position.add(delta);
    const collided = this._resolveCollisions(position, radius);
    position.x = THREE.MathUtils.clamp(position.x, -WORLD_LIMIT, WORLD_LIMIT);
    position.z = THREE.MathUtils.clamp(position.z, -WORLD_LIMIT, WORLD_LIMIT);
    return collided;
  }

  _resolveCollisions(position, radius) {
    let collided = false;
    for (let pass = 0; pass < 3; pass++) {
      this.colliders.forEach(collider => {
        const nearestX = THREE.MathUtils.clamp(position.x, collider.minX, collider.maxX);
        const nearestZ = THREE.MathUtils.clamp(position.z, collider.minZ, collider.maxZ);
        const dx = position.x - nearestX;
        const dz = position.z - nearestZ;
        const distSq = dx * dx + dz * dz;
        if (distSq >= radius * radius) return;

        collided = true;

        if (distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          position.x += (dx / dist) * push;
          position.z += (dz / dist) * push;
          return;
        }

        const left = Math.abs(position.x - collider.minX);
        const right = Math.abs(collider.maxX - position.x);
        const top = Math.abs(position.z - collider.minZ);
        const bottom = Math.abs(collider.maxZ - position.z);
        const smallest = Math.min(left, right, top, bottom);
        if (smallest === left) position.x = collider.minX - radius;
        else if (smallest === right) position.x = collider.maxX + radius;
        else if (smallest === top) position.z = collider.minZ - radius;
        else position.z = collider.maxZ + radius;
      });
    }
    return collided;
  }

  _doDodge() {
    if (this.player.inVehicle || this.player.dodgeCooldown > 0) return;
    this.player.dodgeCooldown = 0.85;
    this.player.dodgeTime = 1;
    this.player.invulnerable = Math.max(this.player.invulnerable, 0.28);
    this.player.velocity.addScaledVector(this.player.moveDir, 8.8);
  }

  _doSwordAttack() {
    if (this.player.inVehicle || this.player.swordCooldown > 0) return;

    this.player.swordCooldown = 0.48;
    this.player.attackTime = 1;
    this.weaponValue.textContent = 'Blade';

    const origin = this.player.group.position.clone();
    const facing = new THREE.Vector3(
      Math.sin(this.player.group.rotation.y),
      0,
      Math.cos(this.player.group.rotation.y),
    );

    let hits = 0;
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      const toEnemy = enemy.group.position.clone().sub(origin);
      const distance = toEnemy.length();
      if (distance > enemy.radius + 4.4) return;
      toEnemy.normalize();
      if (facing.dot(toEnemy) < 0.18) return;
      enemy.hp -= 30;
      enemy.flash = 0.28;
      hits++;
      if (enemy.hp <= 0) {
        enemy.alive = false;
        enemy.group.visible = false;
      }
    });

    if (hits > 0) this._toast(`Sword strike: ${hits} hit${hits > 1 ? 's' : ''}`);
    this._saveGame();
  }

  _fireArrow() {
    if (this.player.inVehicle || this.player.bowCooldown > 0) return;

    this.player.bowCooldown = 0.72;
    this.player.bowPose = 1;
    this.weaponValue.textContent = 'Bow';

    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = Math.max(0.02, direction.y);
    direction.normalize();

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.45, 8),
      new THREE.MeshStandardMaterial({ color: 0xe6c670, roughness: 0.4, metalness: 0.2 }),
    );
    mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    mesh.position.copy(this.player.group.position).add(new THREE.Vector3(0, 2.25, 0));
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      velocity: direction.multiplyScalar(46),
      ttl: 2.8,
      damage: 24,
    });
  }

  _spawnEnemyOrb(enemy) {
    const direction = this._getCombatTargetPosition().clone().add(new THREE.Vector3(0, 1.4, 0)).sub(enemy.group.position);
    direction.y = 0.06;
    direction.normalize();

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xff7a59, emissive: 0xaa2e1e, emissiveIntensity: 1.2 }),
    );
    mesh.castShadow = true;
    mesh.position.copy(enemy.group.position).add(new THREE.Vector3(0, 2.1, 0));
    this.scene.add(mesh);

    this.enemyProjectiles.push({
      mesh,
      velocity: direction.multiplyScalar(26),
      ttl: 3.2,
      damage: 14,
    });
  }

  _updateProjectiles(dt) {
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.ttl -= dt;
      if (projectile.ttl <= 0) {
        this.scene.remove(projectile.mesh);
        return false;
      }

      projectile.mesh.position.addScaledVector(projectile.velocity, dt);
      projectile.mesh.lookAt(projectile.mesh.position.clone().add(projectile.velocity));

      if (this._pointHitsCollider(projectile.mesh.position, 0.3)) {
        this.scene.remove(projectile.mesh);
        return false;
      }

      const hitEnemy = this.enemies.find(enemy => {
        if (!enemy.alive) return false;
        return enemy.group.position.distanceTo(projectile.mesh.position) <= enemy.radius + 0.85;
      });

      if (hitEnemy) {
        hitEnemy.hp -= projectile.damage;
        hitEnemy.flash = 0.34;
        if (hitEnemy.hp <= 0) {
          hitEnemy.alive = false;
          hitEnemy.group.visible = false;
        }
        this.scene.remove(projectile.mesh);
        return false;
      }

      return true;
    });
  }

  _updateEnemyProjectiles(dt) {
    const targetPos = this._getCombatTargetPosition().clone().add(new THREE.Vector3(0, 1.4, 0));
    this.enemyProjectiles = this.enemyProjectiles.filter(projectile => {
      projectile.ttl -= dt;
      if (projectile.ttl <= 0) {
        this.scene.remove(projectile.mesh);
        return false;
      }

      projectile.mesh.position.addScaledVector(projectile.velocity, dt);
      if (this._pointHitsCollider(projectile.mesh.position, 0.45)) {
        this.scene.remove(projectile.mesh);
        return false;
      }

      if (projectile.mesh.position.distanceTo(targetPos) <= (this.player.inVehicle ? 2.6 : 1.2)) {
        this._damagePlayer(projectile.damage);
        this.scene.remove(projectile.mesh);
        return false;
      }

      return true;
    });
  }

  _pointHitsCollider(point, padding) {
    return this.colliders.some(collider => (
      point.x >= collider.minX - padding &&
      point.x <= collider.maxX + padding &&
      point.z >= collider.minZ - padding &&
      point.z <= collider.maxZ + padding
    ));
  }

  _updateEnemies(dt) {
    const targetPos = this._getCombatTargetPosition();
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;

      enemy.flash = Math.max(0, enemy.flash - dt);
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
      enemy.walkPhase += dt * enemy.speed * 0.6;

      enemy.parts.body.material.emissiveIntensity = enemy.flash > 0 ? 0.95 : 0.18;
      enemy.parts.leftLeg.rotation.x = Math.sin(enemy.walkPhase) * 0.3;
      enemy.parts.rightLeg.rotation.x = -Math.sin(enemy.walkPhase) * 0.3;
      enemy.parts.leftArm.rotation.x = -Math.sin(enemy.walkPhase) * 0.25;
      enemy.parts.rightArm.rotation.x = Math.sin(enemy.walkPhase) * 0.25;

      const delta = targetPos.clone().sub(enemy.group.position);
      const distance = delta.length();
      const aggroRange = this.missionState === 'combat' ? 64 : 22;
      if (distance > aggroRange) return;

      delta.normalize();
      TMP_A.copy(enemy.group.position);
      TMP_B.copy(delta).multiplyScalar(enemy.speed * dt);
      this._moveBody(TMP_A, TMP_B, enemy.radius);
      enemy.group.position.copy(TMP_A);
      enemy.group.rotation.y = dampAngle(enemy.group.rotation.y, Math.atan2(delta.x, delta.z), 14, dt);

      if (enemy.type === 'boss' && distance < 30 && enemy.attackCooldown <= 0) {
        this._spawnEnemyOrb(enemy);
        enemy.attackCooldown = 1.3;
      } else if (distance <= enemy.radius + (this.player.inVehicle ? 2.6 : 1.5) && enemy.attackCooldown <= 0) {
        this._damagePlayer(enemy.damage);
        enemy.attackCooldown = enemy.type === 'boss' ? 0.85 : 1.05;
      }
    });
  }

  _damagePlayer(amount) {
    if (this.player.invulnerable > 0) return;
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invulnerable = 0.6;
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
      localStorage.removeItem(SAVE_KEY);
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
    const source = savedEnemies || this.activeMission.enemies;
    source.forEach(def => {
      if (savedEnemies && def.alive === false) return;
      const enemy = this._createEnemy(def.type, def.position);
      if (savedEnemies) {
        enemy.hp = def.hp;
        enemy.alive = def.alive !== false;
        enemy.group.visible = enemy.alive;
      }
      this.enemies.push(enemy);
      this.scene.add(enemy.group);
    });
  }

  _createEnemy(type, position) {
    const stats = {
      guard: { body: 0x8b2f2f, hp: 54, speed: 4.8, damage: 8, scale: 1.02, radius: 1.15 },
      rakshasa: { body: 0x60221f, hp: 68, speed: 5.4, damage: 12, scale: 1.12, radius: 1.22 },
      brute: { body: 0x55341a, hp: 110, speed: 3.3, damage: 18, scale: 1.42, radius: 1.55 },
      boss: { body: 0x290a10, hp: 230, speed: 2.9, damage: 20, scale: 2.05, radius: 2.25 },
    }[type];

    const group = new THREE.Group();
    group.position.set(position[0], 0, position[2]);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: stats.body,
      roughness: 0.76,
      metalness: 0.12,
      emissive: 0x5b1212,
      emissiveIntensity: 0.18,
    });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd09a6b, roughness: 0.78 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.95 * stats.scale, 1.4 * stats.scale, 0.68 * stats.scale), bodyMaterial);
    body.castShadow = true;
    body.position.y = 1.95 * stats.scale;
    group.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34 * stats.scale, 16, 16), skinMaterial);
    head.castShadow = true;
    head.position.y = 3.02 * stats.scale;
    group.add(head);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.66 * stats.scale, 2.2 * stats.scale, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22 * stats.scale, 1.02 * stats.scale, 0.22 * stats.scale), skinMaterial);
    leftArmMesh.castShadow = true;
    leftArmMesh.position.y = -0.46 * stats.scale;
    leftArm.add(leftArmMesh);
    group.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.66 * stats.scale, 2.2 * stats.scale, 0);
    const rightArmMesh = leftArmMesh.clone();
    rightArmMesh.castShadow = true;
    rightArmMesh.position.y = -0.46 * stats.scale;
    rightArm.add(rightArmMesh);
    group.add(rightArm);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.22 * stats.scale, 1.05 * stats.scale, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26 * stats.scale, 1.16 * stats.scale, 0.26 * stats.scale), bodyMaterial);
    leftLegMesh.castShadow = true;
    leftLegMesh.position.y = -0.56 * stats.scale;
    leftLeg.add(leftLegMesh);
    group.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.22 * stats.scale, 1.05 * stats.scale, 0);
    const rightLegMesh = leftLegMesh.clone();
    rightLegMesh.castShadow = true;
    rightLegMesh.position.y = -0.56 * stats.scale;
    rightLeg.add(rightLegMesh);
    group.add(rightLeg);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.92 * stats.scale, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    return {
      type,
      group,
      radius: stats.radius,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      damage: stats.damage,
      alive: true,
      flash: 0,
      attackCooldown: 0,
      walkPhase: 0,
      parts: {
        body,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
      },
    };
  }

  _clearEnemies() {
    this.enemies.forEach(enemy => this.scene.remove(enemy.group));
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
    this.player.inVehicle = true;
    this.vehicle.occupied = true;
    this.vehicle.seat.add(this.player.group);
    this.player.group.position.set(0, 0, -0.2);
    this.player.group.rotation.set(0, 0, 0);
    this.player.velocity.set(0, 0, 0);
    this.cameraDistance = this.vehicleCameraDistance;
    this._toast('Entered the royal chariot');
    this._saveGame();
  }

  _exitVehicle(silent = false) {
    if (!this.player.inVehicle) return;
    this.player.inVehicle = false;
    this.vehicle.occupied = false;
    this.scene.attach(this.player.group);

    const side = new THREE.Vector3(Math.cos(this.vehicle.group.rotation.y), 0, -Math.sin(this.vehicle.group.rotation.y));
    this.player.group.position.copy(this.vehicle.group.position).addScaledVector(side, 4.2);
    this.player.group.position.y = 0;
    this.player.group.rotation.set(0, this.vehicle.group.rotation.y, 0);
    this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance, 6.4, 10.4);
    if (!silent) {
      this._toast('Exited the royal chariot');
      this._saveGame();
    }
  }

  _getCombatTargetPosition() {
    return this.player.inVehicle ? this.vehicle.group.position : this.player.group.position;
  }

  _updatePlayerAnimation(dt) {
    const speed = this.player.inVehicle
      ? Math.abs(this.vehicle.speed)
      : Math.hypot(this.player.velocity.x, this.player.velocity.z);

    if (!this.player.inVehicle) {
      this.player.walkPhase += dt * speed * 0.42;
    }

    const stride = this.player.inVehicle ? 0 : Math.min(0.75, speed * 0.08);
    const armSwing = Math.sin(this.player.walkPhase) * stride;
    const legSwing = Math.sin(this.player.walkPhase) * stride * 1.2;

    this.player.parts.leftLeg.rotation.x = legSwing;
    this.player.parts.rightLeg.rotation.x = -legSwing;

    const attackSwing = this.player.attackTime > 0 ? -1.2 * this.player.attackTime : 0;
    const bowPose = this.isAiming || this.player.bowPose > 0 ? 0.7 + this.player.bowPose * 0.3 : 0;

    this.player.parts.leftArm.rotation.x = -armSwing * 0.6 + bowPose * 0.3;
    this.player.parts.rightArm.rotation.x = armSwing * 0.6 + attackSwing - bowPose;
    this.player.parts.torso.position.y = 1.93 + Math.sin(this.player.walkPhase * 2) * Math.min(0.08, speed * 0.01);
    this.player.parts.head.rotation.y = this.isAiming ? Math.sin(this.clock.elapsedTime * 0.7) * 0.08 : 0;
  }

  _updateCamera(dt) {
    const focus = this.player.inVehicle
      ? this.vehicle.group.position.clone().add(new THREE.Vector3(0, 2.8, 0))
      : this.player.group.position.clone().add(new THREE.Vector3(0.65, 2.1, 0));

    const desiredDistance = this.player.inVehicle
      ? THREE.MathUtils.clamp(this.cameraDistance, 8, 13.5)
      : THREE.MathUtils.clamp(this.cameraDistance, 5.6, 11.2);

    this.currentCameraDistance = damp(this.currentCameraDistance, desiredDistance, 7.5, dt);
    const sideOffset = this.player.inVehicle ? 1.4 : 1.2;

    const backward = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
      Math.sin(this.cameraPitch),
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch),
    );
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
    const desired = focus.clone()
      .addScaledVector(backward, this.currentCameraDistance)
      .addScaledVector(right, sideOffset);

    this.camera.position.lerp(desired, 1 - Math.exp(-dt * 9));
    this.camera.lookAt(focus);
  }

  _updateInteractionPrompt() {
    if (this.uiMode !== 'playing') {
      this.prompt.classList.add('hidden');
      return;
    }

    if (this.player.inVehicle) {
      this.prompt.textContent = 'Press F to leave the royal chariot';
      this.prompt.classList.remove('hidden');
      return;
    }

    const nearVehicle = this.player.group.position.distanceTo(this.vehicle.group.position) <= 5.2;
    if (nearVehicle) {
      this.prompt.textContent = 'Press F to enter the royal chariot';
      this.prompt.classList.remove('hidden');
    } else {
      this.prompt.classList.add('hidden');
    }
  }

  _updateHUD() {
    const objective = this.missionState === 'combat'
      ? `Clear the area in ${this.activeMission.chapter}.`
      : this.activeMission.objective;

    this.chapterTitle.textContent = `${this.activeMission.chapter}`;
    this.objectiveText.textContent = objective;
    this.healthValue.textContent = `${Math.round(this.player.hp)} / ${this.player.maxHp}`;
    this.healthFill.style.width = `${(this.player.hp / this.player.maxHp) * 100}%`;
    this.enemyValue.textContent = `${this.enemies.filter(enemy => enemy.alive).length}`;
    this.modeValue.textContent = this.player.inVehicle ? 'Royal Chariot' : 'On Foot';
    this.weaponValue.textContent = this.player.inVehicle ? 'Driving' : (this.isAiming ? 'Bow' : 'Blade');
    this.speedValue.textContent = `${Math.round(this.player.inVehicle ? Math.abs(this.vehicle.speed) * 8 : Math.hypot(this.player.velocity.x, this.player.velocity.z))}`;
  }

  _updateRadar() {
    const ctx = this.radarCtx;
    const { width, height } = this.radarCanvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42;
    const worldPos = this.player.inVehicle ? this.vehicle.group.position : this.player.group.position;
    const heading = this.player.inVehicle ? this.vehicle.group.rotation.y : this.player.group.rotation.y;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(5, 10, 18, 0.92)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(229, 185, 83, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 2; ring++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 3) * ring, 0, Math.PI * 2);
      ctx.stroke();
    }

    const drawPoint = (target, color, size, clampToEdge) => {
      const dx = target.x - worldPos.x;
      const dz = target.z - worldPos.z;
      const localX = dx * Math.cos(-heading) - dz * Math.sin(-heading);
      const localZ = dx * Math.sin(-heading) + dz * Math.cos(-heading);
      const distance = Math.hypot(localX, localZ);
      let scale = radius / RADAR_RANGE;
      let drawX = localX;
      let drawZ = localZ;
      if (distance > RADAR_RANGE && clampToEdge) {
        const factor = (RADAR_RANGE * 0.92) / distance;
        drawX *= factor;
        drawZ *= factor;
      }
      const px = centerX + drawX * scale;
      const py = centerY + drawZ * scale;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPoint(this.activeMission.marker, '#f0c56a', 4.8, true);
    this.enemies.forEach(enemy => {
      if (enemy.alive) drawPoint(enemy.group.position, '#ff6a5b', 3.8, true);
    });
    drawPoint(this.vehicle.group.position, '#9dc8ff', 4.2, true);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = '#ffffff';
    ctx.rotate(-heading);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 8);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _toast(message) {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');
    this.toastTimer = 2.4;
  }

  _hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
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
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }

  _loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _clearSave() {
    localStorage.removeItem(SAVE_KEY);
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
