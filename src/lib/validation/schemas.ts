import { z } from "zod";

// Vector3 validation
export const Vector3Schema = z.object({
	x: z.number().finite(),
	y: z.number().finite(),
	z: z.number().finite(),
});

// Euler angles validation
export const EulerSchema = z.object({
	x: z.number().finite(),
	y: z.number().finite(),
	z: z.number().finite(),
	order: z.enum(["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"]).default("XYZ"),
});

// Color validation (hex string)
export const ColorSchema = z
	.string()
	.regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format");

// Object type validation
export const ObjectTypeSchema = z.enum(["cube", "sphere", "cone"]);

// Scene object validation
export const SceneObjectSchema = z.object({
	id: z.string().min(1),
	type: ObjectTypeSchema,
	position: Vector3Schema,
	rotation: EulerSchema,
	scale: Vector3Schema.refine(
		(scale) => scale.x > 0 && scale.y > 0 && scale.z > 0,
		{
			message: "Scale values must be positive",
		},
	),
	color: ColorSchema,
});

// Scene state validation
export const SceneStateSchema = z.object({
	objects: z.array(SceneObjectSchema),
	selectedId: z.string().nullable(),
	isAnimating: z.boolean(),
	gestureMode: z.enum(["idle", "translate", "rotate", "scale"]),
	lastGestureAt: z.number().nullable(),
});

// Gesture frame validation
export const GestureFrameSchema = z.object({
	pinch_strength: z.number().min(0).max(1),
	pinch_distance: z.number().nonnegative(),
	hand_center: Vector3Schema,
	hand_rotation: EulerSchema,
	finger_spread: z.number().min(0).max(1),
	confidence: z.number().min(0).max(1),
	timestamp: z.number().positive(),
});

// Project validation (for save/load)
export const ProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Project name is required").max(100),
	description: z.string().max(500).optional(),
	sceneState: SceneStateSchema,
	thumbnail: z.string().optional(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

// Export types
export type Vector3 = z.infer<typeof Vector3Schema>;
export type Euler = z.infer<typeof EulerSchema>;
export type SceneObject = z.infer<typeof SceneObjectSchema>;
export type SceneState = z.infer<typeof SceneStateSchema>;
export type GestureFrame = z.infer<typeof GestureFrameSchema>;
export type Project = z.infer<typeof ProjectSchema>;
