import { createRouter } from "@tanstack/react-router";

import { queryClient } from "./lib/query-client";
import { routeTree } from "./routes/route-tree";
import { sceneStore } from "./stores/scene-store";

export const router = createRouter({
	routeTree,
	context: { queryClient, sceneStore },
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
