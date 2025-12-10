import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type GestureFrame = {
	translation: { x: number; y: number };
	pinchStrength: number;
	openness: number;
	roll: number;
	timestamp: number;
	confidence: number;
};

// Ultra-minimal dead zone for maximum precision
const DEAD_ZONE = 0.008; // Extremely sensitive
const PINCH_THRESHOLD_MIN = 0.03; // Hair-trigger response
const PINCH_THRESHOLD_MAX = 0.15; // Instant activation

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const applyDeadZone = (value: number, threshold: number): number => {
	if (Math.abs(value) < threshold) return 0;
	return value;
};

const distance2d = (a: NormalizedLandmark, b: NormalizedLandmark) => {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.hypot(dx, dy);
};

/**
 * Transforms MediaPipe hand landmarks into gesture control signals.
 *
 * Calculates:
 * - Translation: Based on wrist position (normalized to [-1, 1])
 * - Pinch strength: Distance between thumb and index finger
 * - Hand openness: Average distance of fingertips from palm center
 * - Roll angle: Hand orientation based on index-pinky MCP line
 *
 * @param landmarks - Array of 21 hand landmarks from MediaPipe
 * @param timestamp - Frame timestamp for synchronization
 * @returns Gesture frame with control signals, or null if invalid input
 */
export function mapLandmarksToGesture(
	landmarks: NormalizedLandmark[],
	timestamp: number,
): GestureFrame | null {
	if (!landmarks || landmarks.length < 21) return null;

	const wrist = landmarks[0];
	const thumbTip = landmarks[4];
	const indexTip = landmarks[8];
	const indexMcp = landmarks[5];
	const pinkyMcp = landmarks[17];
	const palmCenter: NormalizedLandmark = {
		x: (wrist.x + indexMcp.x + pinkyMcp.x) / 3,
		y: (wrist.y + indexMcp.y + pinkyMcp.y) / 3,
		z: wrist.z ?? 0,
		visibility: wrist.visibility,
	};

	const palmWidth = Math.max(0.001, distance2d(indexMcp, pinkyMcp));
	const pinchDistance = distance2d(indexTip, thumbTip);

	// Calibrated pinch with stricter thresholds
	const normalizedPinch = pinchDistance / palmWidth;
	const pinchStrength =
		normalizedPinch < PINCH_THRESHOLD_MIN
			? 1
			: normalizedPinch > PINCH_THRESHOLD_MAX
				? 0
				: 1 -
					(normalizedPinch - PINCH_THRESHOLD_MIN) /
						(PINCH_THRESHOLD_MAX - PINCH_THRESHOLD_MIN);

	// Calculate confidence based on landmark visibility and hand stability
	// MediaPipe hand landmarks often don't have visibility scores, default to high confidence
	const visibilities = [
		wrist.visibility,
		thumbTip.visibility,
		indexTip.visibility,
		indexMcp.visibility,
		pinkyMcp.visibility,
	].filter(
		(v): v is number => typeof v === "number" && !Number.isNaN(v) && v > 0,
	);

	// Default to high confidence (0.85) when no visibility scores available
	const baseConfidence =
		visibilities.length > 0 ? Math.min(...visibilities) : 0.85;
	// Minimal edge penalty - only penalize when very close to edges
	const edgePenalty = Math.max(
		0,
		Math.min(
			Math.abs(wrist.x - 0.5) * 2 - 0.7, // Only penalize beyond 0.7 (70% from center)
			Math.abs(wrist.y - 0.5) * 2 - 0.7,
		),
	);
	const confidence = Math.max(0.5, baseConfidence * (1 - edgePenalty * 0.3));

	const fingerTips = [8, 12, 16, 20];
	const opennessDistances = fingerTips.map((id) =>
		distance2d(landmarks[id], palmCenter),
	);
	const opennessRaw =
		opennessDistances.reduce((sum, distance) => sum + distance, 0) /
		(opennessDistances.length * palmWidth);
	const openness = clamp(opennessRaw / 1.3, 0, 1);

	// Translation with dead zone for precision
	const rawTranslationX = (0.5 - wrist.x) * 2;
	const rawTranslationY = (0.5 - wrist.y) * 2;

	const translation = {
		x: clamp(applyDeadZone(rawTranslationX, DEAD_ZONE), -1, 1),
		y: clamp(applyDeadZone(rawTranslationY, DEAD_ZONE), -1, 1),
	};

	const roll = Math.atan2(pinkyMcp.y - indexMcp.y, pinkyMcp.x - indexMcp.x);

	return {
		translation,
		pinchStrength,
		openness,
		roll,
		timestamp,
		confidence,
	};
}
