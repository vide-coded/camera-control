/**
 * Performance monitoring utilities for tracking app performance in development
 */

export type PerformanceMetrics = {
	fps: number;
	memory?: number; // MB
	renderTime: number; // ms
};

export class PerformanceMonitor {
	private frameCount = 0;
	private lastCheck = performance.now();
	private lastRenderTime = 0;
	private renderTimes: number[] = [];
	private readonly maxSamples = 60;

	public recordFrame(renderStart: number): void {
		this.frameCount++;
		const renderEnd = performance.now();
		const renderTime = renderEnd - renderStart;

		this.renderTimes.push(renderTime);
		if (this.renderTimes.length > this.maxSamples) {
			this.renderTimes.shift();
		}

		this.lastRenderTime = renderTime;
	}

	public getMetrics(): PerformanceMetrics {
		const now = performance.now();
		const elapsed = now - this.lastCheck;

		const fps =
			elapsed > 0 ? Math.round((this.frameCount * 1000) / elapsed) : 0;
		const avgRenderTime =
			this.renderTimes.length > 0
				? this.renderTimes.reduce((sum, t) => sum + t, 0) /
					this.renderTimes.length
				: 0;

		const metrics: PerformanceMetrics = {
			fps,
			renderTime: avgRenderTime,
		};

		// Add memory info if available (Chromium-based browsers)
		if ("memory" in performance) {
			const memory = (performance as { memory: { usedJSHeapSize: number } })
				.memory;
			metrics.memory = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
		}

		return metrics;
	}

	public reset(): void {
		this.frameCount = 0;
		this.lastCheck = performance.now();
		this.renderTimes = [];
	}

	public logMetrics(): void {
		const metrics = this.getMetrics();
		console.log("[Performance]", {
			fps: metrics.fps,
			renderTime: `${metrics.renderTime.toFixed(2)}ms`,
			memory: metrics.memory ? `${metrics.memory}MB` : "N/A",
		});
		this.reset();
	}
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (...args: never[]) => unknown>(
	fn: T,
	ms: number,
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	return (...args: Parameters<T>) => {
		const now = Date.now();
		if (now - lastCall >= ms) {
			lastCall = now;
			fn(...args);
		}
	};
}

/**
 * Debounce function to delay execution until after wait period
 */
export function debounce<T extends (...args: never[]) => unknown>(
	fn: T,
	ms: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<T>) => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), ms);
	};
}
