# 🎮 Quick Reference: Ultra-Precision Gesture Controls

## 🖐️ Hand Setup
1. **Position**: Keep hand 1.5-3 feet from camera
2. **Centering**: Hand near center of frame (best tracking)
3. **Lighting**: Ensure even lighting on your hand
4. **Stability**: Brace elbow for ultra-fine control

---

## 🎯 Three Gesture Modes

### 1️⃣ **TRANSLATE** (Move Cube in Space)
**Activation**: Strong pinch (thumb + index finger nearly touching) + Open hand (fingers spread)

**What it does**: Cube follows your hand position instantly

**How to use**:
- Pinch firmly
- Keep all fingers spread wide
- Move hand left/right/up/down → cube moves **immediately** in X/Y

**Tips**:
- Very responsive (0.5x factor = large movements)
- Brace elbow for precise positioning
- Movement range: X [-4, 4], Y [-2, 4]

---

### 2️⃣ **ROTATE** (Spin Cube)
**Activation**: Strong pinch + Closed hand (make a fist)

**What it does**: Cube rotates in perfect sync with your hand roll (1:1 mapping)

**How to use**:
- Pinch firmly
- Close your hand into a fist
- Rotate your wrist → cube rotates **in perfect sync**

**Tips**:
- Roll your wrist left/right for rotation
- 1:1 fidelity: Your hand = the cube
- Multi-axis rotation for natural feel
- Perfect for precise orientation control

---

### 3️⃣ **SCALE** (Resize Cube)
**Activation**: Light pinch + Semi-open hand (medium openness)

**What it does**: Cube size changes with hand openness

**How to use**:
- Pinch lightly (just bring fingers close)
- Keep hand semi-open (not fully open, not fully closed)
- Open hand wider → cube grows larger
- Close hand → cube shrinks smaller

**Tips**:
- Intuitive: open = big, closed = small
- Scale range: 0.3x to 2.5x (very dramatic)
- Rapid response for quick resizing

---

## 📊 Visual Guide

```
Hand State         Gesture Mode    Cube Action
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤏 + ✋           → TRANSLATE   → Moves in X/Y
(pinch + open)     

🤏 + ✊           → ROTATE      → Spins with hand
(pinch + fist)     

🤏 + 🖐          → SCALE       → Grows/shrinks
(pinch + semi)     
```

---

## ⚡ Key Thresholds

| Parameter | Threshold | What it means |
|-----------|-----------|---------------|
| **Pinch to activate** | ≥ 0.15 | Very light pinch works |
| **Strong pinch** | ≥ 0.25 | For translate/rotate |
| **Hand "open"** | > 0.6 | Triggers translate |
| **Hand "closed"** | < 0.35 | Triggers rotate |
| **Hand "medium"** | 0.35-0.75 | Triggers scale |
| **Confidence req** | > 0.7 | High-quality tracking only |

---

## 🎯 Precision Tips

### For Translation
- **Smooth movements**: Slide hand slowly for precise positioning
- **Quick jumps**: Flick hand for rapid repositioning
- **Lock axis**: Keep hand still on one axis to move on other

### For Rotation
- **Small rotations**: Tiny wrist movements = tiny rotations (1:1)
- **Full spins**: Roll wrist in circles for continuous rotation
- **Orientation lock**: Stop moving hand to lock orientation

### For Scaling
- **Fine sizing**: Small hand openness changes = small scale changes
- **Dramatic resizing**: Fully open/close hand for 8x size range
- **Size locking**: Hold hand still to lock size

---

## 🚨 Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| **No response** | Pinch too weak | Bring thumb and index finger closer together |
| **Jittery motion** | Low confidence | Move hand to center, improve lighting |
| **Wrong gesture** | Ambiguous hand state | Exaggerate open/closed hand pose |
| **Slow tracking** | Low FPS | Check CPU/GPU usage, close other apps |
| **Cube won't move** | Confidence < 0.7 | Improve lighting, center hand in frame |

---

## 📈 Performance Indicators

Watch the **Gesture HUD** (top-right) for live feedback:

- **Pinch**: 0.15+ to activate, 0.25+ for translate/rotate
- **Openness**: Shows hand state (0=closed, 1=open)
- **Confidence**: Should be > 0.7 for stable tracking
- **FPS**: Should be 50-60 for smooth experience

---

## 🎓 Pro Techniques

### **The "Hover"**
- Light pinch (0.15-0.24) + medium hand = scale only
- Perfect for adjusting size without moving/rotating

### **The "Lock"**
- Release pinch (< 0.15) while hand still visible
- Cube stops moving, you can reposition hand without effect

### **The "Combo"**
- Translate → release → rotate → release → scale
- Chain gestures for complex manipulations

### **The "Reset"**
- Close hand fully (openness near 0) → minimum size
- Open hand fully (openness near 1) → maximum size

---

## 🏆 Mastery Checklist

- [ ] Can translate cube smoothly across entire range
- [ ] Can rotate cube to exact orientation on first try
- [ ] Can scale cube to precise size without overshoot
- [ ] Can switch between gestures without "mode confusion"
- [ ] Can perform complex manipulations without looking at HUD
- [ ] Can maintain stable tracking for 30+ seconds
- [ ] Can position cube with millimeter precision
- [ ] Can chain multiple gestures smoothly

---

## 🎯 Remember

> **Your hand IS the cube.** With 1:1 rotation mapping, zero-latency updates, and 60 FPS tracking, there's no artificial delay between your intent and the cube's response. Move naturally, and the cube will follow perfectly.

---

**Quick Start**: Pinch lightly, open hand wide, move around → You're now controlling the cube!

**Version**: 2.0 (Ultra-Precision)  
**Last Updated**: December 6, 2025
