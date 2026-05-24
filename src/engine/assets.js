import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';

export class AssetLibrary {
  constructor({ onProgress, onLoad, onError } = {}) {
    this.cache = new Map();
    this.pending = 0;
    this.started = false;
    this.completed = false;

    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, loaded, total) => {
      const fraction = total > 0 ? loaded / total : 1;
      onProgress?.(fraction, url);
    };
    this.manager.onLoad = () => {
      this.completed = true;
      onLoad?.();
    };
    this.manager.onError = (url) => {
      onError?.(url);
    };

    this.gltfLoader = new GLTFLoader(this.manager);
    this._onProgress = onProgress;
    this._onLoad = onLoad;
  }

  loadGLTF(key, url) {
    if (this.cache.has(key)) return Promise.resolve(this.cache.get(key));
    this.pending += 1;
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.cache.set(key, gltf);
          resolve(gltf);
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  get(key) {
    return this.cache.get(key) || null;
  }

  clone(key) {
    const gltf = this.cache.get(key);
    if (!gltf) return null;
    return skeletonClone(gltf.scene);
  }

  getAnimations(key) {
    const gltf = this.cache.get(key);
    return gltf ? gltf.animations || [] : [];
  }

  /**
   * Signal that no more loads will be queued. If nothing was queued at all,
   * the LoadingManager's onLoad won't fire on its own — synthesize it so
   * boot still proceeds.
   */
  startAll() {
    this.started = true;
    if (this.pending === 0 && !this.completed) {
      setTimeout(() => {
        if (!this.completed) {
          this.completed = true;
          this._onProgress?.(1, null);
          this._onLoad?.();
        }
      }, 0);
    }
  }
}
