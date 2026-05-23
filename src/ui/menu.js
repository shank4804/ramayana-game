export class TitleMenu {
  constructor(elements) {
    Object.assign(this, elements);
    this.index = 0;
  }

  buttons() {
    return [this.menuNewGame, this.menuLoadGame, this.menuSettings, this.menuExit]
      .filter(button => !button.disabled);
  }

  focus() {
    [this.menuNewGame, this.menuLoadGame, this.menuSettings, this.menuExit].forEach(button => {
      button.classList.remove('is-active');
    });
    const buttons = this.buttons();
    const clampedIndex = Math.max(0, Math.min(this.index, Math.max(buttons.length - 1, 0)));
    this.index = clampedIndex;
    buttons.forEach((button, index) => {
      button.classList.toggle('is-active', index === this.index);
    });
  }

  handleKey(event) {
    const buttons = this.buttons();
    if (buttons.length === 0) return;

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      event.preventDefault();
      this.index = (this.index + 1) % buttons.length;
      this.focus();
      return;
    }

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      this.index = (this.index - 1 + buttons.length) % buttons.length;
      this.focus();
      return;
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      buttons[this.index]?.click();
    }
  }

  syncSettingsUI(settings) {
    this.sensitivityInput.value = String(settings.lookSensitivity);
    this.qualityInput.value = settings.quality;
    this.invertYInput.checked = settings.invertLookY;
  }
}
