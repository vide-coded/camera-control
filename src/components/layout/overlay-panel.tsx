import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const positionClassnames: Record<OverlayPosition, string> = {
	"top-left": "top-4 left-4",
	"top-right": "top-4 right-4",
	"bottom-left": "bottom-4 left-4",
	"bottom-right": "bottom-4 right-4",
};

type OverlayPosition =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

type OverlayPanelProps = {
	title: string;
	children: ReactNode;
	position?: OverlayPosition;
	className?: string;
};

export function OverlayPanel({
	title,
	children,
	position = "top-right",
	className,
}: OverlayPanelProps) {
	return (
		<div className="pointer-events-none absolute inset-0">
			<section
				className={cn(
					"pointer-events-auto w-[280px] rounded-lg border border-border bg-card shadow-lg",
					positionClassnames[position],
					className,
				)}
				aria-label={title}
			>
				<header className="border-b border-border px-4 py-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
						{title}
					</p>
				</header>
				<div className="space-y-3 px-4 py-3 text-sm text-foreground">
					{children}
				</div>
			</section>
		</div>
	);
}
