# Camera Control - Improvements & Roadmap

**Project**: Hand Gesture-Controlled 3D Scene Manipulation  
**Analysis Date**: December 6, 2025  
**Current Version**: 0.1.0  
**Status**: MVP Complete, Enhancement Phase

---

## 📊 Project Overview

A React application using MediaPipe Hand Tracking to manipulate 3D objects in a Three.js scene through hand gestures. Users can pinch, rotate, scale, and translate objects using natural hand movements captured via webcam.

### Current Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State**: TanStack Store
- **Data Fetching**: TanStack Query
- **Routing**: TanStack Router
- **3D Engine**: Three.js
- **Vision**: MediaPipe Hand Landmarker
- **UI**: shadcn/ui + Tailwind CSS
- **Linting**: Biome

---

## 🔴 CRITICAL FIXES

### 1. Add Error Boundaries
**Priority**: CRITICAL  
**Impact**: App crashes entirely on MediaPipe/camera failures  
**Effort**: 2-3 hours

**Implementation**:
```
File: src/components/error-boundary.tsx
- Create ErrorBoundary component with fallback UI
- Wrap VisionPanel with ErrorBoundary
- Wrap SceneCanvas with ErrorBoundary
- Add error logging/reporting
```

**Acceptance Criteria**:
- [ ] Camera failure shows user-friendly error message
- [ ] Scene errors don't crash entire app
- [ ] Error details logged to console
- [ ] Retry button available

---

### 2. Camera Permission Handling
**Priority**: CRITICAL  
**Impact**: Users confused when camera blocked  
**Effort**: 1-2 hours

**Implementation**:
```
File: src/features/vision/hooks/use-camera-permissions.ts
- Detect permission state (granted/denied/prompt)
- Show permission request UI
- Handle denial with instructions
- Provide browser settings link
```

**Acceptance Criteria**:
- [ ] Permission requested on app load
- [ ] Clear message when denied
- [ ] Instructions for enabling camera
- [ ] Retry after granting permission

---

### 3. Optimize Gesture Re-renders
**Priority**: CRITICAL  
**Impact**: Unnecessary re-renders at 30 FPS causing performance issues  
**Effort**: 1-2 hours

**Current Issue**:
```typescript
// gesture-hud.tsx lines 32-44
useEffect(() => {
  sceneActions.applyGesture({ ...8 dependencies });
}, [translation, scale, roll, pinchStrength, openness, handPresent, fps, lastUpdated]);
```

**Solution**:
```typescript
// Option A: Debounce gesture application
const debouncedGesture = useDeferredValue(gesture);

// Option B: Move to store subscription
// Let store handle updates directly, remove useEffect
```

**Acceptance Criteria**:
- [ ] Gesture application doesn't trigger excessive re-renders
- [ ] Performance maintains 30 FPS
- [ ] Gesture responsiveness not affected

---

### 4. Memory Leak Prevention
**Priority**: CRITICAL  
**Impact**: MediaPipe resources not fully cleaned up  
**Effort**: 1 hour

**Implementation**:
```
File: src/features/vision/hand-tracker.ts
- Ensure landmarker.close() called on unmount
- Cancel all pending RAF callbacks
- Clear video stream tracks
- Add cleanup verification
```

**Acceptance Criteria**:
- [ ] No memory growth on page navigate away
- [ ] Video stream fully stopped
- [ ] RAF callbacks cancelled
- [ ] MediaPipe resources released

---

## 🟡 HIGH-PRIORITY IMPROVEMENTS

### 5. Keyboard Controls
**Priority**: HIGH  
**Impact**: Accessibility - gesture-only input excludes some users  
**Effort**: 3-4 hours

**Implementation**:
```
File: src/features/scene/hooks/use-keyboard-controls.ts
- Arrow keys: translate object
- W/S: scale up/down
- Q/E: rotate left/right
- Space: toggle animation
- Delete: remove object
- Ctrl+Z/Y: undo/redo
```

**Acceptance Criteria**:
- [ ] All gesture actions available via keyboard
- [ ] Visual hints for keyboard shortcuts
- [ ] Smooth keyboard-based manipulation
- [ ] No conflicts with browser shortcuts

---

### 6. Gesture Calibration System
**Priority**: HIGH  
**Impact**: Hard-coded thresholds don't work for all users  
**Effort**: 4-5 hours

**Implementation**:
```
File: src/features/vision/components/calibration-wizard.tsx
- Guided calibration flow
- Test pinch threshold
- Test openness range
- Test roll sensitivity
- Save to localStorage
```

**Acceptance Criteria**:
- [ ] Calibration wizard on first launch
- [ ] User-specific sensitivity settings
- [ ] Re-calibration available in settings
- [ ] Default fallback values

