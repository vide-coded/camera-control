import {
	FilesetResolver,
	HandLandmarker,
	type HandLandmarkerResult,
	type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

const MODEL_ASSET_URL =
	"https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_PATH =
	"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";

export type TrackerStartOptions = {
	video: HTMLVideoElement;
	canvas?: HTMLCanvasElement | null;
	onResults: (result: HandLandmarkerResult | null, timestamp: number) => void;
	maxFPS?: number;
};

export type HandTracker = {
	load: () => Promise<void>;
	start: (options: TrackerStartOptions) => Promise<void>;
	stop: () => Promise<void>;
};

const HAND_CONNECTIONS: Array<[number, number]> = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[5, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[9, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[13, 17],
	[17, 18],
	[18, 19],
	[19, 20],
	[0, 17],
];

export function createHandTracker(): HandTracker {
	let landmarker: HandLandmarker | null = null;
	let rafId: number | null = null;
	let lastTimestamp = 0;

	const closeLandmarker = async () => {
		if (!landmarker) return;
		await landmarker.close();
		landmarker = null;
	};

	const stop = async () => {
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		lastTimestamp = 0;
		await closeLandmarker();
	};

	const load = async () => {
		if (landmarker) return;
		const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
		landmarker = await HandLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: MODEL_ASSET_URL,
				delegate: "GPU", // Force GPU acceleration for better performance
			},
			runningMode: "VIDEO",
			minHandDetectionConfidence: 0.7, // Higher threshold for stability
			minHandPresenceConfidence: 0.7, // Reduce false positives
			minTrackingConfidence: 0.8, // Prioritize accurate tracking
			numHands: 1,
		});
	};

	const drawOverlay = (
		canvas: HTMLCanvasElement,
		landmarks: NormalizedLandmark[] | undefined,
	) => {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (!landmarks) return;

		ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
		ctx.fillStyle = "rgba(59, 130, 246, 0.85)";
		ctx.lineWidth = 2;

		const project = (landmark: NormalizedLandmark) => ({
			x: landmark.x * canvas.width,
			y: landmark.y * canvas.height,
		});

		for (const [start, end] of HAND_CONNECTIONS) {
			const from = project(landmarks[start]);
			const to = project(landmarks[end]);
			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
		}

		for (const landmark of landmarks) {
			const point = project(landmark);
			ctx.beginPath();
			ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
			ctx.fill();
		}
	};

	const start = async ({
		video,
		canvas,
		onResults,
		maxFPS = 30,
	}: TrackerStartOptions) => {
		if (!video.srcObject) throw new Error("Video stream not available");

		await stop();
		await load();

		// Wait for video metadata to load before starting render loop
		if (!video.videoWidth || !video.videoHeight) {
			await new Promise<void>((resolve) => {
				const checkReady = () => {
					if (video.videoWidth > 0 && video.videoHeight > 0) {
						resolve();
					} else {
						setTimeout(checkReady, 50);
					}
				};
				checkReady();
			});
		}

		const frameInterval = 1000 / maxFPS;

		const renderLoop = (timestamp: number) => {
			if (!landmarker) return;

			if (!video.videoWidth || !video.videoHeight) {
				rafId = requestAnimationFrame(renderLoop);
				return;
			}

			if (canvas) {
				if (
					canvas.width !== video.videoWidth ||
					canvas.height !== video.videoHeight
				) {
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
				}
			}

			if (timestamp - lastTimestamp < frameInterval) {
				rafId = requestAnimationFrame(renderLoop);
				return;
			}

			lastTimestamp = timestamp;
			const result = landmarker.detectForVideo(video, timestamp);
			const handLandmarks = result.landmarks?.[0];

			if (canvas) {
				drawOverlay(canvas, handLandmarks);
			}

			onResults(handLandmarks ? result : null, timestamp);
			rafId = requestAnimationFrame(renderLoop);
		};

		rafId = requestAnimationFrame(renderLoop);
	};

	return {
		load,
		start,
		stop,
	};
}
