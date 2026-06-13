import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const threeRoot = fileURLToPath(new URL("./node_modules/three", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^three$/,
        replacement: `${threeRoot}/build/three.module.js`,
      },
      {
        find: /^three\/addons\/(.*)$/,
        replacement: `${threeRoot}/examples/jsm/$1`,
      },
    ],
    dedupe: ["three"],
  },
  optimizeDeps: {
    include: [
      "three",
      "three/addons/loaders/GLTFLoader.js",
      "three/addons/postprocessing/EffectComposer.js",
      "three/addons/postprocessing/RenderPass.js",
      "three/addons/postprocessing/ShaderPass.js",
    ],
  },
  build: {
    target: "es2022",
  },
});
