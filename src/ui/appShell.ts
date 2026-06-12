import { formatLoadingProgress } from "./loadingState";

interface AppShell {
  showTitle(onStart: () => void | Promise<void>): void;
  showLoading(progress: number, detail: string): void;
  showGame(): void;
  showError(message: string): void;
}

export function createAppShell(root: HTMLElement): AppShell {
  const overlay = document.createElement("section");
  overlay.className = "screen-layer";
  overlay.setAttribute("aria-live", "polite");
  root.appendChild(overlay);

  return {
    showTitle(onStart) {
      overlay.className = "screen-layer";
      overlay.hidden = false;
      overlay.innerHTML = "";

      const panel = document.createElement("div");
      panel.className = "title-panel";

      const kicker = document.createElement("p");
      kicker.className = "title-kicker";
      kicker.textContent = "Third-person action adventure";

      const heading = document.createElement("h1");
      heading.className = "title-heading";
      heading.textContent = "Ramayana";

      const copy = document.createElement("p");
      copy.className = "title-copy";
      copy.textContent =
        "Begin the journey from Ayodhya's courts toward forest paths, mountain alliances, and the gates of Lanka.";

      const button = document.createElement("button");
      button.className = "primary-action";
      button.type = "button";
      button.textContent = "Begin";
      button.addEventListener("click", () => {
        void onStart();
      });

      panel.append(kicker, heading, copy, button);
      overlay.append(panel);
    },

    showLoading(progress, detail) {
      overlay.className = "screen-layer";
      overlay.hidden = false;
      overlay.innerHTML = "";

      const panel = document.createElement("div");
      panel.className = "status-panel";

      const title = document.createElement("h2");
      title.className = "status-title";
      title.textContent = "Loading";

      const status = document.createElement("p");
      status.className = "status-detail";
      status.textContent = `${detail} ${formatLoadingProgress(progress)}`;

      const progressShell = document.createElement("div");
      progressShell.className = "progress-shell";

      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      progressBar.style.width = formatLoadingProgress(progress);

      progressShell.append(progressBar);
      panel.append(title, status, progressShell);
      overlay.append(panel);
    },

    showGame() {
      overlay.hidden = true;
    },

    showError(message) {
      overlay.className = "screen-layer webgl-error";
      overlay.hidden = false;
      overlay.innerHTML = "";

      const panel = document.createElement("div");
      panel.className = "status-panel";

      const title = document.createElement("h1");
      title.className = "status-title";
      title.textContent = "WebGL2 required";

      const detail = document.createElement("p");
      detail.className = "status-detail";
      detail.textContent = message;

      panel.append(title, detail);
      overlay.append(panel);
    },
  };
}
