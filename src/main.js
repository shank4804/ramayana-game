const showBootError = (message) => {
  const el = document.getElementById('boot-error');
  const text = document.getElementById('boot-error-text');
  if (text) text.textContent = message;
  el?.classList.remove('hidden');
};

try {
  const { Game } = await import('./game/game.js');
  new Game(document.getElementById('app'));
} catch (err) {
  console.error(err);
  showBootError(err?.message || String(err));
}
