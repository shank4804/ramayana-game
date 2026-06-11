import * as THREE from 'three';

const TMP_FROM = new THREE.Vector3();
const TMP_TO = new THREE.Vector3();
const TMP_LOOK_FROM = new THREE.Vector3();
const TMP_LOOK_TO = new THREE.Vector3();
const TMP_EYE = new THREE.Vector3();
const TMP_LOOK = new THREE.Vector3();

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Plays authored cinematic sequences: the camera flies through the live 3D
 * world along per-shot tracks while letterbox bars and timed subtitle lines
 * are shown.
 *
 * A cutscene is an array of shots:
 *   {
 *     duration: seconds,
 *     cam:  [[x,y,z], [x,y,z]],      // camera position from -> to
 *     look: [[x,y,z], [x,y,z]],      // look-at target from -> to (optional: single point)
 *     lines: [{ speaker, text, at }] // `at` = 0..1 fraction of shot when the line appears
 *   }
 *
 * Enter advances to the next line (or shot when lines are exhausted).
 * Escape skips the whole cutscene.
 */
export class CutscenePlayer {
  constructor(camera, ui) {
    this.camera = camera;
    this.ui = ui; // { letterboxTop, letterboxBottom, subtitle, subtitleSpeaker, subtitleText, hint }
    this.active = false;
    this.shots = null;
    this.shotIndex = 0;
    this.shotTime = 0;
    this.lineIndex = -1;
    this.onDone = null;

    window.addEventListener('keydown', (e) => {
      if (!this.active) return;
      if (e.code === 'Enter' || e.code === 'Space') this.advance();
      if (e.code === 'Escape') this.skip();
    });
  }

  play(shots, onDone) {
    this.shots = shots;
    this.shotIndex = 0;
    this.shotTime = 0;
    this.lineIndex = -1;
    this.onDone = onDone;
    this.active = true;

    this.ui.letterboxTop.classList.add('active');
    this.ui.letterboxBottom.classList.add('active');
    this.ui.hint.classList.remove('hidden');
    this._applyShot(0);
  }

  advance() {
    const shot = this.shots?.[this.shotIndex];
    if (!shot) return;
    const lines = shot.lines || [];
    // If a later line in this shot hasn't shown yet, jump to it; else next shot.
    if (this.lineIndex + 1 < lines.length) {
      this.lineIndex += 1;
      this._showLine(lines[this.lineIndex]);
      // Fast-forward shot time to the line's timestamp so the camera keeps pace.
      this.shotTime = Math.max(this.shotTime, (lines[this.lineIndex].at ?? 0) * shot.duration);
    } else {
      this._nextShot();
    }
  }

  skip() {
    this._finish();
  }

  update(dt) {
    if (!this.active) return;
    const shot = this.shots[this.shotIndex];
    if (!shot) return;

    this.shotTime += dt;
    const t = Math.min(1, this.shotTime / shot.duration);
    const k = easeInOut(t);

    TMP_FROM.fromArray(shot.cam[0]);
    TMP_TO.fromArray(shot.cam[1] || shot.cam[0]);
    TMP_EYE.lerpVectors(TMP_FROM, TMP_TO, k);

    const look = shot.look;
    TMP_LOOK_FROM.fromArray(look[0]);
    TMP_LOOK_TO.fromArray(look[1] || look[0]);
    TMP_LOOK.lerpVectors(TMP_LOOK_FROM, TMP_LOOK_TO, k);

    this.camera.position.copy(TMP_EYE);
    this.camera.lookAt(TMP_LOOK);

    // Reveal timed lines.
    const lines = shot.lines || [];
    while (this.lineIndex + 1 < lines.length && t >= (lines[this.lineIndex + 1].at ?? 0)) {
      this.lineIndex += 1;
      this._showLine(lines[this.lineIndex]);
    }

    if (t >= 1 && this.lineIndex >= lines.length - 1) {
      this._nextShot();
    }
  }

  _applyShot(index) {
    const shot = this.shots[index];
    if (!shot) return;
    this.camera.position.fromArray(shot.cam[0]);
    TMP_LOOK.fromArray(shot.look[0]);
    this.camera.lookAt(TMP_LOOK);
  }

  _nextShot() {
    this.shotIndex += 1;
    this.shotTime = 0;
    this.lineIndex = -1;
    this._hideLine();
    if (this.shotIndex >= this.shots.length) {
      this._finish();
    } else {
      this._applyShot(this.shotIndex);
    }
  }

  _showLine(line) {
    this.ui.subtitleSpeaker.textContent = line.speaker || '';
    this.ui.subtitleText.textContent = line.text || '';
    this.ui.subtitle.classList.remove('hidden');
  }

  _hideLine() {
    this.ui.subtitle.classList.add('hidden');
  }

  _finish() {
    if (!this.active) return;
    this.active = false;
    this.shots = null;
    this._hideLine();
    this.ui.letterboxTop.classList.remove('active');
    this.ui.letterboxBottom.classList.remove('active');
    this.ui.hint.classList.add('hidden');
    const cb = this.onDone;
    this.onDone = null;
    cb?.();
  }
}
