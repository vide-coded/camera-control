# Architecture Blueprint

## Goal
Real-time browser app that uses hand gestures from the camera to manipulate 3D objects (position, scale, rotation) with semi-transparent hand overlays and an object palette to place/select items.

## Scope (MVP)
- Client-only SPA (React + TypeScript + TanStack Router) served statically.
- WebRTC camera capture with GPU-accelerated hand landmark detection (MediaPipe Tasks Vision Hands via WebAssembly).
- Gesture mapping:
  - Pinch + drag → object position
  - Open/close hand → scale up/down
  - Palm roll (turning hand) → rotation
- Visual aids: hand mask/landmarks rendered with opacity over the scene.
- 3D scene: basic primitives (cube, sphere, cone) placed via overlay picker.
- State: client state only; no auth/payments/backend in MVP.

## Architecture Overview
- UI Shell: TanStack Router routes, shadcn/ui for overlay/panels, Tailwind for layout tokens.
- 3D Layer: Three.js scene with OrbitControls disabled; custom controller applies gesture deltas to selected object.
- Gesture Engine:
  - Camera stream → MediaPipe Hands (WASM) → landmarks + handedness.
  - Gesture interpreter converts landmarks to semantic gestures (pinch detect, openness, roll angle).
  - Emits normalized control signals `{ translation, scaleDelta, rotationDelta, intent: 'drag' | 'scale' | 'rotate' }`.
- Rendering Overlay:
  - Canvas/WebGL layer for three.js.
  - 2D canvas for hand overlay (semi-transparent) aligned to video.
- Object Palette:
  - Overlay panel listing primitives; tap to spawn at scene origin; select existing objects.
- State Management:
  - TanStack Store for global scene state (objects list, selection, gesture mode) and settings.
  - TanStack Query reserved for future backend; unused in MVP.
- Performance:
  - RequestAnimationFrame render loop; throttled gesture inference to ~30 FPS; debounce scale changes.
  - Lazy-load hand model bundle; fall back to static demo if camera blocked.

## Key Modules (planned)
- `src/lib/vision/hand-tracker.ts`: camera init, hand landmark inference (MediaPipe Tasks Vision), provides async generator/observable.
- `src/lib/vision/gesture-mapper.ts`: converts landmarks to gestures (pinch detection, openness ratio, roll angle).
- `src/lib/scene/scene-manager.ts`: three.js scene setup, object CRUD, selection helpers.
- `src/stores/sceneStore.ts`: TanStack Store for objects, selection, interaction mode.
- `src/components/canvas/SceneCanvas.tsx`: mounts WebGL renderer, applies control signals.
- `src/components/overlay/HandOverlay.tsx`: draws hand landmarks/segmentation with opacity.
- `src/components/palette/ObjectPalette.tsx`: overlay picker to add/select objects.
- `src/routes/index.tsx`: root view wiring camera, scene, overlays.

## Data Models (TypeScript shapes)
- `HandLandmarks`: `{ handedness: 'Left' | 'Right'; points: Array<{ x: number; y: number; z: number }>; openness: number; pinchStrength: number; roll: number; timestamp: number; }`
- `GestureSignal`: `{ type: 'translate' | 'scale' | 'rotate'; delta: { x?: number; y?: number; z?: number; scale?: number; yaw?: number; pitch?: number; roll?: number }; active: boolean; source: 'hand'; }`
- `SceneObject`: `{ id: string; kind: 'cube' | 'sphere' | 'cone'; position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number }; scale: { x: number; y: number; z: number }; selected: boolean; }`

## Gesture Mapping Notes
- Pinch to grab: detect thumb-index distance < threshold; while active, map wrist movement to object translation in screen space → project to 3D plane.
- Scale: openness ratio drives scale delta (smooth with clamp and low-pass filter).
- Rotation: palm roll angle maps to object y-axis rotation; optional wrist pitch/roll for x/z fine control.

## Constraints / Risks
- Browser support: requires WebGL2 + getUserMedia; provide graceful fallback message.
- Performance risk on low-end devices; keep model small and inference FPS capped.
- Lighting variance may affect hand detection; enable auto-exposure guidance message.

## Out of Scope (Post-MVP)
- Multi-user sync, persistence, auth, payments, recording/export, mobile optimizations, advanced shaders.
