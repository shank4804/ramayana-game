export class Overlay {
  constructor(elements) {
    Object.assign(this, elements);
    this._primaryAction = null;
    this._secondaryAction = null;
  }

  show({
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
    this.overlayEl.classList.remove('hidden');
    this.overlayEyebrow.textContent = eyebrow;
    this.overlayTitle.textContent = title;
    this.overlayBody.textContent = body;
    this.overlaySpeaker.textContent = speaker || '';
    this.overlaySpeaker.classList.toggle('hidden', !speaker);
    this.overlayHint.textContent = hint || '';
    this.overlayHint.classList.toggle('hidden', !hint);
    this.menuButtonsEl.classList.toggle('hidden', !showMenu);
    this.settingsPanel.classList.toggle('hidden', !showSettings);
    this.overlayActions.classList.toggle('hidden', !showActions);
    this.primaryAction.textContent = primary || 'Continue';
    this.secondaryAction.classList.toggle('hidden', !secondary || !showActions);
    if (secondary && showActions) this.secondaryAction.textContent = secondary;
    this._primaryAction = primaryAction || null;
    this._secondaryAction = secondaryAction || null;
  }

  close() {
    this.overlayEl.classList.add('hidden');
  }

  advance() {
    if (typeof this._primaryAction === 'function') this._primaryAction();
  }

  secondary() {
    if (typeof this._secondaryAction === 'function') this._secondaryAction();
  }

  renderSceneLine(line) {
    this.overlaySpeaker.textContent = line.speaker;
    this.overlaySpeaker.classList.toggle('hidden', !line.speaker);
    this.overlayBody.textContent = line.text;
  }
}

export function normalizeSceneLine(line) {
  if (typeof line === 'string') {
    return { speaker: 'Narrator', text: line };
  }
  return {
    speaker: line.speaker || 'Narrator',
    text: line.text || '',
  };
}
