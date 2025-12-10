import { createRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import {
	SceneErrorBoundary,
	VisionErrorBoundary,
} from "@/components/error-boundary";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ProjectManager } from "@/components/project-manager";
import { ProjectsList } from "@/components/projects-list";
import { SessionRecovery } from "@/components/session-recovery";
import { Button } from "@/components/ui/button";
import { GestureHud, ObjectPalette, SceneControls } from "@/features/scene";
import { LazySceneCanvas } from "@/features/scene/components/lazy-scene-canvas";
import { VisionPanel } from "@/features/vision";
import { useAutoSave } from "@/hooks/use-auto-save";
import { gestureStore } from "@/hooks/use-gesture-store";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { sceneActions } from "@/hooks/use-scene-store";
import { rootRoute } from "./root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: HomeRoute,
});

function HomeRoute() {
	// Enable auto-save
	useAutoSave();

	// Enable keyboard controls for accessibility
	useKeyboardControls();

	useEffect(() => {
		// NO THROTTLING - Apply gestures immediately for extreme precision
		const unsubscribe = gestureStore.subscribe(() => {
			// Wire gesture frames directly into the scene store without re-rendering the route
			const state = gestureStore.state;

			// Debug logging
			if (state.handPresent && state.pinchStrength > 0.15) {
				console.log("🎯 Gesture detected:", {
					pinchStrength: state.pinchStrength.toFixed(3),
					openness: state.openness.toFixed(3),
					translation: {
						x: state.translation.x.toFixed(3),
						y: state.translation.y.toFixed(3),
					},
					roll: state.roll.toFixed(3),
					scale: state.scale.toFixed(3),
					confidence: state.confidence.toFixed(3),
				});
			}

			sceneActions.applyGesture(state);
		});

		return () => {
			unsubscribe();
		};
	}, []);

	return (
		<>
			<SessionRecovery />

			<section className="mx-auto flex max-w-6xl flex-col gap-8">
				<header className="space-y-2">
					<p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
						Phase 3 — Scene interaction
					</p>
					<h1 className="text-3xl font-semibold leading-tight">
						Gesture-driven scene control
					</h1>
					<p className="max-w-3xl text-sm text-muted-foreground">
						Use pinch-and-move gestures to reposition, rotate, and scale the
						active object. Spawn new shapes from the palette and pick which one
						to control.
					</p>
					<div className="flex items-center gap-3 pt-2">
						<ProjectManager />
						<ProjectsList />
						<KeyboardShortcuts />
					</div>
				</header>
				<VisionErrorBoundary>
					<VisionPanel />
				</VisionErrorBoundary>
				<div className="relative rounded-xl border border-border bg-card p-4 shadow-sm">
					<SceneErrorBoundary>
						<LazySceneCanvas />
					</SceneErrorBoundary>
					<ObjectPalette />
					<GestureHud />
				</div>
				<div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
					<div>
						Scene state is powered by TanStack Store with live gesture mapping.
						Pinch to grab, move your hand to translate, and roll your wrist to
						rotate.
					</div>
					<SceneControls />
				</div>
			</section>
		</>
	);
}
