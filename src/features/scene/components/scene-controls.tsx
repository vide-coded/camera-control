import { Button } from "@/components/ui/button";
import { sceneActions, useSceneState } from "@/hooks/use-scene-store";

export function SceneControls() {
	const { selected, isAnimating } = useSceneState((state) => ({
		selected: state.objects.find((object) => object.id === state.selectedId),
		isAnimating: state.isAnimating,
	}));

	const scale = selected?.scale ?? 1;

	return (
		<div
			className="flex flex-wrap items-center gap-2 text-sm"
			role="toolbar"
			aria-label="Scene controls"
		>
			<Button
				variant={isAnimating ? "outline" : "default"}
				onClick={() => sceneActions.toggleAnimation()}
				aria-label={
					isAnimating
						? "Pause object rotation animation"
						: "Resume object rotation animation"
				}
			>
				{isAnimating ? "Pause spin" : "Resume spin"}
			</Button>
			<Button
				variant="secondary"
				onClick={() => sceneActions.setScale(Math.min(scale + 0.1, 2))}
				aria-label="Increase object scale"
				disabled={scale >= 2}
			>
				Scale +
			</Button>
			<Button
				variant="secondary"
				onClick={() => sceneActions.setScale(Math.max(scale - 0.1, 0.5))}
				aria-label="Decrease object scale"
				disabled={scale <= 0.5}
			>
				Scale -
			</Button>
			<Button
				variant="ghost"
				onClick={() => sceneActions.reset()}
				aria-label="Reset scene to default state"
			>
				Reset scene
			</Button>
			<div
				className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
				role="status"
				aria-live="polite"
			>
				<span className="font-semibold text-foreground">Selected: </span>
				{selected ? `${selected.type} (${selected.id})` : "None"}
			</div>
		</div>
	);
}
