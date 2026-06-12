import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    dedupe: ["three"],
  },
  build: {
    target: "es2022",
  },
});