---

### 7. Multi-Hand Support
**Priority**: HIGH  
**Impact**: Unlock advanced gestures  
**Effort**: 5-6 hours

**Implementation**:
```
File: src/features/vision/gesture-mapper.ts
- Update to numHands: 2
- Two-hand rotation (hands rotating together)
- Two-hand scale (pinch distance)
- Hand assignment (left = rotate, right = translate)
```

**Acceptance Criteria**:
- [ ] Detect up to 2 hands
- [ ] Two-hand gestures work smoothly
- [ ] Falls back to single-hand mode
- [ ] Visual indicator for detected hands

---

### 8. Undo/Redo System
**Priority**: HIGH  
**Impact**: No way to revert mistakes  
**Effort**: 3-4 hours

**Implementation**:
```
File: src/stores/history-store.ts
- Command pattern for transformations
- Max 50 history entries
- Undo/redo actions
- Keyboard shortcuts (Ctrl+Z/Y)
```

**Acceptance Criteria**:
- [ ] Undo last 50 actions
- [ ] Redo undone actions
- [ ] History cleared on object delete
- [ ] Visual undo/redo buttons

---

### 9. Performance Monitoring
**Priority**: HIGH  
**Impact**: Users don't know when performance degrades  
**Effort**: 2 hours

**Implementation**:
```
File: src/features/scene/components/performance-monitor.tsx
- FPS warning below 20 FPS
- Suggest reducing quality
- Show frame time graph
- Toggle detailed stats
```

**Acceptance Criteria**:
- [ ] Warning shown when FPS < 20
- [ ] Actionable suggestions provided
- [ ] Real-time FPS graph
- [ ] Can be hidden/minimized

---

### 10. Object Persistence
**Priority**: HIGH  
**Impact**: Scene lost on refresh  
**Effort**: 2-3 hours

**Implementation**:
```
File: src/lib/scene-persistence.ts
- Save scene to localStorage on change
- Restore on app load
- Auto-save every 5 seconds
- Clear saved state option
```

**Acceptance Criteria**:
- [ ] Scene persists across refreshes
- [ ] Max 5MB localStorage limit respected
- [ ] Option to start fresh scene
- [ ] Export/import scene JSON

---

## 🟢 NICE-TO-HAVE FEATURES

### 11. Gesture Tutorial
**Priority**: MEDIUM  
**Effort**: 4-5 hours

**Implementation**:
```
File: src/features/onboarding/gesture-tutorial.tsx
- Interactive step-by-step tutorial
- Demonstrate pinch gesture
- Demonstrate rotation
- Demonstrate scaling
- Skip option available
```

---

### 12. Gesture Recording/Playback
**Priority**: MEDIUM  
**Effort**: 5-6 hours

**Implementation**:
```
File: src/features/vision/gesture-recorder.ts
- Record gesture sequences
- Save to file
- Load and playback
- Useful for debugging/demos
```

---

### 13. Multiple Object Selection
**Priority**: MEDIUM  
**Effort**: 4-5 hours

**Implementation**:
```
File: src/features/scene/components/selection-manager.tsx
- Shift+click to multi-select
- Bounding box around selection
- Group transformation
- Select all / deselect all
```

---

### 14. Custom Object Shapes
**Priority**: MEDIUM  
**Effort**: 6-8 hours

**Implementation**:
```
Files:
- src/features/scene/object-loader.ts
- src/features/scene/components/shape-library.tsx

Features:
- Add torus, cylinder, dodecahedron
- GLTF model import
- Custom geometry builder
- Shape preview thumbnails
```

---

### 15. Lighting Controls
**Priority**: LOW  
**Effort**: 3-4 hours

**Implementation**:
```
File: src/features/scene/components/lighting-panel.tsx
- Light position controls
- Intensity slider
- Color picker
- Add/remove lights
```

---

### 16. Camera Controls
**Priority**: MEDIUM  
**Effort**: 2-3 hours

**Implementation**:
```
File: src/features/scene/hooks/use-orbit-controls.ts
- Mouse drag to orbit
- Scroll to zoom
- Right-click pan
- Reset camera button
```

---

### 17. Object Snapping
**Priority**: LOW  
**Effort**: 4-5 hours

**Implementation**:
```
File: src/features/scene/snapping-system.ts
- Snap to grid (configurable size)
- Snap to other objects
- Alignment guides (X, Y, Z axes)
- Toggle snapping on/off
```

---

### 18. Material Editor
**Priority**: LOW  
**Effort**: 4-5 hours

