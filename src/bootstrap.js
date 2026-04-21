const showBootError = error => {
  const overlay = document.getElementById('overlay');
  const eyebrow = document.getElementById('overlay-eyebrow');
  const title = document.getElementById('overlay-title');
  const body = document.getElementById('overlay-body');
  const speaker = document.getElementById('overlay-speaker');
  const hint = document.getElementById('overlay-hint');
  const menu = document.getElementById('menu-buttons');
  const settings = document.getElementById('settings-panel');
  const actions = document.getElementById('overlay-actions');
  const primary = document.getElementById('primary-action');
  const secondary = document.getElementById('secondary-action');

  if (!overlay || !title || !body) return;

  overlay.classList.remove('hidden');
  eyebrow.textContent = 'Boot Error';
  title.textContent = 'The Runtime Failed To Start';
  body.textContent = String(error?.stack || error?.message || error || 'Unknown error');
  speaker?.classList.add('hidden');
  hint?.classList.add('hidden');
  menu?.classList.add('hidden');
  settings?.classList.add('hidden');
  actions?.classList.remove('hidden');
  primary.textContent = 'Reload';
  primary.onclick = () => window.location.reload();
  secondary.classList.add('hidden');
};

window.addEventListener('error', event => {
  showBootError(event.error || event.message);
});

window.addEventListener('unhandledrejection', event => {
  showBootError(event.reason);
});

import('./app3d.js?v=20260412c').catch(showBootError);
