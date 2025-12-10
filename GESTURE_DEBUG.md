# 🔍 GESTURE CONTROL DEBUGGING GUIDE

## Issue: Hand gestures detected but cube not moving

**Status**: Debug logging added ✅  
**Next Step**: Run `npm run dev` and check console logs

---

## What Was Added

### 1. Route-Level Gesture Detection Logging
**Location**: `src/routes/index.tsx`

When you pinch (pinchStrength > 0.15), you'll see:
```javascript
🎯 Gesture detected: {
  pinchStrength: "0.450",
  openness: "0.650", 
  translation: { x: "0.123", y: "-0.045" },
  roll: "0.234",
  scale: "1.234",
  confidence: "0.920"
}
```

**What this tells us**: 
- If you see this log → Gesture system is working ✅
- If you DON'T see this → Problem is in gesture detection or confidence threshold

### 2. Gesture Mode Detection Logging
**Location**: `src/stores/scene-store.ts` (applyGesture function)

When pinching, you'll see:
```javascript
✋ Gesture Mode: {
  hasHand: true,
  isPinching: true,
  isStrongPinch: true,
  isRotateGesture: false,
  isScaleGesture: true,
  isTranslateGesture: false,
  pinchStrength: "0.450",
  openness: "0.650",
  confidence: "0.920"
}
```

**What this tells us**:
- Shows which gesture mode is active (translate/rotate/scale)
- Verifies threshold logic is working
- Shows confidence level

### 3. Object Update Logging
**Location**: `src/stores/scene-store.ts` (after applying changes)

When cube should move, you'll see:
```javascript
🎨 Applying changes: {
  gesture: "SCALE",
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0.2, y: 0.6, z: 0 },
  scale: 1.456
}
```

**What this tells us**:
- If values are changing → Store is updating ✅
- If values are NOT changing → Problem is in calculation logic
- If you don't see this → Gesture not reaching update code

---

## How to Test

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Open Browser Console
- Chrome/Edge: F12 or Ctrl+Shift+I
- Firefox: F12 or Ctrl+Shift+K
- Safari: Cmd+Option+I

### Step 3: Enable Camera
Click "Enable camera" button

### Step 4: Test Gestures

#### Test 1: SCALE (Pinch + Medium Open Hand)
**Action**: Pinch fingers (not too strong), hand medium open (50-70% open)

**Expected Console Output**:
```
🎯 Gesture detected: { pinchStrength: "0.350", openness: "0.550", ... }
✋ Gesture Mode: { isPinching: true, isScaleGesture: true, ... }
🎨 Applying changes: { gesture: "SCALE", scale: 1.234 }
```

**Expected Visual**: Cube should grow/shrink based on hand openness

#### Test 2: TRANSLATE (Strong Pinch + Wide Open Hand)
**Action**: Pinch fingers strongly (>0.25), hand wide open (>60% open), move hand

**Expected Console Output**:
```
🎯 Gesture detected: { pinchStrength: "0.450", openness: "0.750", translation: { x: "0.123", y: "0.234" } }
✋ Gesture Mode: { isStrongPinch: true, isTranslateGesture: true, ... }
🎨 Applying changes: { gesture: "TRANSLATE", position: { x: 0.123, y: 0.234, z: 0 } }
```

**Expected Visual**: Cube should move with your hand

#### Test 3: ROTATE (Strong Pinch + Closed Hand)
**Action**: Pinch fingers strongly (>0.25), hand mostly closed (<35% open), roll wrist

**Expected Console Output**:
```
🎯 Gesture detected: { pinchStrength: "0.450", openness: "0.250", roll: "0.456" }
✋ Gesture Mode: { isStrongPinch: true, isRotateGesture: true, ... }
🎨 Applying changes: { gesture: "ROTATE", rotation: { x: 0.456, y: 0.612, z: 0.273 } }
```

**Expected Visual**: Cube should rotate following your wrist rotation

---

## Diagnostic Decision Tree

### Scenario 1: No "🎯 Gesture detected" logs
**Problem**: Gesture subscription not firing

**Possible Causes**:
1. Gesture store not updating
2. Confidence too low (< 0.7)
3. Pinch strength too low (< 0.15)

**Fix**:
- Check camera is actually enabled
- Check hand is clearly visible (good lighting)
- Try pinching harder
- Check console for any errors

### Scenario 2: See "🎯" but no "✋ Gesture Mode" logs
**Problem**: applyGesture not being called OR not pinching

**Possible Causes**:
1. Scene store subscription broken
2. Pinch strength not reaching 0.15
3. Confidence not reaching 0.7

