import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { describe, expect, it } from "vitest";
import { mapLandmarksToGesture } from "../gesture-mapper";

describe("gesture-mapper", () => {
	const createMockLandmark = (
		x: number,
		y: number,
		z = 0,
	): NormalizedLandmark => ({
		x,
		y,
		z,
		visibility: 1,
	});

	const createMockHandLandmarks = (
		overrides: Partial<Record<number, NormalizedLandmark>> = {},
	): NormalizedLandmark[] => {
		// Default hand pose: neutral position
		const defaults: NormalizedLandmark[] = [
			createMockLandmark(0.5, 0.5), // 0: wrist
			createMockLandmark(0.48, 0.45), // 1-4: thumb
			createMockLandmark(0.47, 0.42),
			createMockLandmark(0.46, 0.39),
			createMockLandmark(0.45, 0.36),
			createMockLandmark(0.52, 0.45), // 5: index MCP
			createMockLandmark(0.52, 0.4), // 6-8: index finger
			createMockLandmark(0.52, 0.35),
			createMockLandmark(0.52, 0.3), // 8: index tip
			createMockLandmark(0.54, 0.45), // 9-12: middle finger
			createMockLandmark(0.54, 0.38),
			createMockLandmark(0.54, 0.33),
			createMockLandmark(0.54, 0.28), // 12: middle tip
			createMockLandmark(0.56, 0.46), // 13-16: ring finger
			createMockLandmark(0.56, 0.4),
			createMockLandmark(0.56, 0.35),
			createMockLandmark(0.56, 0.3), // 16: ring tip
			createMockLandmark(0.58, 0.48), // 17: pinky MCP
			createMockLandmark(0.58, 0.43), // 18-20: pinky finger
			createMockLandmark(0.58, 0.38),
			createMockLandmark(0.58, 0.33), // 20: pinky tip
		];

		// Apply overrides
		for (const [index, landmark] of Object.entries(overrides)) {
			if (landmark) {
				defaults[Number(index)] = landmark;
			}
		}

		return defaults;
	};

	describe("mapLandmarksToGesture", () => {
		it("returns null for invalid input", () => {
			expect(mapLandmarksToGesture([], 0)).toBe(null);
			expect(
				mapLandmarksToGesture(createMockHandLandmarks().slice(0, 10), 0),
			).toBe(null);
		});

		it("returns a gesture frame for valid landmarks", () => {
			const landmarks = createMockHandLandmarks();
			const result = mapLandmarksToGesture(landmarks, 1000);

			expect(result).toBeDefined();
			expect(result).toHaveProperty("translation");
			expect(result).toHaveProperty("pinchStrength");
			expect(result).toHaveProperty("openness");
			expect(result).toHaveProperty("roll");
			expect(result?.timestamp).toBe(1000);
		});

		it("calculates translation based on wrist position", () => {
			// Wrist at center (0.5, 0.5) should give (0, 0) translation
			const centerLandmarks = createMockHandLandmarks({
				0: createMockLandmark(0.5, 0.5),
			});
			const centerResult = mapLandmarksToGesture(centerLandmarks, 0);
			expect(centerResult?.translation.x).toBeCloseTo(0, 1);
			expect(centerResult?.translation.y).toBeCloseTo(0, 1);

			// Wrist at left (0.25, 0.5) should give positive X translation
			const leftLandmarks = createMockHandLandmarks({
				0: createMockLandmark(0.25, 0.5),
			});
			const leftResult = mapLandmarksToGesture(leftLandmarks, 0);
			expect(leftResult?.translation.x).toBeGreaterThan(0);

			// Wrist at top (0.5, 0.25) should give positive Y translation
			const topLandmarks = createMockHandLandmarks({
				0: createMockLandmark(0.5, 0.25),
			});
			const topResult = mapLandmarksToGesture(topLandmarks, 0);
			expect(topResult?.translation.y).toBeGreaterThan(0);
		});

		it("detects pinch gesture", () => {
			// Open hand: thumb and index far apart (normalized by palm width)
			const openLandmarks = createMockHandLandmarks({
				4: createMockLandmark(0.45, 0.36), // thumb tip
				8: createMockLandmark(0.52, 0.3), // index tip
			});
			const openResult = mapLandmarksToGesture(openLandmarks, 0);
			// With new thresholds: PINCH_THRESHOLD_MIN=0.03, MAX=0.15
			// This distance should register as weak/no pinch
			expect(openResult?.pinchStrength).toBeLessThan(0.3);

			// Pinched hand: thumb and index VERY close together (nearly touching)
			const pinchedLandmarks = createMockHandLandmarks({
				4: createMockLandmark(0.52, 0.301), // thumb tip nearly touching index
				8: createMockLandmark(0.52, 0.3), // index tip
			});
			const pinchedResult = mapLandmarksToGesture(pinchedLandmarks, 0);
			// Close pinch should register high strength with new sensitive thresholds
			expect(pinchedResult?.pinchStrength).toBeGreaterThan(0.7);
		});

		it("calculates hand openness", () => {
			// Closed fist: all fingers near palm
			const closedLandmarks = createMockHandLandmarks({
				8: createMockLandmark(0.51, 0.48), // index tip close
				12: createMockLandmark(0.52, 0.48), // middle tip close
				16: createMockLandmark(0.53, 0.48), // ring tip close
				20: createMockLandmark(0.54, 0.48), // pinky tip close
			});
			const closedResult = mapLandmarksToGesture(closedLandmarks, 0);
			expect(closedResult?.openness).toBeLessThan(0.3);

			// Open hand: fingers spread out
			const openLandmarks = createMockHandLandmarks({
				8: createMockLandmark(0.52, 0.25), // index tip far
				12: createMockLandmark(0.54, 0.23), // middle tip far
				16: createMockLandmark(0.56, 0.25), // ring tip far
				20: createMockLandmark(0.58, 0.28), // pinky tip far
			});
			const openResult = mapLandmarksToGesture(openLandmarks, 0);
			expect(openResult?.openness).toBeGreaterThan(0.5);
		});

		it("clamps values to valid ranges", () => {
			const landmarks = createMockHandLandmarks({
				0: createMockLandmark(-1, 2), // Extreme wrist position
			});
			const result = mapLandmarksToGesture(landmarks, 0);

			// Translation should be clamped to [-1, 1]
			expect(result?.translation.x).toBeGreaterThanOrEqual(-1);
			expect(result?.translation.x).toBeLessThanOrEqual(1);
			expect(result?.translation.y).toBeGreaterThanOrEqual(-1);
			expect(result?.translation.y).toBeLessThanOrEqual(1);

			// Pinch strength should be clamped to [0, 1]
			expect(result?.pinchStrength).toBeGreaterThanOrEqual(0);
			expect(result?.pinchStrength).toBeLessThanOrEqual(1);

			// Openness should be clamped to [0, 1]
			expect(result?.openness).toBeGreaterThanOrEqual(0);
			expect(result?.openness).toBeLessThanOrEqual(1);
		});

		it("calculates roll angle from hand orientation", () => {
			// Horizontal hand (normal orientation)
			const horizontalLandmarks = createMockHandLandmarks({
				5: createMockLandmark(0.52, 0.45), // index MCP
				17: createMockLandmark(0.58, 0.48), // pinky MCP
			});
			const horizontalResult = mapLandmarksToGesture(horizontalLandmarks, 0);
			expect(horizontalResult?.roll).toBeDefined();

			// Tilted hand
			const tiltedLandmarks = createMockHandLandmarks({
				5: createMockLandmark(0.52, 0.4), // index MCP higher
				17: createMockLandmark(0.58, 0.5), // pinky MCP lower
			});
			const tiltedResult = mapLandmarksToGesture(tiltedLandmarks, 0);
			expect(tiltedResult?.roll).toBeDefined();
			expect(tiltedResult?.roll).not.toBe(horizontalResult?.roll);
		});
	});
});
