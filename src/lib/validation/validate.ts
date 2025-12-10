import { z } from "zod";
import type { ZodSchema } from "zod";

export interface ValidationResult<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Validate data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or error
 */
export function validate<T>(
	schema: ZodSchema<T>,
	data: unknown,
): ValidationResult<T> {
	try {
		const validated = schema.parse(data);
		return {
			success: true,
			data: validated,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const messages = error.errors.map((err) => {
				const path = err.path.join(".");
				return `${path}: ${err.message}`;
			});
			return {
				success: false,
				error: messages.join(", "),
			};
		}
		return {
			success: false,
			error: "Validation failed with unknown error",
		};
	}
}

/**
 * Safe parse that returns undefined on error
 * Useful for optional validation
 */
export function safeParse<T>(
	schema: ZodSchema<T>,
	data: unknown,
): T | undefined {
	const result = schema.safeParse(data);
	return result.success ? result.data : undefined;
}

/**
 * Validate and throw on error
 * Use when validation failure should crash the operation
 */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
	return schema.parse(data);
}

/**
 * Check if a value is finite (not NaN or Infinity)
 */
export function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

/**
 * Sanitize vector to ensure finite values
 */
export function sanitizeVector3(vec: {
	x: number;
	y: number;
	z: number;
}): { x: number; y: number; z: number } {
	return {
		x: isFiniteNumber(vec.x) ? vec.x : 0,
		y: isFiniteNumber(vec.y) ? vec.y : 0,
		z: isFiniteNumber(vec.z) ? vec.z : 0,
	};
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
