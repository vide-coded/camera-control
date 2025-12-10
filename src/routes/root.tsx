import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import type { RouterContext } from "@/types/router";

export const rootRoute = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});

function RootLayout() {
	return (
		<AppShell>
			<Outlet />
		</AppShell>
	);
}
