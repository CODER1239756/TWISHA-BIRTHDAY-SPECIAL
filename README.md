# Twisha's Garden

An immersive 3D birthday garden: a golden-hour meadow beside a lake, with glass UI floating over the scene. Every thought is a seed; let it grow.

**Status: Stage 1 (foundation).** A running app with a placeholder 3D scene and a non-functional UI preview. Thoughts cannot be submitted and nothing grows yet.

## What works today

- A 3D golden-hour scene (sky, mountains, lake, meadow with grass, flowers, boulders and drifting light motes) with a slow camera drift that follows touch/pointer.
- A responsive glass UI shell: left rail, title, thought-type chips, input pill, a sample growth card and a quote. **All controls are disabled previews.**
- Pure, tested growth math in `src/lib/growth.ts` (not connected to the UI yet).
- CI (typecheck, test, build) and automatic deploy to GitHub Pages.

## Tech

React 19, TypeScript, Vite, three.js, React Three Fiber, Drei (installed for later stages, not used yet), Vitest, plain CSS with CSS variables. No router, no state library, no backend.

## Project structure

```
.github/workflows/ci-deploy.yml   typecheck + test + build, then deploy to Pages
index.html                         page shell, Google Fonts link
vite.config.ts                     Pages base path + Vitest config
src/main.tsx, App.tsx              entry, composition
src/scene/GardenCanvas.tsx         Canvas, lights, fog, tone mapping, DPR cap
src/scene/Backdrop.tsx             sky dome, mountain layers, lake  (PLACEHOLDERS)
src/scene/Ground.tsx               terrain, grass, flowers, boulders, motes (PLACEHOLDERS)
src/scene/CameraRig.tsx            idle drift + pointer parallax
src/scene/palette.ts               shared sun/sky colours and sky GLSL
src/scene/terrain.ts               height function + seeded random
src/scene/motion.ts                prefers-reduced-motion flag
src/ui/GlassShell.tsx              the (inert) glass interface
src/styles/tokens.css              colours, font, spacing, safe areas
src/styles/glass.css               layout and glass styling
src/lib/growth.ts                  deterministic growth from timestamps
tests/growth.test.ts               unit tests for growth.ts
docs/README-SETUP.md               iPad/GitHub-browser workflow
```

## Setup (no terminal needed)

See [docs/README-SETUP.md](docs/README-SETUP.md) for the step-by-step iPad workflow. With a computer instead: `npm install`, then `npm run dev`.

Scripts: `dev`, `build`, `preview`, `typecheck`, `test`.

## Deployment

Pushing to `main` runs the workflow, which installs, typechecks, tests, builds and deploys to GitHub Pages. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions** (one-time).

**Base path.** Project sites live at `https://<user>.github.io/<repo>/`. `vite.config.ts` reads `GITHUB_REPOSITORY` in Actions and sets the base to `/<repo>/` automatically, so renaming the repository needs no code change. A repo named `<user>.github.io` gets `/`. Override with the `VITE_BASE` environment variable (for example for a custom domain).

## Design notes

- **Font:** Cormorant Garamond from Google Fonts. Change `--font-display` / `--font-ui` in `src/styles/tokens.css` and the `<link>` in `index.html`.
- **Growth is derived, never stored.** `growthAt(plantedAt, now)` is a pure function; on reopen, plants are rebuilt from saved thoughts and timestamps. The stage durations (72 h total) are placeholders to tune in Stage 3.
- **Performance targets, not guarantees:** pixel ratio capped at 1.5, one shadow-casting light (1024 map), instanced grass/flowers/boulders, no post-processing. These must be measured on the actual iPad.

## Known limitations

- **Not yet built or run here.** The environment that wrote this code could not install packages, so the first real build happens in GitHub Actions. Check the Actions run before trusting anything.
- **The 3D scene has never been rendered** by its author. Expect to tune colours, camera and shader details after first sight.
- **Dependency versions:** `react`, `three` and `@types/three` are pinned exactly; the rest use caret ranges (`vite ^7`, `@react-three/fiber ^9`, `@react-three/drei ^10`, and so on) because exact patch versions could not be checked. CI runs `npm install --legacy-peer-deps` since no lockfile exists yet; the run uploads a `package-lock` artifact you can commit later for reproducible installs.
- Ground, mountains, lake and sky are procedural placeholders. The pergola and pond arrive in Stage 2 as real models.
- The lake does not reflect the mountains or meadow, only the sky.
- Fonts load from Google Fonts, so offline the UI falls back to a system serif.
- There is no WebGL-unavailable fallback beyond the sky-coloured page background.
- No accessibility audit or real-device performance measurement yet.

## Roadmap

Stage 2 design system and garden (real pergola/pond) · Stage 3 Thought Garden (Zustand, storage, growth wired in) · Stage 4 other experiences · Stage 5 quality · Stage 6 verification.
