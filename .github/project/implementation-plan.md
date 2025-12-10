# Implementation Plan - Camera Control

**Project**: Hand Gesture-Controlled 3D Scene  
**Plan Created**: December 6, 2025  
**Target Completion**: 8 weeks from start

---

## 🎯 PHASE 1: STABILITY (WEEK 1-2)

**Goal**: Production-ready core experience  
**Total Effort**: 12-16 hours

### Task 1.1: Error Boundaries ⚡ CRITICAL
**Effort**: 2-3 hours  
**Files to Create/Modify**:
- `src/components/error-boundary.tsx` (NEW)
- `src/routes/root.tsx` (MODIFY)
- `src/features/vision/components/vision-panel.tsx` (MODIFY)

**Steps**:
1. Create base ErrorBoundary component
2. Add specific error fallbacks for camera/scene
3. Wrap VisionPanel with CameraErrorBoundary
4. Wrap SceneCanvas with SceneErrorBoundary
5. Add error reporting (console + localStorage)

**Test Criteria**:
```typescript
// Test case 1: Camera blocked
// Expected: Show permission error, not crash

// Test case 2: MediaPipe load failure
// Expected: Show reload button, log error

// Test case 3: Three.js WebGL error
// Expected: Show WebGL error message
```

---

### Task 1.2: Camera Permission Handling ⚡ CRITICAL
**Effort**: 1-2 hours  
**Files to Create/Modify**:
- `src/features/vision/hooks/use-camera-permissions.ts` (NEW)
- `src/features/vision/components/camera-permission-prompt.tsx` (NEW)

**Steps**:
1. Create hook to check navigator.permissions
2. Build permission prompt UI component
3. Add instructions for enabling camera
4. Handle all states (prompt/granted/denied)
5. Add retry mechanism

**Test Criteria**:
```typescript
// Test case 1: First visit
// Expected: Show permission prompt

// Test case 2: Permission denied
// Expected: Show how to enable in browser

// Test case 3: Permission granted
// Expected: Start camera immediately
```

---

### Task 1.3: Optimize Gesture Re-renders ⚡ CRITICAL
**Effort**: 1-2 hours  
**Files to Modify**:
- `src/features/scene/components/gesture-hud.tsx`
- `src/hooks/use-gesture-store.ts`

**Steps**:
1. Remove useEffect with 8 dependencies
2. Move gesture application to store subscription
3. Add useDeferredValue for non-critical updates
4. Memoize gesture calculations

**Before**:
```typescript
useEffect(() => {
  sceneActions.applyGesture({ ...gesture });
}, [translation, scale, roll, ...]) // 8 deps = 30 re-renders/sec
```

**After**:
```typescript
// Option A: Store subscription
useEffect(() => {
  const unsubscribe = gestureStore.subscribe((state) => {
    sceneActions.applyGesture(state);
  });
  return unsubscribe;
}, []); // No deps = stable

// Option B: Deferred value
const deferredGesture = useDeferredValue(gesture);
```

---

### Task 1.4: Memory Leak Prevention ⚡ CRITICAL
**Effort**: 1 hour  
**Files to Modify**:
- `src/features/vision/hand-tracker.ts`
- `src/features/vision/hooks/use-hand-tracking.ts`

**Steps**:
1. Ensure landmarker.close() called in cleanup
2. Cancel all RAF callbacks
3. Stop video stream tracks
4. Add cleanup verification logging

**Implementation**:
```typescript
const stop = async () => {
  console.log('[HandTracker] Stopping...');
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  
  if (landmarker) {
    await landmarker.close();
    landmarker = null;
    console.log('[HandTracker] Landmarker closed');
  }
  
  // Stop video tracks
  if (videoElement?.srcObject) {
    const stream = videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('[HandTracker] Track stopped:', track.kind);
    });
  }
  
  lastTimestamp = 0;
};
```

---

### Task 1.5: Keyboard Controls 🎹
**Effort**: 3-4 hours  
**Files to Create**:
- `src/features/scene/hooks/use-keyboard-controls.ts` (NEW)
- `src/features/scene/components/keyboard-hints.tsx` (NEW)

