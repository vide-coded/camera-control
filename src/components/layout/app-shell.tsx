import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
	children: ReactNode;
	className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
	return (
		<div
			className={cn("min-h-screen bg-background text-foreground", className)}
		>
			<header className="border-b border-border px-6 py-4">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<div className="text-sm font-semibold tracking-tight">
						Camera Control
					</div>
					<div className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
						Phase 3 — Scene interaction
					</div>
				</div>
			</header>
			<main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
				{children}
			</main>
		</div>
	);
}
