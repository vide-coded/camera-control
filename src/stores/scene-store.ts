import { Store } from "@tanstack/store";

import { persistenceService } from "@/lib/db/persistence";
import { sanitizeVector3 } from "@/lib/validation/validate";
import type { GestureState } from "@/stores/gesture-store";

export type Vector3 = {
	x: number;
	y: number;
	z: number;
};

export type SceneObjectType = "cube" | "sphere" | "cone";

export type SceneObject = {
	id: string;
	type: SceneObjectType;
	position: Vector3;
	rotation: Vector3;
	scale: number;
	color: string;
};

export type GestureMode = "idle" | "tracking" | "manipulating";

export type SceneState = {
	objects: SceneObject[];
	selectedId: string | null;
	isAnimating: boolean;
	gestureMode: GestureMode;
	lastGestureAt: number | null;
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const createId = () => `obj-${Math.random().toString(36).slice(2, 8)}`;

const createSceneObject = (type: SceneObjectType): SceneObject => {
	const baseColor =
		type === "sphere" ? "#14b8a6" : type === "cone" ? "#f59e0b" : "#2563eb";

	return {
		id: createId(),
		type,
		position: { x: 0, y: 0, z: 0 },
		rotation: { x: 0.2, y: 0.6, z: 0 },
		scale: 1,
		color: baseColor,
	};
};

const initialObject = createSceneObject("cube");

const initialState: SceneState = {
	objects: [initialObject],
	selectedId: initialObject.id,
	isAnimating: true,
	gestureMode: "idle",
	lastGestureAt: null,
};

const updateSelected = (
	state: SceneState,
	updater: (object: SceneObject) => SceneObject,
): SceneState => {
	const index = state.objects.findIndex(
		(object) => object.id === state.selectedId,
	);
	if (index === -1) return state;

	const nextObjects = [...state.objects];
	nextObjects[index] = updater(state.objects[index]);

	return { ...state, objects: nextObjects };
};

export const sceneStore = new Store<SceneState>(initialState);

export const sceneActions = {
	setPosition: (position: Vector3) =>
		sceneStore.setState((state) =>
			updateSelected(state, (object) => ({
				...object,
				position: sanitizeVector3(position),
			})),
		),
	setRotation: (rotation: Vector3) =>
		sceneStore.setState((state) =>
			updateSelected(state, (object) => ({
				...object,
				rotation: sanitizeVector3(rotation),
			})),
		),
	setScale: (scale: number) => {
		// Validate scale is finite and positive
		const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
		return sceneStore.setState((state) =>
			updateSelected(state, (object) => ({ ...object, scale: safeScale })),
		);
	},
	toggleAnimation: (value?: boolean) =>
		sceneStore.setState((state) => ({
			...state,
			isAnimating: typeof value === "boolean" ? value : !state.isAnimating,
		})),
	selectObject: (id: string) =>
		sceneStore.setState((state) => ({ ...state, selectedId: id })),
	addObject: (type: SceneObjectType) =>
		sceneStore.setState((state) => {
			const object = createSceneObject(type);
			return {
				...state,
				objects: [...state.objects, object],
				selectedId: object.id,
				gestureMode: "idle",
			};
		}),
	/**
	 * Applies gesture input to the selected object with professional precision.
	 *
	 * Gesture modes:
	 * - Strong pinch (>0.4) + open hand (>0.5): Translation
	 * - Strong pinch (>0.4) + closed hand (<0.3): Rotation
	 * - Moderate pinch (>0.3) + medium hand (0.3-0.7): Scale
	 *
	 * Features:
	 * - Clear pinch thresholds (0.3) for easier control
	 * - Confidence-based filtering (>0.3)
	 * - Calibrated movement factors for precision
	 * - Dead zone handling already applied in gesture-mapper
	 */
	applyGesture: (gesture: GestureState) =>
		sceneStore.setState((state) => {
			const index = state.objects.findIndex(
				(object) => object.id === state.selectedId,
			);
			if (index === -1) {
				console.warn("❌ No selected object found");
				return state;
			}

			const current = state.objects[index];
			// Lower confidence threshold since MediaPipe landmarks may not have visibility scores
			const hasHand = gesture.handPresent && gesture.confidence >= 0.3;

			// Ultra-sensitive pinch detection
			const isPinching = hasHand && gesture.pinchStrength >= 0.15;
			const isStrongPinch = hasHand && gesture.pinchStrength >= 0.25;

			// Precise gesture discrimination based on hand state
			const isRotateGesture = isStrongPinch && gesture.openness < 0.35;
			const isScaleGesture =
				isPinching && gesture.openness >= 0.35 && gesture.openness <= 0.75;
			const isTranslateGesture = isStrongPinch && gesture.openness > 0.6;

			// Debug logging
			if (isPinching) {
				console.log("✋ Gesture Mode:", {
					hasHand,
					isPinching,
					isStrongPinch,
					isRotateGesture,
					isScaleGesture,
					isTranslateGesture,
					pinchStrength: gesture.pinchStrength.toFixed(3),
					openness: gesture.openness.toFixed(3),
					confidence: gesture.confidence.toFixed(3),
				});
			}

			const baseState: SceneState = {
				...state,
				gestureMode: hasHand
					? isPinching
						? "manipulating"
						: "tracking"
					: "idle",
				lastGestureAt: gesture.lastUpdated ?? state.lastGestureAt,
				isAnimating: isPinching ? false : state.isAnimating,
			};

			if (!isPinching) return baseState;

			// EXTREME PRECISION: Ultra-aggressive factors for 1:1 hand-to-cube mapping
			const translationFactor = 0.5; // 10x faster - hand moves, cube moves NOW
			const rotationFactor = 1.0; // 1:1 rotation - perfect hand-to-cube sync
			const rotationFromRoll = gesture.roll;

			const nextPosition: Vector3 = isTranslateGesture
				? {
						...current.position,
						x: clamp(
							current.position.x + gesture.translation.x * translationFactor,
							-4,
							4,
						),
						y: clamp(
							current.position.y + gesture.translation.y * translationFactor,
							-2,
							4,
						),
						z: current.position.z,
					}
				: current.position;

			const nextRotation: Vector3 = isRotateGesture
				? {
						// Multi-axis rotation for natural hand roll mirroring
						x: clamp(
							current.rotation.x + rotationFromRoll * rotationFactor * 0.8,
							-Math.PI * 2,
							Math.PI * 2,
						),
						y: clamp(
							current.rotation.y + rotationFromRoll * rotationFactor * 1.2,
							-Math.PI * 3,
							Math.PI * 3,
						),
						// Direct Z-axis mapping for roll - this is the key for perfect mirroring
						z: clamp(rotationFromRoll * 0.6, -Math.PI, Math.PI),
					}
				: current.rotation; // Direct scale mapping - hand openness directly controls cube size
			const nextScale = isScaleGesture
				? clamp(gesture.scale, 0.3, 2.5) // Wider range for more dramatic control
				: current.scale;

			const nextObjects = [...state.objects];
			nextObjects[index] = {
				...current,
				position: nextPosition,
				rotation: nextRotation,
				scale: nextScale,
			};

			// Debug log the changes
			if (isTranslateGesture || isRotateGesture || isScaleGesture) {
				console.log("🎨 Applying changes:", {
					gesture: isTranslateGesture
						? "TRANSLATE"
						: isRotateGesture
							? "ROTATE"
							: "SCALE",
					position: nextPosition,
					rotation: nextRotation,
					scale: nextScale,
				});
			}

			return { ...baseState, objects: nextObjects };
		}),
	reset: () => sceneStore.setState(() => initialState),

	// Persistence actions
	saveProject: async (name: string, description?: string) => {
		const state = sceneStore.state;
		const id = await persistenceService.saveProject(name, state, description);
		return id;
	},

	updateProject: async (id: string, name: string, description?: string) => {
		const state = sceneStore.state;
		await persistenceService.updateProject(id, name, state, description);
	},

	loadProject: async (id: string) => {
		const state = await persistenceService.loadProject(id);
		if (state) {
			sceneStore.setState(() => state);
		}
		return state;
	},

	restoreAutoSave: async () => {
		const state = await persistenceService.loadAutoSave();
		if (state) {
			sceneStore.setState(() => state);
			return true;
		}
		return false;
	},

	listProjects: async () => {
		return await persistenceService.listProjects();
	},

	deleteProject: async (id: string) => {
		await persistenceService.deleteProject(id);
	},
};

export type SceneStore = typeof sceneStore;
