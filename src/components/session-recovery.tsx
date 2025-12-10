import { persistenceService } from "@/lib/db/persistence";
import { sceneStore } from "@/stores/scene-store";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function SessionRecovery() {
	const [hasAutoSave, setHasAutoSave] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		// Check for autosave on mount
		const checkAutoSave = async () => {
			try {
				const state = await persistenceService.loadAutoSave();

				if (state) {
					setHasAutoSave(true);
				}
			} catch (err) {
				console.error("Failed to check autosave:", err);
			}
		};

		checkAutoSave();
	}, []);

	const handleRestore = async () => {
		setIsRestoring(true);
		try {
			const state = await persistenceService.loadAutoSave();
			if (state) {
				sceneStore.setState(() => state);
				console.log("✅ Session restored");
				setDismissed(true);
			}
		} catch (err) {
			console.error("Failed to restore session:", err);
		} finally {
			setIsRestoring(false);
		}
	};

	const handleDismiss = () => {
		setDismissed(true);
	};

	if (!hasAutoSave || dismissed) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-blue-500 bg-blue-50 p-4 shadow-lg dark:bg-blue-950">
			<div className="flex items-start gap-3">
				<div className="flex-1">
					<h3 className="font-semibold text-blue-900 dark:text-blue-100">
						Session Recovery
					</h3>
					<p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
						We found an unsaved session. Would you like to restore it?
					</p>
				</div>
			</div>

			<div className="mt-3 flex gap-2">
				<Button
					onClick={handleRestore}
					disabled={isRestoring}
					size="sm"
					className="bg-blue-600 hover:bg-blue-700"
				>
					{isRestoring ? "Restoring..." : "Restore Session"}
				</Button>
				<Button
					onClick={handleDismiss}
					variant="outline"
					size="sm"
					className="border-blue-300"
				>
					Dismiss
				</Button>
			</div>
		</div>
	);
}
