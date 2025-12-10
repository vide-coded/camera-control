import type { SceneState } from "@/stores/scene-store";
import { type DBSchema, type IDBPDatabase, openDB } from "idb";

export interface Project {
	id: string;
	name: string;
	description: string;
	sceneState: SceneState;
	thumbnail?: string; // Base64 image
	createdAt: number;
	updatedAt: number;
}

export interface AutoSave {
	id: "autosave";
	sceneState: SceneState;
	timestamp: number;
}

export interface AppDB extends DBSchema {
	projects: {
		key: string;
		value: Project;
		indexes: {
			"by-updated": number;
			"by-created": number;
		};
	};
	autosave: {
		key: "autosave";
		value: AutoSave;
	};
	settings: {
		key: string;
		value: unknown;
	};
}

const DB_NAME = "construction-app";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<AppDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AppDB>> {
	if (dbInstance) return dbInstance;

	dbInstance = await openDB<AppDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Create projects store
			if (!db.objectStoreNames.contains("projects")) {
				const projectStore = db.createObjectStore("projects", {
					keyPath: "id",
				});
				projectStore.createIndex("by-updated", "updatedAt");
				projectStore.createIndex("by-created", "createdAt");
			}

			// Create autosave store
			if (!db.objectStoreNames.contains("autosave")) {
				db.createObjectStore("autosave", { keyPath: "id" });
			}

			// Create settings store
			if (!db.objectStoreNames.contains("settings")) {
				db.createObjectStore("settings");
			}
		},
	});

	return dbInstance;
}

export async function closeDB() {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
	}
}
