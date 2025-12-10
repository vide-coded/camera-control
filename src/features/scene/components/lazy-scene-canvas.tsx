import { Suspense, lazy } from "react";

const SceneCanvas = lazy(() =>
	import("./scene-canvas").then((module) => ({
		default: module.SceneCanvas,
	})),
);

export function LazySceneCanvas() {
	return (
		<Suspense
			fallback={
				<div className="flex h-[520px] w-full items-center justify-center rounded-lg border border-border bg-muted">
					<div className="space-y-2 text-center">
						<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-sm text-muted-foreground">Loading 3D scene...</p>
					</div>
				</div>
			}
		>
			<SceneCanvas />
		</Suspense>
	);
}
