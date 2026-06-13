# Credits

## CC0 Assets

- Base humanoid character mesh and animations (`assets/runtime/characters/base_humanoid.glb`) - from Kenney's "Starter Kit: 3D Platformer" (https://github.com/KenneyNL/Starter-Kit-3D-Platformer), by Kenney (https://kenney.nl), dedicated to CC0-1.0. The committed file has its external texture references stripped; every visible part is recoloured at runtime, so no texture ships with it.
- Ramayana Game code-built bow, quiver, and crown accessories - authored in `src/assets/characters/ramaStandIn.ts` for this repository and dedicated to CC0-1.0.

## Notes

- The shared humanoid GLB is recoloured per character (skin/cloth palette swaps) and given code-built accessories in `src/assets/characters/ramaStandIn.ts`; a primitive figure remains as a fallback if the model has not preloaded. The recolor and accessory-socket contract stays ready for a higher-fidelity Quaternius CC0 character when one is sourced.
- The first audio pass is procedural Web Audio generated in `src/audio/ayodhyaAudio.ts`; no external audio files are used yet.
