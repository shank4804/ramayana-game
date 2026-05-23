const SAVE_KEY = 'ramayana-3d-openworld-v3';

export function hasSave() {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY));
  } catch (err) {
    return false;
  }
}

export function writeSave(snapshot) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (err) {
    console.warn('save write failed', err);
    return false;
  }
}

export function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('save read failed', err);
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    /* ignore */
  }
}

const SETTINGS_KEY = 'ramayana-3d-settings-v1';
const SETTINGS_DEFAULTS = {
  lookSensitivity: 1,
  quality: 'high',
  invertLookY: false,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      lookSensitivity: typeof parsed.lookSensitivity === 'number' ? parsed.lookSensitivity : SETTINGS_DEFAULTS.lookSensitivity,
      quality: ['medium', 'high', 'epic'].includes(parsed.quality) ? parsed.quality : SETTINGS_DEFAULTS.quality,
      invertLookY: !!parsed.invertLookY,
    };
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('settings write failed', err);
  }
}
