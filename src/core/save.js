const KEY = 'ramayana-rewrite-v1';

export function hasSave() {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

export function readSave() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSave(snapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('save failed', err);
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
