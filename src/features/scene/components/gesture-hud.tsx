import { OverlayPanel } from "@/components/layout/overlay-panel";
import { useGestureState } from "@/hooks/use-gesture-store";
import { useSceneState } from "@/hooks/use-scene-store";

const modeCopy: Record<string, { label: string; tone: string }> = {
	idle: { label: "Idle", tone: "bg-muted text-muted-foreground" },
	tracking: {
		label: "Tracking",
		tone: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	},
	manipulating: {
		label: "Manipulating",
		tone: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400",
	},
};

export function GestureHud() {
	const gesture = useGestureState((state) => state);
	const { selected, gestureMode, lastGestureAt } = useSceneState((state) => ({
		selected: state.objects.find((object) => object.id === state.selectedId),
		gestureMode: state.gestureMode,
		lastGestureAt: state.lastGestureAt,
	}));
	const {
		translation,
		scale,
		roll,
		pinchStrength,
		openness,
		handPresent,
		fps,
		lastUpdated,
		confidence,
	} = gesture;

	// Note: applyGesture is called by the route's subscription to gestureStore
	// No need to duplicate that here

	const mode = modeCopy[gestureMode] ?? modeCopy.idle;
	const status = gesture.handPresent ? "Hand detected" : "No hand";

	return (
		<OverlayPanel
			title="Gesture control"
			position="top-right"
			className="w-[320px]"
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
						Mode
					</p>
					<span
						className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${mode.tone}`}
					>
						<span className="h-2 w-2 rounded-full bg-current opacity-60" />
						{mode.label}
					</span>
				</div>
				<div className="text-right">
					<p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
						Selected
					</p>
					<p className="text-sm font-semibold text-foreground">
						{selected ? selected.type : "None"}
					</p>
					<p className="text-[11px] text-muted-foreground">{status}</p>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2 text-xs">
				<Metric label="Translate X" value={gesture.translation.x.toFixed(2)} />
				<Metric label="Translate Y" value={gesture.translation.y.toFixed(2)} />
				<Metric label="Roll" value={`${gesture.roll.toFixed(2)} rad`} />
				<Metric label="Openness" value={gesture.openness.toFixed(2)} />
				<Metric label="Pinch" value={gesture.pinchStrength.toFixed(2)} />
				<Metric label="Confidence" value={gesture.confidence.toFixed(2)} />
			</div>

			<p className="text-[11px] text-muted-foreground">
				Ultra-precision mode: Pinch past 0.15 to manipulate. Confidence &gt; 0.7
				required. Last input at{" "}
				{lastGestureAt ? new Date(lastGestureAt).toLocaleTimeString() : "—"}.
			</p>
		</OverlayPanel>
	);
}

type MetricProps = { label: string; value: string };

function Metric({ label, value }: MetricProps) {
	return (
		<div className="rounded-md border border-border bg-background px-3 py-2">
			<p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
				{label}
			</p>
			<p className="text-sm font-semibold text-foreground">{value}</p>
		</div>
	);
}
