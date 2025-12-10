import { persistenceService } from "@/lib/db/persistence";
import { sceneStore } from "@/stores/scene-store";
import { useEffect } from "react";

export function useAutoSave() {
	useEffect(() => {
		// Start auto-save on mount
		persistenceService.startAutoSave(() => sceneStore.state);

		// Cleanup on unmount
		return () => {
			persistenceService.stopAutoSave();
		};
	}, []);
}
