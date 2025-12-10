# Roadmap

## Phase 0 — Planning (Today)
- Define architecture and scope (done).
- Establish tasks and agents.

## Phase 1 — Environment & Scaffold
- Init frontend stack: React + TypeScript + Vite + TanStack Router + Tailwind + shadcn/ui + Biome.
- Add three.js setup and base scene with a default object.
- Wire TanStack Store for scene state.
- Add basic UI shell and overlay panel container.

## Phase 2 — Vision & Gesture MVP
- Integrate camera capture with permissions UX and fallback messaging.
- Add MediaPipe Hands (WASM) loader with lazy-load and inference loop (~30 FPS cap).
- Implement gesture mapper (pinch translate, openness scale, roll rotation) with smoothing/clamping.
- Render semi-transparent hand overlay (landmarks/mask) aligned to video.

## Phase 3 — Scene Interaction
- Hook gesture signals to three.js controls for translation/scale/rotation of selected object.
- Implement object palette overlay (spawn cube/sphere/cone) and selection logic.
- Add visual feedback for selection and active gesture mode.

## Phase 4 — Polish & QA
- Performance tuning (throttling, memoization, model cache) and device checks.
- Accessibility: keyboard fallbacks to move/scale/rotate; focusable palette; ARIA labels.
- Error states: camera blocked, model load failure, unsupported browser fallback.
- Add basic tests for gesture math and state reducers.

## Post-MVP (Not now)
- Multi-object persistence, export/recording, multiplayer sync, mobile-first tuning, auth/payments.