**Keyboard Map**:
```typescript
const KEYBOARD_CONTROLS = {
  // Translation
  ArrowUp: 'translateY',    // Move up
  ArrowDown: 'translateY',  // Move down
  ArrowLeft: 'translateX',  // Move left
  ArrowRight: 'translateX', // Move right
  
  // Scale
  'w': 'scaleUp',
  's': 'scaleDown',
  
  // Rotation
  'q': 'rotateLeft',
  'e': 'rotateRight',
  
  // Actions
  ' ': 'toggleAnimation',
  'Delete': 'deleteObject',
  'Escape': 'deselectAll',
  
  // Undo/Redo (Phase 2)
  'Control+z': 'undo',
  'Control+y': 'redo',
};
```

**Implementation**:
```typescript
export function useKeyboardControls() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const selected = sceneStore.state.selectedId;
      if (!selected) return;
      
      switch (event.key) {
        case 'ArrowUp':
          sceneActions.translateSelected({ y: 0.1 });
          break;
        // ... etc
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

---

### Task 1.6: Extract Magic Numbers 📐
**Effort**: 1 hour  
**Files to Create**:
- `src/features/vision/constants.ts` (NEW)
- `src/features/scene/constants.ts` (NEW)

**Files to Modify**:
- `src/features/vision/gesture-mapper.ts`
- `src/stores/gesture-store.ts`
- `src/stores/scene-store.ts`

**New Files Content**:
```typescript
// src/features/vision/constants.ts
export const GESTURE_THRESHOLDS = {
  PINCH_ACTIVATION: 0.25,
  ROTATION_OPENNESS_MAX: 0.3,
  SCALE_OPENNESS_MIN: 0.3,
  SCALE_OPENNESS_MAX: 0.9,
  TRANSLATE_OPENNESS_MIN: 0.3,
} as const;

export const SMOOTHING_FACTORS = {
  TRANSLATION: 0.6,
  ROLL: 0.5,
  PINCH: 0.55,
  OPENNESS: 0.55,
  SCALE: 0.35,
} as const;

export const HAND_TRACKING_CONFIG = {
  MIN_DETECTION_CONFIDENCE: 0.2,
  MIN_PRESENCE_CONFIDENCE: 0.2,
  MIN_TRACKING_CONFIDENCE: 0.2,
  NUM_HANDS: 1,
  MAX_FPS: 30,
} as const;

// src/features/scene/constants.ts
export const SCENE_BOUNDS = {
  POSITION_X: { min: -3, max: 3 },
  POSITION_Y: { min: -1.5, max: 3 },
  ROTATION_X: { min: -Math.PI / 2, max: Math.PI / 2 },
  ROTATION_Y: { min: -Math.PI, max: Math.PI },
  ROTATION_Z: { min: -Math.PI / 2, max: Math.PI / 2 },
  SCALE: { min: 0.6, max: 1.9 },
} as const;

export const MANIPULATION_FACTORS = {
  TRANSLATION: 0.2,
  ROTATION_ROLL: 0.08,
  ROTATION_YAW: 0.12,
} as const;
```

---

### Phase 1 Checklist
- [ ] Error boundaries implemented
- [ ] Camera permissions handled
- [ ] Re-render optimization complete
- [ ] Memory leaks fixed
- [ ] Keyboard controls working
- [ ] Magic numbers extracted
- [ ] All TypeScript errors resolved
- [ ] No console warnings
- [ ] Manual testing passed

**Deliverable**: Stable, accessible MVP ready for users

---

## 🎨 PHASE 2: POLISH (WEEK 3-4)

**Goal**: Enhanced UX  
**Total Effort**: 16-20 hours

### Task 2.1: Object Persistence 💾
**Effort**: 2-3 hours  
**Files to Create**:
- `src/lib/scene-persistence.ts` (NEW)

**Implementation**:
```typescript
// Auto-save to localStorage
export const scenePersistence = {
  save: (state: SceneState) => {
    localStorage.setItem('camera-control:scene', JSON.stringify(state));
  },
  
  load: (): SceneState | null => {
    const data = localStorage.getItem('camera-control:scene');
    return data ? JSON.parse(data) : null;
  },
  
  clear: () => {
    localStorage.removeItem('camera-control:scene');
  },
};