**Implementation**:
```
File: src/features/scene/components/material-editor.tsx
- Roughness slider
- Metalness slider
- Color picker
- Texture upload
- Material presets
```

---

### 19. Scene Export
**Priority**: MEDIUM  
**Effort**: 3-4 hours

**Implementation**:
```
File: src/features/scene/export-manager.ts
- Export as GLTF
- Screenshot as PNG
- Video recording of gestures
- Share scene URL
```

---

### 20. Gesture Confidence Indicator
**Priority**: LOW  
**Effort**: 2 hours

**Implementation**:
```
File: src/features/vision/components/confidence-meter.tsx
- Show hand detection confidence
- Show landmark quality
- Visual feedback on overlay
- Warning when confidence low
```

---

## 🔧 CODE QUALITY IMPROVEMENTS

### 21. Type Safety: Runtime Validation
**Priority**: MEDIUM  
**Effort**: 2 hours

**Implementation**:
```typescript
// src/features/vision/schemas.ts
import { z } from 'zod';

const GestureFrameSchema = z.object({
  translation: z.object({ x: z.number(), y: z.number() }),
  scale: z.number(),
  roll: z.number(),
  pinchStrength: z.number(),
  openness: z.number(),
  timestamp: z.number(),
});
```

---

### 22. Extract Magic Numbers
**Priority**: HIGH  
**Effort**: 1 hour

**Implementation**:
```typescript
// src/features/vision/constants.ts
export const GESTURE_THRESHOLDS = {
  PINCH_ACTIVATION: 0.25,
  ROTATION_OPENNESS: 0.3,
  SCALE_OPENNESS_MIN: 0.3,
  SCALE_OPENNESS_MAX: 0.9,
} as const;

export const SMOOTHING_FACTORS = {
  TRANSLATION: 0.6,
  ROLL: 0.5,
  PINCH: 0.55,
  OPENNESS: 0.55,
  SCALE: 0.35,
} as const;
```

---

### 23. Store Actions Testing
**Priority**: MEDIUM  
**Effort**: 4-5 hours

**Implementation**:
```
File: src/stores/__tests__/gesture-store.test.ts
File: src/stores/__tests__/scene-store.test.ts

Test Cases:
- Gesture smoothing calculations
- Clamping boundaries
- Mode transitions
- Edge cases (no hand, multiple hands)
```

---

### 24. Component Decomposition
**Priority**: MEDIUM  
**Effort**: 3-4 hours

**Current Issue**: SceneCanvas is 220 lines

**Solution**:
```
Hooks:
- src/features/scene/hooks/use-three-scene.ts
- src/features/scene/hooks/use-object-meshes.ts
- src/features/scene/hooks/use-animation-loop.ts
- src/features/scene/hooks/use-scene-lighting.ts
```

---

### 25. Improve Error Messages
**Priority**: LOW  
**Effort**: 1-2 hours

**Implementation**:
```typescript
// src/lib/error-codes.ts
export enum CameraErrorCode {
  PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  NOT_FOUND = 'CAMERA_NOT_FOUND',
  ALREADY_IN_USE = 'CAMERA_IN_USE',
  INSECURE_CONTEXT = 'CAMERA_INSECURE_CONTEXT',
}
```

---

### 26. Accessibility: ARIA Labels
**Priority**: MEDIUM  
**Effort**: 1-2 hours

**Implementation**:
```tsx
<canvas 
  ref={canvasRef}
  aria-label={`3D scene with ${objects.length} objects. Selected: ${selectedObject?.type}`}
  role="img"
/>
```

---

### 27. Dark Mode Support
**Priority**: MEDIUM  
**Effort**: 2-3 hours

**Implementation**:
```typescript
// src/features/scene/hooks/use-scene-theme.ts
const backgroundColor = document.documentElement.classList.contains('dark')
  ? new THREE.Color('#0f172a')
  : new THREE.Color('#f8fafc');
```

---

## 📊 ARCHITECTURE SUGGESTIONS

### 28. Separate Gesture Engine
**Priority**: LOW  
**Effort**: 6-8 hours

**Refactor**:
```
Create standalone class:
- src/features/vision/gesture-engine.ts
- Pure logic, no React dependencies
- Easier to test and maintain
- Can be used in Web Worker
```

---

### 29. Plugin System for Objects
**Priority**: LOW  
**Effort**: 8-10 hours

**Refactor**:
```typescript
// src/features/scene/plugins/object-plugin.ts
interface ObjectPlugin {
  type: string;
  createGeometry(): THREE.BufferGeometry;
  defaultMaterial(): THREE.Material;
  metadata: { icon: string; label: string };
}
```

---

### 30. WebWorker for Hand Tracking
**Priority**: LOW  
**Effort**: 10-12 hours (Complex)

