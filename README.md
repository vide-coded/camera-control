# 🎮 Camera Control

**Hand gesture-controlled 3D scene manipulation using computer vision**

Control 3D objects in a scene using your webcam and hand gestures. Pinch, move, rotate, and scale objects naturally with MediaPipe hand tracking.

## ✨ Features

- 🖐️ **Ultra-Precision Hand Tracking** - MediaPipe Hands with 60 FPS processing, GPU-accelerated
- 🎯 **1:1 Gesture Mapping** - Perfect hand-to-cube synchronization with near-zero latency
- 🎨 **3D Scene** - Three.js-powered interactive 3D environment
- 🎪 **Object Palette** - Spawn and control multiple shapes (cube, sphere, cone)
- ⌨️ **Keyboard Controls** - Full WCAG 2.1 AA accessible keyboard navigation
- 🚀 **Extreme Performance** - Zero throttling, 60 FPS rendering, instant gesture response
- ♿ **Accessible** - Screen reader support, ARIA labels, keyboard shortcuts
- 🧪 **Tested** - 31 unit tests with Vitest

> **🎯 NEW**: Ultra-precision tracking system with 1:1 rotation mapping and instant response. See [PRECISION_TRACKING.md](./PRECISION_TRACKING.md) for technical details.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Modern browser** with WebRTC support (Chrome, Edge, Firefox, Safari)
- **Webcam** for gesture control

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/camera-control.git
cd camera-control

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and allow camera permissions.

## 🎮 How to Use

### Gesture Controls

1. **Allow camera access** when prompted
2. **Show your hand** to the camera - wait for green "Hand detected" indicator
3. **Pinch lightly** (bring thumb and index finger close) to activate control
4. **Choose your gesture mode** by changing hand openness:
   - **Open hand (spread fingers)** while pinching → **Translate** (move cube in X/Y)
   - **Closed fist** while pinching → **Rotate** (roll your wrist, cube rotates 1:1)
   - **Semi-open hand** while pinching → **Scale** (open wider = larger, close = smaller)

> **💡 Pro Tip**: The cube responds **instantly** to your hand movements. For ultra-precise control, brace your elbow and keep your hand near the center of the frame.

**See [PRECISION_TRACKING.md](./PRECISION_TRACKING.md) for detailed gesture documentation and precision tuning.**
6. **Open/close hand** while pinching (medium openness) to scale

### Keyboard Controls

| Action | Keys | Description |
|--------|------|-------------|
| **Move X/Y** | `←` `→` `↑` `↓` | Horizontal and vertical movement |
| **Move Z** | `W` / `S` | Forward and backward |
| **Alternative Move** | `A` / `D` | Left and right |
| **Scale** | `+` / `-` | Increase/decrease size |
| **Rotate Y-axis** | `Q` / `E` | Rotate left/right |
| **Rotate X-axis** | `Shift + Q/E` | Rotate up/down |
| **Select Object** | `Tab` | Cycle through objects |
| **Previous Object** | `Shift + Tab` | Cycle backward |

Press the **⌨️ Keyboard Controls** button for an in-app reference.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── layout/                      # Layout components
│   ├── keyboard-shortcuts.tsx       # Keyboard help dialog
│   └── error-boundary.tsx           # Error boundaries
├── features/
│   ├── scene/                       # 3D scene feature
│   │   └── components/
│   │       ├── scene-canvas.tsx     # Three.js renderer
│   │       ├── scene-controls.tsx   # Control buttons
│   │       ├── object-palette.tsx   # Shape spawner
│   │       └── gesture-hud.tsx      # Gesture status HUD
│   └── vision/                      # Computer vision feature
│       ├── hand-tracker.ts          # MediaPipe wrapper
│       ├── gesture-mapper.ts        # Landmark → gesture logic
│       └── components/
│           └── vision-panel.tsx     # Camera feed + overlay
├── stores/
│   ├── scene-store.ts               # Scene state (TanStack Store)
│   └── gesture-store.ts             # Gesture state
├── hooks/
│   ├── use-scene-store.ts           # Scene state hook
│   ├── use-gesture-store.ts         # Gesture state hook
│   └── use-keyboard-controls.ts     # Keyboard navigation
├── lib/
│   ├── performance.ts               # Performance utilities
│   └── utils.ts                     # Helper functions
└── routes/
    └── index.tsx                    # Main route
```

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 + TypeScript | UI components |
| **Routing** | TanStack Router | Client-side routing |
| **State** | TanStack Store | Reactive state management |
| **3D Graphics** | Three.js | WebGL rendering |
| **Computer Vision** | MediaPipe Hands | Hand landmark detection |
| **Styling** | Tailwind CSS + shadcn/ui | Component styling |
| **Build** | Vite | Fast dev server & bundler |
| **Testing** | Vitest + Testing Library | Unit tests |
| **Linting** | Biome | Code quality |

## 🧪 Development

### Available Commands

```bash
npm run dev              # Start dev server (hot reload)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint and fix with Biome
npm run format           # Format code with Biome
npm run typecheck        # Type-check without emitting
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

### Running Tests

**Test Coverage**: 31 tests covering gesture mapping and scene state logic.

```bash
npm run test:run         # Quick test run
npm run test:coverage    # With coverage report
```

## 🏗️ Architecture

### State Management
- **Scene Store**: 3D object positions, rotations, scales
- **Gesture Store**: Hand tracking data, gesture recognition

### Data Flow
```
Camera → MediaPipe → Gesture Mapper → Scene Store → Three.js
```

## 🐛 Troubleshooting

### Camera Not Working
1. Check browser permissions (lock icon in address bar)
2. Ensure camera not in use by another app
3. Try Chrome/Edge (recommended browsers)

### Hand Not Detected
1. Ensure good lighting (avoid backlighting)
2. Position hand 1-2 feet from camera
3. Show full hand with fingers spread initially

### Low Performance
1. Close other browser tabs
2. Check console for FPS warnings
3. Reduce number of objects in scene

## 📊 Performance Metrics

**Targets**:
- Hand tracking: 30 FPS
- Rendering: 60 FPS  
- Gesture latency: < 100ms

## 🔒 Privacy

- All processing happens locally in browser
- No data collection or external servers
- Camera access required for hand tracking only

## 📚 Documentation

See `.github/project/` for:
- **improvements.md** - Enhancement catalog
- **implementation-plan.md** - Development guide
- **blueprint.md** - System architecture

## 📄 License

MIT