// Usage in store
export const sceneStore = new Store<SceneState>(
  scenePersistence.load() ?? initialState
);

// Auto-save on changes (debounced)
sceneStore.subscribe(debounce((state) => {
  scenePersistence.save(state);
}, 1000));
```

---

### Task 2.2: Gesture Tutorial 🎓
**Effort**: 4-5 hours  
**Files to Create**:
- `src/features/onboarding/gesture-tutorial.tsx` (NEW)
- `src/features/onboarding/tutorial-store.ts` (NEW)

**Tutorial Steps**:
1. Welcome screen
2. Show your hand (detect hand)
3. Pinch gesture (detect pinch)
4. Move object (successful translation)
5. Rotate object (successful rotation)
6. Scale object (successful scale)
7. Complete!

**Implementation**:
```typescript
type TutorialStep = 
  | 'welcome'
  | 'show-hand'
  | 'pinch'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'complete';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Camera Control',
    instruction: 'Use hand gestures to control 3D objects',
    nextButton: 'Start Tutorial',
  },
  {
    id: 'show-hand',
    title: 'Show Your Hand',
    instruction: 'Hold your hand in front of the camera',
    validation: (gesture) => gesture.handPresent,
  },
  // ... etc
];
```

---

### Task 2.3: Undo/Redo System ↩️
**Effort**: 3-4 hours  
**Files to Create**:
- `src/stores/history-store.ts` (NEW)
- `src/features/scene/components/history-controls.tsx` (NEW)

**Implementation**:
```typescript
type Command = {
  type: 'translate' | 'rotate' | 'scale' | 'add' | 'delete';
  objectId: string;
  before: Partial<SceneObject>;
  after: Partial<SceneObject>;
  timestamp: number;
};

type HistoryState = {
  past: Command[];
  future: Command[];
  maxSize: number;
};

export const historyStore = new Store<HistoryState>({
  past: [],
  future: [],
  maxSize: 50,
});

