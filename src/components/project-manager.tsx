import { persistenceService } from "@/lib/db/persistence";
import { sceneStore } from "@/stores/scene-store";
import { useState } from "react";
import { Button } from "./ui/button";

export function ProjectManager() {
	const [projectName, setProjectName] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!projectName.trim()) {
			alert("Please enter a project name");
			return;
		}

		setIsSaving(true);
		try {
			const id = await persistenceService.saveProject(
				projectName,
				sceneStore.state,
				"Saved from camera control app",
			);
			alert(`Project saved: ${id}`);
			setProjectName("");
		} catch (err) {
			console.error("Save failed:", err);
			alert("Failed to save project");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<input
				type="text"
				value={projectName}
				onChange={(e) => setProjectName(e.target.value)}
				placeholder="Project name"
				className="rounded border border-border bg-background px-3 py-2 text-sm"
			/>
			<Button onClick={handleSave} disabled={isSaving} size="sm">
				{isSaving ? "Saving..." : "Save Project"}
			</Button>
		</div>
	);
}
