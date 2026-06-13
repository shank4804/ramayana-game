import * as THREE from "three";

import type { DebugFlags } from "../../diagnostics/debugFlags";
import { createWorldHubManager, type LoadedWorldHub, type WorldHubManager } from "./hubManager";

export interface SceneSetup {
  scene: THREE.Scene;
  hub: LoadedWorldHub;
  hubManager: WorldHubManager;
}

export function createScene(debugFlags: DebugFlags): SceneSetup {
  const scene = new THREE.Scene();
  const hubManager = createWorldHubManager(scene, debugFlags);
  const hub = hubManager.loadHub("ayodhya");

  return {
    scene,
    hub,
    hubManager,
  };
}
