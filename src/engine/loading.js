const FLAVOR_LINES = [
  "Stringing Rama's bow…",
  "Raising Ayodhya's banners…",
  'Yoking the royal chariot…',
  'Lighting the torches of Lanka…',
  'Carving the path through Kishkindha…',
];

export class LoadingScreen {
  constructor(rootElement) {
    this.root = rootElement;
    this.fillEl = rootElement.querySelector('.loading-bar-fill');
    this.labelEl = rootElement.querySelector('.loading-label');
    this.flavorEl = rootElement.querySelector('.loading-flavor');
    this.errorEl = rootElement.querySelector('.loading-error');
    this.retryButton = rootElement.querySelector('.loading-retry');
    this.minDisplayMs = 400;
    this.shownAt = 0;

    if (this.flavorEl) {
      this.flavorEl.textContent = FLAVOR_LINES[Math.floor(Math.random() * FLAVOR_LINES.length)];
    }
  }

  show() {
    this.root.classList.remove('hidden');
    this.shownAt = performance.now();
  }

  setProgress(fraction, label) {
    if (this.fillEl) {
      this.fillEl.style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
    }
    if (this.labelEl) {
      this.labelEl.textContent = label
        ? `${Math.round(fraction * 100)}% — ${label.split('/').pop()}`
        : `${Math.round(fraction * 100)}%`;
    }
  }

  hide() {
    const elapsed = performance.now() - this.shownAt;
    const remaining = Math.max(0, this.minDisplayMs - elapsed);
    setTimeout(() => this.root.classList.add('hidden'), remaining);
  }

  showError(url, retry) {
    if (this.errorEl) {
      this.errorEl.textContent = `Failed to load: ${url}`;
      this.errorEl.classList.remove('hidden');
    }
    if (this.retryButton) {
      this.retryButton.classList.remove('hidden');
      this.retryButton.onclick = () => {
        this.errorEl?.classList.add('hidden');
        this.retryButton.classList.add('hidden');
        retry?.();
      };
    }
  }
}
