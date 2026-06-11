export class HUD {
  constructor() {
    this.root = document.getElementById('hud');
    this.chapter = document.getElementById('hud-chapter');
    this.objective = document.getElementById('hud-objective');
    this.healthFill = document.getElementById('health-fill');
    this.enemies = document.getElementById('hud-enemies');
    this.toastEl = document.getElementById('toast');
    this.crosshair = document.getElementById('crosshair');
    this.toastTimer = 0;
  }

  show() { this.root.classList.remove('hidden'); }
  hide() { this.root.classList.add('hidden'); }

  setChapter(title) { this.chapter.textContent = title; }
  setObjective(text) { this.objective.textContent = text; }

  setHealth(hp, max) {
    this.healthFill.style.width = `${(hp / max) * 100}%`;
  }

  setEnemies(count) {
    this.enemies.textContent = count > 0 ? `Enemies: ${count}` : '';
  }

  setAiming(aiming) {
    this.crosshair.classList.toggle('hidden', !aiming);
  }

  toast(message) {
    this.toastEl.textContent = message;
    this.toastEl.classList.remove('hidden');
    this.toastTimer = 2.6;
  }

  splash(eyebrow, title) {
    const splash = document.getElementById('chapter-splash');
    document.getElementById('splash-eyebrow').textContent = eyebrow;
    document.getElementById('splash-title').textContent = title;
    splash.classList.remove('hidden');
    // Restart the CSS animation.
    splash.style.animation = 'none';
    void splash.offsetHeight;
    splash.style.animation = '';
    clearTimeout(this._splashTimer);
    this._splashTimer = setTimeout(() => splash.classList.add('hidden'), 3500);
  }

  update(dt) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl.classList.add('hidden');
    }
  }
}
