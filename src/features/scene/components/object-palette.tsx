import { memo, useMemo } from "react";

import { OverlayPanel } from "@/components/layout/overlay-panel";
import { Button } from "@/components/ui/button";
import { sceneActions, useSceneState } from "@/hooks/use-scene-store";
import type { SceneObjectType } from "@/stores/scene-store";

const paletteOptions: Array<{
	type: SceneObjectType;
	label: string;
	hint: string;
}> = [
	{ type: "cube", label: "Cube", hint: "Stable base" },
	{ type: "sphere", label: "Sphere", hint: "Smooth roll" },
	{ type: "cone", label: "Cone", hint: "Directional" },
];

export const ObjectPalette = memo(function ObjectPalette() {
	const { objects, selectedId } = useSceneState((state) => ({
		objects: state.objects,
		selectedId: state.selectedId,
	}));

	// Memoize object count to avoid unnecessary re-renders
	const objectCount = useMemo(() => objects.length, [objects.length]);

	return (
		<OverlayPanel title="Objects" position="top-left" className="w-[320px]">
			<div
				className="grid grid-cols-3 gap-2"
				role="group"
				aria-label="Spawn objects"
			>
				{paletteOptions.map((option) => (
					<Button
						key={option.type}
						variant="outline"
						size="sm"
						className="h-10 text-xs"
						onClick={() => sceneActions.addObject(option.type)}
						aria-label={`Spawn ${option.label}: ${option.hint}`}
					>
						{option.label}
					</Button>
				))}
			</div>

			<p className="text-xs text-muted-foreground">
				Spawn a shape, then pinch and drag in front of the camera to move,
				rotate, and scale the active selection.
			</p>

			<div
				className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted/40"
				role="list"
				aria-label="Objects in scene"
			>
				{objects.map((object) => (
					<button
						key={object.id}
						type="button"
						onClick={() => sceneActions.selectObject(object.id)}
						aria-label={`Select ${object.type} at position ${object.position.x.toFixed(1)}, ${object.position.y.toFixed(1)}, scale ${object.scale.toFixed(2)}`}
						aria-pressed={selectedId === object.id}
						role="listitem"
						className={`flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-muted/70 ${selectedId === object.id ? "bg-background" : ""}`}
					>
						<div>
							<p className="text-sm font-semibold text-foreground">
								{object.type.charAt(0).toUpperCase() + object.type.slice(1)}
							</p>
							<p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
								Scale {object.scale.toFixed(2)} · Pos{" "}
								{object.position.x.toFixed(1)}, {object.position.y.toFixed(1)}
							</p>
						</div>
						<span
							className={`rounded-full px-3 py-1 text-[11px] font-semibold ${selectedId === object.id ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
						>
							{selectedId === object.id ? "Selected" : "Tap to control"}
						</span>
					</button>
				))}
				{objectCount === 0 && (
					<div className="px-3 py-2 text-sm text-muted-foreground">
						No objects yet. Add one to begin.
					</div>
				)}
			</div>
		</OverlayPanel>
	);
});
