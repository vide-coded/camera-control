import { useStore } from "@tanstack/react-store";

import {
	type SceneState,
	sceneActions,
	sceneStore,
} from "@/stores/scene-store";

export function useSceneState<T>(selector: (state: SceneState) => T) {
	return useStore(sceneStore, selector);
}

export { sceneActions, sceneStore };
