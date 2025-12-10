import { useEffect } from "react";

import { sceneActions, useSceneState } from "@/hooks/use-scene-store";

type KeyboardControlOptions = {
	enabled?: boolean;
	translationStep?: number;
	rotationStep?: number;
	scaleStep?: number;
};

/**
 * Hook to enable keyboard controls for scene manipulation
 * Provides WCAG 2.1 AA compliant keyboard navigation
 */
export function useKeyboardControls(options: KeyboardControlOptions = {}) {
	const {
		enabled = true,
		translationStep = 0.1,
		rotationStep = 0.1,
		scaleStep = 0.05,
	} = options;

	const { objects, selectedId } = useSceneState((state) => ({
		objects: state.objects,
		selectedId: state.selectedId,
	}));

	useEffect(() => {
		if (!enabled || !selectedId) return;

		const selectedObject = objects.find((obj) => obj.id === selectedId);
		if (!selectedObject) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			// Ignore if user is typing in an input
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			const { key, shiftKey, ctrlKey, metaKey } = event;

			// Prevent default for keys we handle
			const handledKeys = [
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				"=",
				"+",
				"-",
				"q",
				"Q",
				"e",
				"E",
				"w",
				"W",
				"s",
				"S",
				"a",
				"A",
				"d",
				"D",
				"Tab",
			];

			if (handledKeys.includes(key)) {
				event.preventDefault();
			}

			// Translation controls
			// Arrow keys: X/Y movement
			// W/S: Z movement
			if (key === "ArrowLeft" || key === "a" || key === "A") {
				const newX = selectedObject.position.x - translationStep;
				sceneActions.setPosition({
					...selectedObject.position,
					x: Math.max(-3, Math.min(3, newX)),
				});
			} else if (key === "ArrowRight" || key === "d" || key === "D") {
				const newX = selectedObject.position.x + translationStep;
				sceneActions.setPosition({
					...selectedObject.position,
					x: Math.max(-3, Math.min(3, newX)),
				});
			} else if (key === "ArrowUp") {
				const newY = selectedObject.position.y + translationStep;
				sceneActions.setPosition({
					...selectedObject.position,
					y: Math.max(-1.5, Math.min(3, newY)),
				});
			} else if (key === "ArrowDown") {
				const newY = selectedObject.position.y - translationStep;
				sceneActions.setPosition({
					...selectedObject.position,
					y: Math.max(-1.5, Math.min(3, newY)),
				});
			} else if (key === "w" || key === "W") {
				const newZ = selectedObject.position.z + translationStep;
				sceneActions.setPosition({
					...selectedObject.position,
					z: Math.max(-3, Math.min(3, newZ)),
				});
			} else if (key === "s" || key === "S") {
				const newZ = selectedObject.position.z - translationStep;
				sceneActions.setPosition({
					...selectedObject.position,
					z: Math.max(-3, Math.min(3, newZ)),
				});
			}

			// Scale controls
			// +/= to increase, - to decrease
			else if (key === "=" || key === "+") {
				const newScale = selectedObject.scale + scaleStep;
				sceneActions.setScale(Math.max(0.6, Math.min(1.9, newScale)));
			} else if (key === "-") {
				const newScale = selectedObject.scale - scaleStep;
				sceneActions.setScale(Math.max(0.6, Math.min(1.9, newScale)));
			}

			// Rotation controls
			// Q/E for Y-axis rotation
			// Shift+Q/E for X-axis rotation
			else if (key === "q" || key === "Q") {
				if (shiftKey) {
					const newX = selectedObject.rotation.x - rotationStep;
					sceneActions.setRotation({
						...selectedObject.rotation,
						x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newX)),
					});
				} else {
					const newY = selectedObject.rotation.y - rotationStep;
					sceneActions.setRotation({
						...selectedObject.rotation,
						y: Math.max(-Math.PI, Math.min(Math.PI, newY)),
					});
				}
			} else if (key === "e" || key === "E") {
				if (shiftKey) {
					const newX = selectedObject.rotation.x + rotationStep;
					sceneActions.setRotation({
						...selectedObject.rotation,
						x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newX)),
					});
				} else {
					const newY = selectedObject.rotation.y + rotationStep;
					sceneActions.setRotation({
						...selectedObject.rotation,
						y: Math.max(-Math.PI, Math.min(Math.PI, newY)),
					});
				}
			}

			// Object selection with Tab
			else if (key === "Tab" && !ctrlKey && !metaKey) {
				const currentIndex = objects.findIndex((obj) => obj.id === selectedId);
				const nextIndex = shiftKey
					? (currentIndex - 1 + objects.length) % objects.length
					: (currentIndex + 1) % objects.length;
				sceneActions.selectObject(objects[nextIndex].id);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [enabled, selectedId, objects, translationStep, rotationStep, scaleStep]);
}
