import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props {
	children: ReactNode;
	fallback?: (error: Error, reset: () => void) => ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	name?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error details to console
		console.error(
			`[ErrorBoundary${this.props.name ? ` - ${this.props.name}` : ""}]:`,
			error,
			errorInfo,
		);

		// Call optional error handler
		this.props.onError?.(error, errorInfo);
	}

	reset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, this.reset);
			}

			// Default fallback UI
			return (
				<DefaultErrorFallback
					error={this.state.error}
					reset={this.reset}
					name={this.props.name}
				/>
			);
		}

		return this.props.children;
	}
}

interface FallbackProps {
	error: Error;
	reset: () => void;
	name?: string;
}

function DefaultErrorFallback({ error, reset, name }: FallbackProps) {
	return (
		<div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold text-destructive">
					{name ? `${name} Error` : "Something went wrong"}
				</h3>
				<p className="max-w-md text-sm text-muted-foreground">
					{error.message || "An unexpected error occurred"}
				</p>
			</div>

			<div className="flex gap-2">
				<Button onClick={reset} variant="default" size="sm">
					Try Again
				</Button>
				<Button
					onClick={() => window.location.reload()}
					variant="outline"
					size="sm"
				>
					Reload Page
				</Button>
			</div>

			{import.meta.env.DEV && (
				<details className="mt-4 max-w-2xl text-left">
					<summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
						Error Details (Development Only)
					</summary>
					<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
						{error.stack}
					</pre>
				</details>
			)}
		</div>
	);
}

// Specialized error boundary for vision features
export function VisionErrorBoundary({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary
			name="Vision"
			fallback={(error, reset) => (
				<div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-destructive">
							Camera or Vision Error
						</h3>
						<p className="max-w-md text-sm text-muted-foreground">
							{error.message.includes("camera") ||
							error.message.includes("Camera")
								? error.message
								: "Unable to initialize camera or vision tracking. This may be due to browser permissions, camera availability, or MediaPipe loading issues."}
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<Button onClick={reset} variant="default" size="sm">
							Retry Camera Access
						</Button>
						<p className="text-xs text-muted-foreground">
							If the problem persists, check your browser's camera permissions
							or try a different browser.
						</p>
					</div>

					{import.meta.env.DEV && (
						<details className="mt-4 max-w-2xl text-left">
							<summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
								Error Details
							</summary>
							<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
								{error.stack}
							</pre>
						</details>
					)}
				</div>
			)}
			onError={(error, errorInfo) => {
				// Log vision-specific errors with additional context
				console.error("[Vision Error]:", {
					error,
					errorInfo,
					userAgent: navigator.userAgent,
					mediaDevices: "mediaDevices" in navigator,
				});
			}}
		>
			{children}
		</ErrorBoundary>
	);
}

// Specialized error boundary for 3D scene
export function SceneErrorBoundary({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary
			name="3D Scene"
			fallback={(error, reset) => (
				<div className="flex min-h-[500px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-destructive">
							Scene Rendering Error
						</h3>
						<p className="max-w-md text-sm text-muted-foreground">
							{error.message.includes("WebGL")
								? "WebGL is not available in your browser. Please ensure WebGL is enabled or try a different browser."
								: "Unable to render the 3D scene. This may be due to WebGL support, memory issues, or graphics driver problems."}
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<Button onClick={reset} variant="default" size="sm">
							Retry Scene
						</Button>
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
							size="sm"
						>
							Reload Page
						</Button>
					</div>

					{import.meta.env.DEV && (
						<details className="mt-4 max-w-2xl text-left">
							<summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
								Error Details
							</summary>
							<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
								{error.stack}
							</pre>
						</details>
					)}
				</div>
			)}
			onError={(error, errorInfo) => {
				// Log scene-specific errors with additional context
				console.error("[Scene Error]:", {
					error,
					errorInfo,
					webgl: document.createElement("canvas").getContext("webgl") !== null,
					userAgent: navigator.userAgent,
				});
			}}
		>
			{children}
		</ErrorBoundary>
	);
}
