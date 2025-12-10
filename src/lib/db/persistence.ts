import type { SceneState } from "@/stores/scene-store";
import { nanoid } from "nanoid";
import { type Project, getDB } from "./schema";

export class PersistenceService {
	private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
	private lastSaveTimestamp = 0;
	private readonly AUTO_SAVE_INTERVAL = 5000; // 5 seconds

	async saveProject(
		name: string,
		sceneState: SceneState,
		description = "",
	): Promise<string> {
		const db = await getDB();
		const now = Date.now();

		const project: Project = {
			id: nanoid(),
			name,
			description,
			sceneState,
			createdAt: now,
			updatedAt: now,
		};

		await db.put("projects", project);
		console.log("✅ Project saved:", project.id);
		return project.id;
	}

	async updateProject(
		id: string,
		name: string,
		sceneState: SceneState,
		description?: string,
	): Promise<void> {
		const db = await getDB();
		const existing = await db.get("projects", id);

		if (!existing) {
			throw new Error(`Project ${id} not found`);
		}

		const updated: Project = {
			...existing,
			name,
			description: description ?? existing.description,
			sceneState,
			updatedAt: Date.now(),
		};

		await db.put("projects", updated);
		console.log("✅ Project updated:", id);
	}

	async loadProject(id: string): Promise<SceneState | null> {
		const db = await getDB();
		const project = await db.get("projects", id);

		if (!project) {
			console.warn("Project not found:", id);
			return null;
		}

		console.log("✅ Project loaded:", id);
		return project.sceneState;
	}

	async listProjects(): Promise<Project[]> {
		const db = await getDB();
		const projects = await db.getAllFromIndex("projects", "by-updated");
		return projects.reverse(); // Most recent first
	}

	async deleteProject(id: string): Promise<void> {
		const db = await getDB();
		await db.delete("projects", id);
		console.log("✅ Project deleted:", id);
	}

	// Auto-save functionality
	async autoSave(sceneState: SceneState): Promise<void> {
		const now = Date.now();

		// Throttle saves to once per interval
		if (now - this.lastSaveTimestamp < this.AUTO_SAVE_INTERVAL) {
			return;
		}

		const db = await getDB();
		await db.put("autosave", {
			id: "autosave",
			sceneState,
			timestamp: now,
		});

		this.lastSaveTimestamp = now;
		console.log("💾 Auto-saved at", new Date(now).toLocaleTimeString());
	}

	async loadAutoSave(): Promise<SceneState | null> {
		const db = await getDB();
		const autosave = await db.get("autosave", "autosave");

		if (!autosave) {
			console.log("No autosave found");
			return null;
		}

		const age = Date.now() - autosave.timestamp;
		const ageMinutes = Math.floor(age / 60000);

		console.log(`✅ Autosave found (${ageMinutes} minutes old)`);
		return autosave.sceneState;
	}

	startAutoSave(getState: () => SceneState): void {
		if (this.autoSaveTimer) {
			clearInterval(this.autoSaveTimer);
		}

		this.autoSaveTimer = setInterval(() => {
			const state = getState();
			this.autoSave(state).catch((err) => {
				console.error("Auto-save failed:", err);
			});
		}, this.AUTO_SAVE_INTERVAL);

		console.log("✅ Auto-save started (every 5s)");
	}

	stopAutoSave(): void {
		if (this.autoSaveTimer) {
			clearInterval(this.autoSaveTimer);
			this.autoSaveTimer = null;
			console.log("⏸️ Auto-save stopped");
		}
	}
}

// Singleton instance
export const persistenceService = new PersistenceService();
