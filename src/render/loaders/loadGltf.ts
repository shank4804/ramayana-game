import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createGltfLoader(): GLTFLoader {
  return new GLTFLoader();
}
