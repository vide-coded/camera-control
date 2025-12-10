import type { GestureState } from "@/stores/gesture-store";
import { sceneActions, sceneStore } from "@/stores/scene-store";
import { beforeEach, describe, expect, it } from "vitest";

describe("scene-store", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		sceneActions.reset();
	});

	describe("initial state", () => {
		it("has one default cube object", () => {
			const state = sceneStore.state;
			expect(state.objects).toHaveLength(1);
			expect(state.objects[0].type).toBe("cube");
		});

		it("has default cube selected", () => {
			const state = sceneStore.state;
			expect(state.selectedId).toBe(state.objects[0].id);
		});

		it("starts with animation enabled", () => {
			const state = sceneStore.state;
			expect(state.isAnimating).toBe(true);
		});

		it("starts in idle gesture mode", () => {
			const state = sceneStore.state;
			expect(state.gestureMode).toBe("idle");
		});
	});

	describe("addObject", () => {
		it("adds a new object to the scene", () => {
			sceneActions.addObject("sphere");
			const state = sceneStore.state;
			expect(state.objects).toHaveLength(2);
			expect(state.objects[1].type).toBe("sphere");
		});

		it("selects the newly added object", () => {
			sceneActions.addObject("cone");
			const state = sceneStore.state;
			expect(state.selectedId).toBe(state.objects[1].id);
		});

		it("assigns unique IDs to objects", () => {
			sceneActions.addObject("sphere");
			sceneActions.addObject("cone");
			const state = sceneStore.state;
			const ids = state.objects.map((obj) => obj.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it("assigns different colors based on object type", () => {
			sceneActions.addObject("sphere");
			sceneActions.addObject("cone");
			const state = sceneStore.state;

			const cube = state.objects.find((obj) => obj.type === "cube");
			const sphere = state.objects.find((obj) => obj.type === "sphere");
			const cone = state.objects.find((obj) => obj.type === "cone");

			expect(cube?.color).toBe("#2563eb");
			expect(sphere?.color).toBe("#14b8a6");
			expect(cone?.color).toBe("#f59e0b");
		});
	});

	describe("selectObject", () => {
		it("changes the selected object", () => {
			sceneActions.addObject("sphere");
			const state = sceneStore.state;
			const sphereId = state.objects[1].id;

			sceneActions.selectObject(sphereId);
			expect(sceneStore.state.selectedId).toBe(sphereId);
		});
	});

	describe("setPosition", () => {
		it("updates the position of the selected object", () => {
			const newPosition = { x: 1, y: 2, z: 0.5 };
			sceneActions.setPosition(newPosition);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.position).toEqual(newPosition);
		});

		it("does not affect other objects", () => {
			sceneActions.addObject("sphere");
			const initialPos = { ...sceneStore.state.objects[0].position };

			sceneActions.setPosition({ x: 1, y: 1, z: 1 });

			const state = sceneStore.state;
			expect(state.objects[0].position).toEqual(initialPos);
		});
	});

	describe("setRotation", () => {
		it("updates the rotation of the selected object", () => {
			const newRotation = { x: 0.5, y: 1.0, z: -0.5 };
			sceneActions.setRotation(newRotation);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.rotation).toEqual(newRotation);
		});
	});

	describe("setScale", () => {
		it("updates the scale of the selected object", () => {
			sceneActions.setScale(1.5);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.scale).toBe(1.5);
		});
	});

	describe("toggleAnimation", () => {
		it("toggles animation state", () => {
			const initialState = sceneStore.state.isAnimating;
			sceneActions.toggleAnimation();
			expect(sceneStore.state.isAnimating).toBe(!initialState);
			sceneActions.toggleAnimation();
			expect(sceneStore.state.isAnimating).toBe(initialState);
		});

		it("sets animation to specific value", () => {
			sceneActions.toggleAnimation(false);
			expect(sceneStore.state.isAnimating).toBe(false);
			sceneActions.toggleAnimation(true);
			expect(sceneStore.state.isAnimating).toBe(true);
		});
	});

	describe("applyGesture", () => {
		const createMockGesture = (
			overrides: Partial<GestureState> = {},
		): GestureState => ({
			handPresent: false,
			pinchStrength: 0,
			openness: 0.5,
			translation: { x: 0, y: 0 },
			roll: 0,
			scale: 1,
			confidence: 0.95, // High confidence by default
			lastUpdated: Date.now(),
			fps: 30,
			...overrides,
		});

		it("changes gesture mode to tracking when hand is present", () => {
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8, // Above 0.7 threshold
			});
			sceneActions.applyGesture(gesture);
			expect(sceneStore.state.gestureMode).toBe("tracking");
		});

		it("changes gesture mode to manipulating when pinching", () => {
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.3, // Above 0.25 threshold for strong pinch
				openness: 0.5,
			});
			sceneActions.applyGesture(gesture);
			expect(sceneStore.state.gestureMode).toBe("manipulating");
		});

		it("applies translation when pinching with high openness", () => {
			const initialPosition = { ...sceneStore.state.objects[0].position };
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.3, // Strong pinch (>= 0.25)
				openness: 0.7, // High openness (> 0.6)
				translation: { x: 0.5, y: 0.5 },
			});

			sceneActions.applyGesture(gesture);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.position.x).not.toBe(initialPosition.x);
			expect(selected?.position.y).not.toBe(initialPosition.y);
		});

		it("applies rotation when pinching with low openness", () => {
			const initialRotation = { ...sceneStore.state.objects[0].rotation };
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.3, // Strong pinch (>= 0.25)
				openness: 0.2, // Low openness (< 0.35)
				roll: 0.5,
			});

			sceneActions.applyGesture(gesture);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.rotation.x).not.toBe(initialRotation.x);
			expect(selected?.rotation.y).not.toBe(initialRotation.y);
		});

		it("applies scale when pinching with medium openness", () => {
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.2, // Pinching (>= 0.15)
				openness: 0.5, // Medium openness (0.35-0.75)
				scale: 1.3,
			});

			sceneActions.applyGesture(gesture);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.scale).toBeCloseTo(1.3, 1);
		});

		it("disables animation when pinching", () => {
			sceneActions.toggleAnimation(true);
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.2, // Above 0.15 threshold
			});

			sceneActions.applyGesture(gesture);
			expect(sceneStore.state.isAnimating).toBe(false);
		});

		it("clamps position values to boundaries", () => {
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.3, // Strong pinch
				openness: 0.7, // High openness for translation
				translation: { x: 100, y: 100 }, // Extreme values
			});

			sceneActions.applyGesture(gesture);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.position.x).toBeLessThanOrEqual(4); // New boundary
			expect(selected?.position.x).toBeGreaterThanOrEqual(-4); // New boundary
			expect(selected?.position.y).toBeLessThanOrEqual(4); // New boundary
			expect(selected?.position.y).toBeGreaterThanOrEqual(-2); // New boundary
		});

		it("clamps scale values to boundaries", () => {
			const gesture = createMockGesture({
				handPresent: true,
				confidence: 0.8,
				pinchStrength: 0.2, // Pinching
				openness: 0.5, // Medium openness for scale
				scale: 10, // Extreme value
			});

			sceneActions.applyGesture(gesture);

			const state = sceneStore.state;
			const selected = state.objects.find((obj) => obj.id === state.selectedId);
			expect(selected?.scale).toBeLessThanOrEqual(2.5); // New boundary
			expect(selected?.scale).toBeGreaterThanOrEqual(0.3); // New boundary
		});
	});

	describe("reset", () => {
		it("resets to initial state", () => {
			// Make some changes
			sceneActions.addObject("sphere");
			sceneActions.addObject("cone");
			sceneActions.setPosition({ x: 2, y: 2, z: 1 });
			sceneActions.toggleAnimation(false);

			// Reset
			sceneActions.reset();

			const state = sceneStore.state;
			expect(state.objects).toHaveLength(1);
			expect(state.objects[0].type).toBe("cube");
			expect(state.isAnimating).toBe(true);
			expect(state.gestureMode).toBe("idle");
		});
	});
});
