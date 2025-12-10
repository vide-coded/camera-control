import { Store } from "@tanstack/store";

import type { GestureFrame } from "@/features/vision/gesture-mapper";

type GestureVector2 = { x: number; y: number };

export type GestureState = {
	translation: GestureVector2;
	scale: number;
	roll: number;
	pinchStrength: number;
	openness: number;
	handPresent: boolean;
	fps: number;
	lastUpdated: number | null;
	confidence: number;
};

const initialState: GestureState = {
	translation: { x: 0, y: 0 },
	scale: 1,
	roll: 0,
	pinchStrength: 0,
	openness: 0,
	handPresent: false,
	fps: 0,
	lastUpdated: null,
	confidence: 0,
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);
const lerp = (current: number, target: number, factor: number) =>
	current + (target - current) * factor;

const lerpVec2 = (
	current: GestureVector2,
	target: GestureVector2,
	factor: number,
): GestureVector2 => ({
	x: lerp(current.x, target.x, factor),
	y: lerp(current.y, target.y, factor),
});

export const gestureStore = new Store<GestureState>(initialState);

export const gestureActions = {
	ingestFrame: (frame: GestureFrame, fps: number) =>
		gestureStore.setState((state: GestureState) => {
			// Extreme precision mode: minimal smoothing, maximum responsiveness
			const confidenceFactor = frame.confidence > 0.85 ? 1.0 : 0.85;
			const isPinching = frame.pinchStrength > 0.2;

			// Ultra-responsive: high smoothing values = more of new frame, less of old
			const translationSmooth = isPinching ? 0.92 : 0.88; // Nearly instant
			const rotationSmooth = isPinching ? 0.95 : 0.9; // Hair-trigger rotation
			const pinchSmooth = 0.9; // Instant pinch response
			const opennessSmooth = 0.88; // Quick hand open/close detection
			const scaleSmooth = 0.85; // Rapid scale changes

			const smoothedTranslation = lerpVec2(
				state.translation,
				frame.translation,
				translationSmooth * confidenceFactor,
			);
			const smoothedRoll = lerp(
				state.roll,
				frame.roll,
				rotationSmooth * confidenceFactor,
			);
			const smoothedPinch = lerp(
				state.pinchStrength,
				frame.pinchStrength,
				pinchSmooth,
			);
			const smoothedOpenness = lerp(
				state.openness,
				frame.openness,
				opennessSmooth,
			);

			// Direct 1:1 scale mapping from hand openness (0=closed=small, 1=open=large)
			const targetScale = clamp(0.3 + smoothedOpenness * 2.2, 0.3, 2.5);
			const smoothedScale = lerp(state.scale, targetScale, scaleSmooth);

			return {
				translation: smoothedTranslation,
				roll: smoothedRoll,
				pinchStrength: smoothedPinch,
				openness: smoothedOpenness,
				scale: smoothedScale,
				handPresent: true,
				confidence: frame.confidence,
				fps,
				lastUpdated: frame.timestamp,
			};
		}),
	markNoHand: () =>
		gestureStore.setState((state: GestureState) => ({
			translation: lerpVec2(state.translation, { x: 0, y: 0 }, 0.1),
			roll: lerp(state.roll, 0, 0.1),
			pinchStrength: lerp(state.pinchStrength, 0, 0.15),
			openness: lerp(state.openness, 0, 0.15),
			scale: lerp(state.scale, 1, 0.1),
			handPresent: false,
			confidence: 0,
			fps: 0,
			lastUpdated: state.lastUpdated,
		})),
	reset: () => gestureStore.setState(() => initialState),
};

export type GestureStore = typeof gestureStore;
