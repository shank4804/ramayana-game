export function createTitleScreen(root: HTMLElement, onPlay: () => void) {
  const overlay = document.createElement("div");
  overlay.className = "title-screen";

  const title = document.createElement("h1");
  title.textContent = "Ramayana";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Isometric arena slice";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Play";
  button.addEventListener("click", onPlay, { once: true });

  overlay.append(title, subtitle, button);
  root.append(overlay);

  return {
    remove() {
      overlay.remove();
    },
  };
}