**Implementation**:
```
File: src/features/vision/workers/hand-tracking.worker.ts
- Move MediaPipe to Web Worker
- OffscreenCanvas for video processing
- PostMessage for results
- Prevents main thread blocking
```

---

## 🚀 ADVANCED FEATURES

### 31. Multiplayer/Collaboration
**Priority**: LOW  
**Effort**: 20-30 hours

**Tech Stack**:
- WebRTC for peer-to-peer
- Socket.io for signaling
- CRDT for state sync
- Collaborative cursor indicators

---

### 32. AI Gesture Suggestions
**Priority**: LOW  
**Effort**: 15-20 hours

**Implementation**:
- Train ML model on successful gestures
- Suggest optimal gesture for desired action
- Real-time feedback on gesture quality
- Adaptive learning per user

---

### 33. Haptic Feedback
**Priority**: LOW  
**Effort**: 3-4 hours

**Implementation**:
```
File: src/features/scene/haptic-controller.ts
- Vibrate on object grab
- Vibrate on snap
- Gamepad API integration
- Mobile vibration support
```

---

### 34. Physics Simulation
**Priority**: MEDIUM  
**Effort**: 10-12 hours

**Tech Stack**:
- Rapier.js or Cannon.js
- Gravity, collisions, constraints
- Physics materials (bounce, friction)
- Toggle physics mode

---

### 35. Voice Commands
**Priority**: LOW  
**Effort**: 6-8 hours

**Implementation**:
```
File: src/features/voice/voice-controller.ts
- Web Speech API
- Commands: "add cube", "delete", "rotate"
- Multi-language support
- Voice feedback
```

---

## 📅 SUGGESTED ROADMAP

### Phase 1: Stability (Week 1-2)
**Goal**: Production-ready core experience

- [x] Error boundaries (#1)
- [x] Camera permission handling (#2)
- [x] Optimize re-renders (#3)
- [x] Memory leak prevention (#4)
- [x] Keyboard controls (#5)
- [x] Extract magic numbers (#22)

**Deliverable**: Stable, accessible MVP

---

### Phase 2: Polish (Week 3-4)
**Goal**: Enhanced UX

- [x] Object persistence (#10)
- [x] Gesture tutorial (#11)
- [x] Undo/redo system (#8)
- [x] Performance monitoring (#9)
- [x] Dark mode (#27)
- [x] Improved errors (#25)

**Deliverable**: Delightful user experience

---

### Phase 3: Advanced (Week 5-6)
**Goal**: Power features

- [x] Gesture calibration (#6)
- [x] Camera orbit controls (#16)
- [x] Multi-select objects (#13)
- [x] Scene export (#19)
- [x] Material editor (#18)
- [x] Custom shapes (#14)

**Deliverable**: Professional-grade tool

---

### Phase 4: Innovation (Week 7-8)
**Goal**: Differentiation

- [x] Multi-hand support (#7)
- [x] Gesture recording (#12)
- [x] Physics simulation (#34)
- [x] Voice commands (#35)

**Deliverable**: Industry-leading features

---

## 🎯 SUCCESS METRICS

### Performance
- ✅ Maintain 30 FPS with gesture tracking
- ✅ < 100ms latency from gesture to object update
- ✅ < 50MB memory usage
- ✅ < 5s initial load time

### Accuracy
- ✅ Gesture detection confidence > 80%
- ✅ < 5% false positive gesture triggers
- ✅ Hand tracking works in varied lighting

### UX
- ✅ First successful gesture within 10 seconds
- ✅ Tutorial completion rate > 80%
- ✅ Feature discovery without documentation > 60%

### Accessibility
- ✅ All actions available via keyboard
- ✅ Screen reader compatible
- ✅ WCAG 2.1 AA compliant
- ✅ Works with reduced motion preference

---

## 📝 NOTES

### Technical Debt
1. Replace hand-rolled state management with TanStack Query mutations
2. Add E2E tests with Playwright
3. Implement proper logging/monitoring
4. Add Storybook for component library
5. Set up automated visual regression testing

### Dependencies to Add
```json
{
  "rapier3d-compat": "^0.11.0",  // Physics
  "leva": "^0.9.35",              // Debug controls
  "drei": "^9.0.0",               // Three.js helpers
  "@use-gesture/react": "^10.0.0" // Advanced gestures
}
```

### Browser Support
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 100+ (MediaPipe limitations)
- ⚠️ Safari 15+ (limited MediaPipe support)
- ❌ Mobile (needs separate optimization)

---

**Last Updated**: December 6, 2025  
**Maintained By**: Project Team  
**Review Frequency**: Bi-weekly
