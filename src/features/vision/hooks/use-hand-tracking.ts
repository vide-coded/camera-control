import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import { mapLandmarksToGesture } from "@/features/vision/gesture-mapper";
import type {
	HandTracker,
	TrackerStartOptions,
} from "@/features/vision/hand-tracker";
import { gestureActions } from "@/stores/gesture-store";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "error";
type PipelineState = "idle" | "loading" | "ready" | "running" | "error";

type UseHandTrackingResult = {
	videoRef: RefObject<HTMLVideoElement>;
	canvasRef: RefObject<HTMLCanvasElement>;
	permission: PermissionState;
	pipeline: PipelineState;
	error: string | null;
	handPresent: boolean;
	start: () => Promise<void>;
	stop: () => Promise<void>;
	isSupported: boolean;
};

// LAZY IMPORT: MediaPipe loaded only when camera enabled
const loadHandTracker = async (): Promise<HandTracker> => {
	console.log("📦 Loading MediaPipe (lazy)...");
	const { createHandTracker } = await import("@/features/vision/hand-tracker");
	const tracker = createHandTracker();
	console.log("✅ MediaPipe loaded");
	return tracker;
};

export function useHandTracking(): UseHandTrackingResult {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const trackerRef = useRef<HandTracker | null>(null);
	const lastFrameRef = useRef<number | null>(null);
	const lastDetectRef = useRef<number | null>(null);
	const lastStartOptionsRef = useRef<TrackerStartOptions | null>(null);

	const [permission, setPermission] = useState<PermissionState>("idle");
	const [pipeline, setPipeline] = useState<PipelineState>("idle");
	const [error, setError] = useState<string | null>(null);
	const [handPresent, setHandPresent] = useState(false);

	const isSupported =
		typeof navigator !== "undefined" &&
		Boolean(navigator.mediaDevices?.getUserMedia);

	const teardownStream = useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
	}, []);

	const handleResults = useCallback(
		(result: HandLandmarkerResult | null, timestamp: number) => {
			if (!result?.landmarks?.length) {
				gestureActions.markNoHand();
				setHandPresent(false);
				return;
			}

			const landmarks = result.landmarks[0];
			const gestureFrame = mapLandmarksToGesture(landmarks, timestamp);
			if (!gestureFrame) {
				gestureActions.markNoHand();
				setHandPresent(false);
				return;
			}

			lastDetectRef.current = performance.now();
			const previous = lastFrameRef.current;
			const fps = previous
				? Math.min(60, 1000 / Math.max(1, timestamp - previous))
				: 0;
			lastFrameRef.current = timestamp;

			gestureActions.ingestFrame(gestureFrame, fps);
			setHandPresent(true);
		},
		[],
	);

	const stop = useCallback(async () => {
		if (!trackerRef.current) return;
		await trackerRef.current.stop();
		teardownStream();
		gestureActions.reset();
		lastFrameRef.current = null;
		lastDetectRef.current = null;
		setPipeline("ready");
		setHandPresent(false);
	}, [teardownStream]);

	const restartTracking = useCallback(async () => {
		if (!lastStartOptionsRef.current || !trackerRef.current) return;
		await trackerRef.current.stop();
		setPipeline("ready");
		lastFrameRef.current = null;
		lastDetectRef.current = null;
		setHandPresent(false);
		gestureActions.markNoHand();
		await trackerRef.current.start(lastStartOptionsRef.current);
		setPipeline("running");
	}, []);

	const start = useCallback(async () => {
		if (!isSupported) {
			setError("Camera APIs are not available in this browser");
			setPermission("error");
			return;
		}

		const video = videoRef.current;
		if (!video) {
			setError("Video element missing");
			return;
		}

		try {
			setPermission("requesting");
			setError(null);

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
					width: { ideal: 1280 },
					height: { ideal: 720 },
				},
				audio: false,
			});

			streamRef.current = stream;
			video.srcObject = stream;
			await video.play();
			setPermission("granted");

			setPipeline("loading");

			// Lazy load MediaPipe only when camera is enabled
			if (!trackerRef.current) {
				trackerRef.current = await loadHandTracker();
			}

			await trackerRef.current.load();
			setPipeline("ready");

			const options: TrackerStartOptions = {
				video,
				canvas: canvasRef.current,
				onResults: handleResults,
				maxFPS: 60, // Double FPS for ultra-smooth tracking
			};
			lastStartOptionsRef.current = options;
			lastDetectRef.current = null;
			await trackerRef.current.start(options);

			setPipeline("running");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Camera permission failed";
			setError(message);
			setPermission("denied");
			setPipeline("error");
			gestureActions.reset();
			lastFrameRef.current = null;
			teardownStream();
		}
	}, [handleResults, isSupported, teardownStream]);

	useEffect(() => {
		if (pipeline !== "running") return undefined;
		const id = setInterval(() => {
			const last = lastDetectRef.current;
			if (!last) return;
			if (performance.now() - last > 3000) {
				void restartTracking();
			}
		}, 1200);
		return () => clearInterval(id);
	}, [pipeline, restartTracking]);

	useEffect(
		() => () => {
			void stop();
		},
		[stop],
	);

	return {
		videoRef,
		canvasRef,
		permission,
		pipeline,
		error,
		handPresent,
		start,
		stop,
		isSupported,
	};
}