export const historyActions = {
  push: (command: Command) => {
    historyStore.setState((state) => ({
      past: [...state.past, command].slice(-state.maxSize),
      future: [], // Clear future on new action
    }));
  },
  
  undo: () => {
    const state = historyStore.state;
    if (state.past.length === 0) return;
    
    const command = state.past[state.past.length - 1];
    // Apply 'before' state
    sceneActions.updateObject(command.objectId, command.before);
    
    historyStore.setState({
      past: state.past.slice(0, -1),
      future: [command, ...state.future],
    });
  },
  
  redo: () => {
    // Similar implementation
  },
};
```

---

### Task 2.4: Performance Monitoring 📊
**Effort**: 2 hours  
**Files to Create**:
- `src/features/scene/components/performance-monitor.tsx` (NEW)
- `src/hooks/use-performance.ts` (NEW)

**Implementation**:
```typescript
export function usePerformance() {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measure = () => {
      const now = performance.now();
      frameCount++;
      
      if (now >= lastTime + 1000) {
        setFps(frameCount);
        setFrameTime(1000 / frameCount);
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(measure);
    };
    
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return { fps, frameTime, isLow: fps < 20 };
}
```

---

### Task 2.5: Dark Mode Support 🌙
**Effort**: 2-3 hours  
**Files to Create**:
- `src/hooks/use-theme.ts` (NEW)
- `src/features/scene/hooks/use-scene-theme.ts` (NEW)

**Implementation**:
```typescript
// Update Three.js scene colors based on theme
export function useSceneTheme(scene: THREE.Scene | null) {
  const isDark = document.documentElement.classList.contains('dark');
  
  useEffect(() => {
    if (!scene) return;
    
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const floorColor = isDark ? '#1e293b' : '#e2e8f0';
    
    scene.background = new THREE.Color(bgColor);
    
    // Update floor material
    const floor = scene.getObjectByName('floor') as THREE.Mesh;
    if (floor?.material instanceof THREE.MeshStandardMaterial) {
      floor.material.color.set(floorColor);
    }
  }, [scene, isDark]);
}
```

---

### Task 2.6: Improved Error Messages 📝
**Effort**: 1-2 hours  
**Files to Create**:
- `src/lib/error-codes.ts` (NEW)
- `src/lib/error-messages.ts` (NEW)

**Implementation**:
```typescript
export enum ErrorCode {
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  CAMERA_NOT_FOUND = 'CAMERA_NOT_FOUND',
  CAMERA_IN_USE = 'CAMERA_IN_USE',
  CAMERA_INSECURE_CONTEXT = 'CAMERA_INSECURE_CONTEXT',
  MEDIAPIPE_LOAD_FAILED = 'MEDIAPIPE_LOAD_FAILED',
  WEBGL_NOT_SUPPORTED = 'WEBGL_NOT_SUPPORTED',
}

export const ERROR_MESSAGES: Record<ErrorCode, {
  title: string;
  description: string;
  action: string;
}> = {
  [ErrorCode.CAMERA_PERMISSION_DENIED]: {
    title: 'Camera Access Denied',
    description: 'Please allow camera access to use hand gestures',
    action: 'Click the camera icon in your browser\'s address bar',
  },
  // ... etc
};
```

---

### Phase 2 Checklist
- [ ] Scene persists across refreshes
- [ ] Tutorial flow complete
- [ ] Undo/redo working
- [ ] Performance warnings shown
- [ ] Dark mode implemented
- [ ] Error messages improved
- [ ] User testing feedback incorporated
- [ ] Documentation updated

**Deliverable**: Delightful user experience

---

## ⚡ PHASE 3: ADVANCED (WEEK 5-6)

**Goal**: Power features  
**Total Effort**: 24-30 hours

### Task 3.1: Gesture Calibration 🎛️
**Effort**: 4-5 hours

### Task 3.2: Camera Orbit Controls 🎥
**Effort**: 2-3 hours

### Task 3.3: Multi-Select Objects 🔲
**Effort**: 4-5 hours

### Task 3.4: Scene Export 💾
**Effort**: 3-4 hours

### Task 3.5: Material Editor 🎨
**Effort**: 4-5 hours

### Task 3.6: Custom Shapes 📦
**Effort**: 6-8 hours

**Deliverable**: Professional-grade tool

---

## 🚀 PHASE 4: INNOVATION (WEEK 7-8)

**Goal**: Differentiation  
**Total Effort**: 30-40 hours

### Task 4.1: Multi-Hand Support 👐
**Effort**: 5-6 hours

### Task 4.2: Gesture Recording 📹
**Effort**: 5-6 hours

### Task 4.3: Physics Simulation ⚛️
**Effort**: 10-12 hours

### Task 4.4: Voice Commands 🎤
**Effort**: 6-8 hours

**Deliverable**: Industry-leading features

---

## 📋 DEVELOPMENT WORKFLOW

### Daily Routine
1. Pull latest from main
2. Create feature branch: `feature/task-number-name`
3. Implement task following plan
4. Write tests for new functionality
5. Run linter: `npm run lint`
6. Test manually in dev mode
7. Create PR with description
8. Request code review
9. Merge after approval

### Branch Naming
- `feature/1.1-error-boundaries`
- `fix/gesture-memory-leak`
- `refactor/extract-constants`
- `docs/update-readme`

### Commit Messages
```
feat(vision): add camera permission handling
fix(scene): prevent memory leak in hand tracker
refactor(gesture): extract magic numbers to constants
docs(readme): add keyboard shortcuts section
test(store): add gesture store unit tests
```

### Testing Strategy
1. **Unit Tests**: All store actions, utilities
2. **Integration Tests**: Feature interactions
3. **E2E Tests**: Critical user paths
4. **Manual Tests**: Gesture accuracy, performance

---

## 🎯 DEFINITION OF DONE

Each task is "Done" when:
- [ ] Code implemented and working
- [ ] TypeScript errors resolved
- [ ] Biome warnings resolved
- [ ] Unit tests written (if applicable)
- [ ] Manual testing passed
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Merged to main branch

---

## 📊 TRACKING PROGRESS

Use GitHub Projects or similar tool to track:
- **Backlog**: All planned tasks
- **In Progress**: Currently working on
- **In Review**: Awaiting code review
- **Done**: Merged and deployed

Update weekly in standup meetings.

---

**Last Updated**: December 6, 2025  
**Next Review**: End of Week 2 (Phase 1 completion)
