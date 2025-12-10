import { useCallback, useEffect, useState } from "react";

export type CameraPermissionState =
	| "unknown"
	| "prompt"
	| "granted"
	| "denied"
	| "unsupported";

type UseCameraPermissionsResult = {
	permissionState: CameraPermissionState;
	requestPermission: () => Promise<void>;
	isSupported: boolean;
	browserInstructions: string | null;
};

/**
 * Hook to manage camera permission state and provide
 * retry mechanisms with browser-specific guidance.
 */
export function useCameraPermissions(): UseCameraPermissionsResult {
	const [permissionState, setPermissionState] =
		useState<CameraPermissionState>("unknown");

	const isSupported =
		typeof navigator !== "undefined" &&
		Boolean(navigator.mediaDevices?.getUserMedia);

	const getBrowserInstructions = useCallback((): string | null => {
		if (permissionState !== "denied") return null;

		const userAgent = navigator.userAgent.toLowerCase();

		if (userAgent.includes("chrome") || userAgent.includes("edge")) {
			return "Click the camera icon in the address bar, then 'Allow'.";
		}

		if (userAgent.includes("firefox")) {
			return "Click the camera icon in the address bar and select 'Allow'.";
		}

		if (userAgent.includes("safari")) {
			return "Go to Safari → Settings → Websites → Camera, and allow this site.";
		}

		return "Check your browser settings to enable camera access for this site.";
	}, [permissionState]);

	const checkPermissionAPI = useCallback(async () => {
		// Not all browsers support the Permissions API for camera
		if (!navigator.permissions) {
			setPermissionState("unknown");
			return;
		}

		try {
			const result = await navigator.permissions.query({
				name: "camera" as PermissionName,
			});

			// Map browser permission state to our state
			switch (result.state) {
				case "granted":
					setPermissionState("granted");
					break;
				case "denied":
					setPermissionState("denied");
					break;
				case "prompt":
					setPermissionState("prompt");
					break;
				default:
					setPermissionState("unknown");
			}

			// Listen for permission changes
			result.addEventListener("change", () => {
				switch (result.state) {
					case "granted":
						setPermissionState("granted");
						break;
					case "denied":
						setPermissionState("denied");
						break;
					case "prompt":
						setPermissionState("prompt");
						break;
				}
			});
		} catch (err) {
			// Permissions API query failed (common on some browsers)
			setPermissionState("unknown");
		}
	}, []);

	const requestPermission = useCallback(async () => {
		if (!isSupported) {
			setPermissionState("unsupported");
			return;
		}

		try {
			// Attempt to get camera stream
			// This will trigger browser permission dialog if needed
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user" },
				audio: false,
			});

			// Permission granted
			setPermissionState("granted");

			// Stop the stream immediately - we just needed to check permission
			for (const track of stream.getTracks()) {
				track.stop();
			}
		} catch (err) {
			// Check if user denied permission
			if (err instanceof Error) {
				if (
					err.name === "NotAllowedError" ||
					err.name === "PermissionDeniedError"
				) {
					setPermissionState("denied");
				} else if (err.name === "NotFoundError") {
					setPermissionState("unsupported");
				} else {
					setPermissionState("denied");
				}
			}
		}
	}, [isSupported]);

	// Check initial permission state
	useEffect(() => {
		if (!isSupported) {
			setPermissionState("unsupported");
			return;
		}

		void checkPermissionAPI();
	}, [isSupported, checkPermissionAPI]);

	return {
		permissionState,
		requestPermission,
		isSupported,
		browserInstructions: getBrowserInstructions(),
	};
}
