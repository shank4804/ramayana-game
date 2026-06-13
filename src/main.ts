import "./styles.css";

import { loadBootManifest } from "./assets/assetManager";
import { createDebugFlags } from "./diagnostics/debugFlags";
import { initPhysics } from "./physics/world";
import { RendererApp } from "./render/app/RendererApp";
import { getWebGL2SupportMessage, isWebGL2Available } from "./render/app/webglSupport";
import { createAppShell } from "./ui/appShell";

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

const shell = createAppShell(appRoot);

if (!isWebGL2Available()) {
  shell.showError(getWebGL2SupportMessage());
} else {
  const debugFlags = createDebugFlags(new URLSearchParams(window.location.search));
  let rendererApp: RendererApp | null = null;

  shell.showTitle(async () => {
    shell.showLoading(0, "Preparing renderer");

    shell.showLoading(0.2, "Loading physics");
    await initPhysics();

    rendererApp = new RendererApp({
      host: appRoot,
      debugFlags,
    });

    shell.showLoading(0.35, "Loading boot manifest");
    await loadBootManifest();

    shell.showLoading(0.75, "Composing scene");
    rendererApp.start();

    shell.showLoading(1, "Ready");
    shell.showGame();
  });

  window.addEventListener("beforeunload", () => {
    rendererApp?.dispose();
  });
}
