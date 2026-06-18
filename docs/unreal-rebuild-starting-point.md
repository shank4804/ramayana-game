# Ramayana Unreal Rebuild Starting Point

This document is a high-level starting point for rebuilding the current browser prototype as a new Unreal Engine project. It is intentionally not a full design document yet. The goal is to expand this with much more detail around gameplay, story, visual direction, technical architecture, assets, milestones, and MCP-assisted editor workflows.

## Intent

The current project is a lightweight Vite/TypeScript prototype. The next version should be rebuilt from scratch in Unreal Engine so the game can support richer visuals, stronger character presentation, more cinematic environments, better combat feel, and a more polished third-person action experience.

The Unreal version should not be treated as a direct file-by-file port. The browser prototype is useful as a reference for the core idea: Rama fighting rakshasa enemies in an arena-like action setup. The Unreal project should be designed around Unreal-native systems from the beginning.

## Why Unreal Engine

Unreal gives us a better foundation for:

- High-quality 3D character presentation
- Cinematic lighting and environments
- Animation-driven combat
- Enemy AI behavior trees
- Niagara VFX for arrows, impacts, fire, dust, and divine effects
- Better camera control and combat feedback
- Marketplace/Fab asset usage
- Blueprint iteration for gameplay tuning
- C++ foundations for reusable systems

## MCP Goal

If an Unreal MCP server is installed and connected to Codex, it should let the assistant interact with Unreal Editor more directly instead of only writing source files. The intended workflow is:

- Codex writes and edits C++ classes, config, and content scripts.
- Unreal MCP exposes editor operations such as creating assets, Blueprints, levels, actors, materials, and components.
- Unreal Editor remains the visual source of truth for level layout, lighting, asset placement, and Blueprint wiring.
- Iteration happens through small playable slices instead of long speculative design passes.

At the moment, this repo does not include an Unreal MCP server or an Unreal project. That needs to be installed and connected separately.

## Suggested Local Setup

Create the Unreal rebuild as a separate project rather than replacing this repo immediately:

```text
/Users/shashank/workspace/ramayana-unreal
```

Recommended Unreal template:

```text
Third Person C++ project
```

Recommended project name:

```text
RamayanaUnreal
```

Once the Unreal direction is stable, this repository can either be archived as the browser prototype or reorganized to include the Unreal project.

## Unreal MCP Install Shape

The exact commands depend on the Unreal MCP implementation selected. Most setups have two parts:

```text
RamayanaUnreal/
  Plugins/
    UnrealMCP/
      UnrealMCP.uplugin
```

and a local MCP server process:

```text
unreal-mcp-server/
  server.py
  package.json
  pyproject.toml
```

Typical installation flow:

1. Install Unreal Engine locally through Epic Games Launcher.
2. Create the new Third Person C++ project.
3. Install or clone the Unreal MCP server/plugin.
4. Copy or symlink the plugin into `RamayanaUnreal/Plugins/`.
5. Enable the plugin inside Unreal Editor.
6. Enable any required Unreal editor plugins, commonly:
   - Python Editor Script Plugin
   - Editor Scripting Utilities
   - Remote Control API
7. Register the MCP server in Codex config at:

```text
/Users/shashank/.codex/config.toml
```

Example Python-style Codex MCP config:

```toml
[mcp_servers.unreal]
command = "/opt/homebrew/bin/uv"
args = ["--directory", "/Users/shashank/workspace/unreal-mcp", "run", "server.py"]
startup_timeout_sec = 120
```

Example Node-style Codex MCP config:

```toml
[mcp_servers.unreal]
command = "/opt/homebrew/bin/node"
args = ["/Users/shashank/workspace/unreal-mcp/dist/index.js"]
startup_timeout_sec = 120
```

These are examples only. The final command should come from the selected Unreal MCP package's documentation.

## Initial Game Direction

The first Unreal version should be a compact vertical slice:

- Rama as a third-person playable hero
- Bow aim and fire
- Basic melee strike
- Rakshasa enemy type
- Enemy chase, attack, stagger, and death behavior
- Small forest or temple arena
- One wave-based encounter
- Health, damage, hit reactions, and simple HUD
- Basic VFX for arrows, impacts, and enemy defeat

The target is not a large open-world game at first. The target is a small, polished, replayable combat encounter that proves the feel, visuals, and production direction.

## Suggested Unreal Architecture

Start with C++ base classes and expose tuning knobs to Blueprint:

```text
Source/RamayanaUnreal/
  RamaCharacter
  RamaPlayerController
  CombatComponent
  BowComponent
  HealthComponent
  EnemyCharacter
  RakshasaAIController
  WaveSpawner
  AbilityData
```

Suggested content layout:

```text
Content/
  Characters/
    Rama/
    Rakshasa/
  Environments/
    ForestArena/
    TempleArena/
  VFX/
    Arrows/
    Impacts/
    Divine/
  UI/
  Maps/
  Audio/
  Data/
```

## Design Areas To Expand

This needs much more detail before serious production:

- Rama's movement style and combat identity
- Bow mechanics, arrow types, and target lock behavior
- Melee combo design
- Enemy types and encounter pacing
- Ramayana-inspired story framing
- Visual references for forests, temples, costumes, weapons, and VFX
- Level blockout plan
- Asset sourcing plan from Fab, custom modeling, or generated concepts
- Animation requirements
- Audio and music direction
- UI/HUD style
- Save/progression model
- Performance targets
- Milestone plan
- Definition of done for the first playable slice

## First Milestone

The first milestone should be:

```text
A playable Unreal arena where Rama can move, aim, shoot arrows, strike in melee,
fight three rakshasa enemies, win the encounter, and restart the wave.
```

This should be built before expanding into story, multiple levels, advanced abilities, or richer progression.

