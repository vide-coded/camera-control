import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useCameraPermissions } from "@/features/vision/hooks/use-camera-permissions";
import { useHandTracking } from "@/features/vision/hooks/use-hand-tracking";
import { useGestureState } from "@/hooks/use-gesture-store";

const statusCopy: Record<string, string> = {
	idle: "Camera idle",
	requesting: "Awaiting permission…",
	granted: "Camera ready",
	denied: "Camera blocked by user",
	error: "Camera unavailable",
};

const pipelineCopy: Record<string, string> = {
	idle: "Vision pipeline idle",
	loading: "Loading MediaPipe (WASM)…",
	ready: "Vision ready",
	running: "Tracking hands",
	error: "Vision error",
};

export function VisionPanel() {
	const {
		videoRef,
		canvasRef,
		permission,
		pipeline,
		error,
		handPresent,
		start,
		stop,
		isSupported,
	} = useHandTracking();
	const { permissionState, requestPermission, browserInstructions } =
		useCameraPermissions();
	const gesture = useGestureState((state) => state);

	const primaryMessage = useMemo(() => {
		if (!isSupported) return "This browser does not support camera access.";
		if (error) return error;
		if (permission === "denied" || permissionState === "denied") {
			return browserInstructions
				? `Camera blocked. ${browserInstructions}`
				: "Camera blocked. Please enable access in your browser settings.";
		}
		if (pipeline === "loading") return "Loading MediaPipe…";
		if (pipeline === "running")
			return handPresent
				? "Hand detected — live tracking"
				: "Camera on — show a hand close to center and pinch slightly to start";
		return "Enable camera to start tracking.";
	}, [
		error,
		handPresent,
		isSupported,
		permission,
		permissionState,
		pipeline,
		browserInstructions,
	]);

	return (
		<section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
			<div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/40">
				<video
					ref={videoRef}
					className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
					autoPlay
					muted
					playsInline
				/>
				<canvas
					ref={canvasRef}
					className="absolute inset-0 h-full w-full -scale-x-100"
				/>
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-background/20" />
				<div className="absolute left-3 top-3 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
					{statusCopy[permission] ?? "Camera idle"}
				</div>
				{pipeline === "running" && !handPresent && (
					<div className="absolute right-3 top-3 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm dark:text-amber-300">
						No hand detected — bring one into frame
					</div>
				)}
				{pipeline !== "running" && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/70 p-4">
						<div className="max-w-md text-center">
							<p
								className={`text-sm ${
									permission === "denied" || permissionState === "denied"
										? "text-amber-700 dark:text-amber-400"
										: "text-muted-foreground"
								}`}
							>
								{primaryMessage}
							</p>
							{(permission === "denied" || permissionState === "denied") && (
								<Button
									onClick={requestPermission}
									variant="outline"
									size="sm"
									className="mt-3"
								>
									Grant Camera Access
								</Button>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
				<header className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
							Phase 3 · Vision input
						</p>
						<h3 className="text-lg font-semibold leading-tight">
							Hand tracking pipeline
						</h3>
						<p className="text-sm text-muted-foreground">
							Camera permissions, WASM load, and gesture signal smoothing.
						</p>
					</div>
					<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
						{pipelineCopy[pipeline] ?? "Idle"}
					</span>
				</header>

				<div className="grid grid-cols-2 gap-3 text-sm">
					<StatusItem
						label="Hand"
						value={handPresent ? "Present" : "Not detected"}
						tone={handPresent ? "ok" : "muted"}
					/>
					<StatusItem
						label="FPS"
						value={`${gesture.fps.toFixed(0)} fps`}
						tone={gesture.fps > 0 ? "ok" : "muted"}
					/>
					<StatusItem
						label="Pinch"
						value={gesture.pinchStrength.toFixed(2)}
						tone="neutral"
					/>
					<StatusItem
						label="Openness"
						value={gesture.openness.toFixed(2)}
						tone="neutral"
					/>
					<StatusItem
						label="Scale"
						value={gesture.scale.toFixed(2)}
						tone="neutral"
					/>
					<StatusItem
						label="Roll"
						value={`${gesture.roll.toFixed(2)} rad`}
						tone="neutral"
					/>
					<StatusItem
						label="Translate X"
						value={gesture.translation.x.toFixed(2)}
						tone="neutral"
					/>
					<StatusItem
						label="Translate Y"
						value={gesture.translation.y.toFixed(2)}
						tone="neutral"
					/>
				</div>

				<div className="flex flex-col gap-3">
					{permissionState === "denied" && browserInstructions && (
						<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm">
							<p className="font-semibold text-amber-800 dark:text-amber-300">
								Camera Access Required
							</p>
							<p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
								{browserInstructions}
							</p>
							<Button
								onClick={requestPermission}
								variant="outline"
								size="sm"
								className="mt-2 border-amber-500/40 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
							>
								Try again
							</Button>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						<Button
							onClick={start}
							disabled={
								pipeline === "running" ||
								permission === "requesting" ||
								permissionState === "denied"
							}
						>
							{permission === "requesting"
								? "Requesting…"
								: pipeline === "running"
									? "Camera live"
									: "Enable camera"}
						</Button>
						<Button
							variant="outline"
							onClick={stop}
							disabled={pipeline === "idle" || pipeline === "error"}
						>
							Stop
						</Button>
					</div>
				</div>

				<div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
					<p className="font-medium text-foreground">Fallbacks</p>
					<p>
						If camera access is blocked, you&apos;ll see this message instead of
						a black screen. When unsupported, we surface a clear browser
						warning.
					</p>
				</div>
			</div>
		</section>
	);
}

type StatusItemProps = {
	label: string;
	value: string;
	tone: "ok" | "neutral" | "muted";
};

function StatusItem({ label, value, tone }: StatusItemProps) {
	const toneClass =
		tone === "ok"
			? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
			: tone === "muted"
				? "text-muted-foreground"
				: "text-foreground";

	return (
		<div className="rounded-lg border border-border bg-background px-3 py-2">
			<p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
				{label}
			</p>
			<p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
		</div>
	);
}
