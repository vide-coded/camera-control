import { useState } from "react";

import { Button } from "@/components/ui/button";

const shortcuts = [
	{
		category: "Position",
		keys: [
			{ key: "← → ↑ ↓", description: "Move object horizontally/vertically" },
			{ key: "W / S", description: "Move object forward/backward" },
			{ key: "A / D", description: "Move object left/right" },
		],
	},
	{
		category: "Scale",
		keys: [
			{ key: "+ / =", description: "Increase size" },
			{ key: "-", description: "Decrease size" },
		],
	},
	{
		category: "Rotation",
		keys: [
			{ key: "Q / E", description: "Rotate Y-axis (left/right)" },
			{ key: "Shift + Q/E", description: "Rotate X-axis (up/down)" },
		],
	},
	{
		category: "Selection",
		keys: [
			{ key: "Tab", description: "Select next object" },
			{ key: "Shift + Tab", description: "Select previous object" },
		],
	},
];

export function KeyboardShortcuts() {
	const [isOpen, setIsOpen] = useState(false);

	const handleClose = () => setIsOpen(false);
	const handleBackdropClick = (e: React.MouseEvent | React.KeyboardEvent) => {
		if (e.type === "keydown") {
			const kbEvent = e as React.KeyboardEvent;
			if (kbEvent.key === "Escape" || kbEvent.key === "Enter") {
				handleClose();
			}
		} else {
			handleClose();
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Show keyboard shortcuts"
				aria-expanded={isOpen}
			>
				<span className="mr-2">⌨️</span>
				Keyboard Controls
			</Button>

			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
					onClick={handleBackdropClick}
					onKeyDown={handleBackdropClick}
					role="button"
					tabIndex={0}
					aria-label="Close dialog"
				>
					<div
						className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
						role="dialog"
						aria-modal="true"
						aria-labelledby="shortcuts-title"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<div className="mb-4 flex items-center justify-between">
							<h2 id="shortcuts-title" className="text-xl font-semibold">
								Keyboard Shortcuts
							</h2>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="rounded-md p-1 hover:bg-muted"
								aria-label="Close shortcuts dialog"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Close</title>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<p className="mb-6 text-sm text-muted-foreground">
							Use your keyboard to manipulate objects in the scene. All gesture
							controls have keyboard alternatives for accessibility.
						</p>

						<div className="space-y-6">
							{shortcuts.map((section) => (
								<div key={section.category}>
									<h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
										{section.category}
									</h3>
									<div className="space-y-2">
										{section.keys.map((shortcut) => (
											<div
												key={shortcut.key}
												className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2"
											>
												<span className="text-sm text-muted-foreground">
													{shortcut.description}
												</span>
												<kbd className="rounded border border-border bg-background px-2 py-1 text-xs font-mono font-semibold text-foreground shadow-sm">
													{shortcut.key}
												</kbd>
											</div>
										))}
									</div>
								</div>
							))}
						</div>

						<div className="mt-6 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
							<p className="font-semibold">💡 Tip:</p>
							<p className="mt-1">
								Keyboard shortcuts work when no input field is focused. Press
								Escape to dismiss dialogs.
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