**Fix**:
- Check if pinchStrength in "🎯" log is >= 0.15
- Check if confidence is >= 0.7
- Try pinching harder with better hand visibility

### Scenario 3: See "✋" but all gestures are false
**Problem**: Pinch thresholds or openness thresholds not met

**Current Thresholds**:
- `isPinching`: pinchStrength >= 0.15 + confidence > 0.7
- `isStrongPinch`: pinchStrength >= 0.25 + confidence > 0.7
- `isRotateGesture`: isStrongPinch + openness < 0.35
- `isScaleGesture`: isPinching + openness 0.35-0.75
- `isTranslateGesture`: isStrongPinch + openness > 0.6

**Fix**:
- Adjust hand openness to match desired gesture range
- Pinch stronger for translate/rotate (need >0.25)
- Keep hand at right openness level

### Scenario 4: See "🎨 Applying changes" but cube not moving
**Problem**: Scene renderer not reacting to state changes

**Possible Causes**:
1. Canvas not re-rendering
2. Object updates not triggering Three.js updates
3. Animation override (keyboard controls?)

**Fix**:
- Check if values in "🎨" log are actually changing
- Try toggling animation (keyboard: A key)
- Check Three.js canvas is rendering

### Scenario 5: Values changing but very slowly or not visibly
**Problem**: Movement factors too small or clamping too restrictive

**Current Factors**:
- Translation: 0.5x (range: -4 to 4 on X, -2 to 4 on Y)
- Rotation: 1.0x (range: multiple PI radians)
- Scale: direct mapping from gesture.scale (range: 0.3 to 2.5)

**Fix**:
- Increase translation by making bigger hand movements
- For rotation, roll wrist more dramatically
- For scale, open/close hand more fully

---

## Quick Confidence Threshold Adjustment

If gestures are detected but confidence is borderline (0.65-0.75), you can temporarily lower the threshold:

**File**: `src/stores/scene-store.ts` line ~142

**Change**:
```typescript
// From:
const hasHand = gesture.handPresent && gesture.confidence > 0.7;

// To (more lenient):
const hasHand = gesture.handPresent && gesture.confidence > 0.6;
```

## Quick Pinch Threshold Adjustment

If pinch detection is not triggering, lower the thresholds:

**File**: `src/stores/scene-store.ts` lines ~145-146

**Change**:
```typescript
// From:
const isPinching = hasHand && gesture.pinchStrength >= 0.15;
const isStrongPinch = hasHand && gesture.pinchStrength >= 0.25;

// To (more sensitive):
const isPinching = hasHand && gesture.pinchStrength >= 0.10;
const isStrongPinch = hasHand && gesture.pinchStrength >= 0.20;
```

---

## Expected Normal Flow

When everything works correctly, you should see this sequence:

```
1. User pinches with medium-open hand (50% open)
   ↓
2. 🎯 Gesture detected: { pinchStrength: "0.350", openness: "0.550", ... }
   ↓
3. ✋ Gesture Mode: { isPinching: true, isScaleGesture: true, ... }
   ↓
4. 🎨 Applying changes: { gesture: "SCALE", scale: 1.456 }
   ↓
5. Cube visually grows on screen
```

---

## Report Back

After running `npm run dev` and testing, report:

1. **Which logs appear?** (🎯, ✋, 🎨, or none?)
2. **What are the values?** (copy/paste a few console logs)
3. **What gesture are you trying?** (pinch + open/closed hand)
4. **What happens visually?** (cube moves? doesn't move? moves wrong?)

This will help pinpoint exactly where the issue is!

---

## Common Issues and Fixes

### Issue: "Maximum update depth exceeded" error
**Cause**: Infinite render loop in subscription  
**Fix**: Already handled (subscription doesn't trigger re-renders)

### Issue: Keyboard controls work but gestures don't
**Cause**: Different update paths - keyboard triggers state directly, gestures through subscription  
**Fix**: Verify subscription is active (check for "🎯" logs)

### Issue: Cube moves but very jerkily
**Cause**: Smoothing factors or confidence fluctuating  
**Fix**: Check confidence stays above 0.7, adjust smoothing in gesture-store.ts

### Issue: Wrong gesture mode activates
**Cause**: Hand openness or pinch strength in wrong range  
**Fix**: Check "✋" logs to see actual values, adjust hand position

---

## Next Steps After Debugging

Once we identify the issue from the console logs, we can:

1. **Adjust thresholds** (confidence, pinch, openness)
2. **Adjust movement factors** (translation, rotation scale multipliers)
3. **Fix subscription** (if not firing)
4. **Fix rendering** (if state updates but no visual change)

**The debug logs will tell us exactly what needs fixing!** 🎯
