import type { QueryClient } from "@tanstack/react-query";

import type { SceneStore } from "@/stores/scene-store";

export type RouterContext = {
	queryClient: QueryClient;
	sceneStore: SceneStore;
};
