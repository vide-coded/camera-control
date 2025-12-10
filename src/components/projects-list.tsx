import type { Project } from "@/lib/db/schema";
import { sceneActions } from "@/stores/scene-store";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function ProjectsList() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (isOpen) {
			loadProjects();
		}
	}, [isOpen]);

	const loadProjects = async () => {
		setIsLoading(true);
		try {
			const projectList = await sceneActions.listProjects();
			setProjects(projectList);
		} catch (err) {
			console.error("Failed to load projects:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLoad = async (id: string) => {
		try {
			await sceneActions.loadProject(id);
			alert("Project loaded successfully!");
			setIsOpen(false);
		} catch (err) {
			console.error("Failed to load project:", err);
			alert("Failed to load project");
		}
	};

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Delete project "${name}"?`)) return;

		try {
			await sceneActions.deleteProject(id);
			await loadProjects(); // Refresh list
		} catch (err) {
			console.error("Failed to delete project:", err);
			alert("Failed to delete project");
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	if (!isOpen) {
		return (
			<Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
				Load Project
			</Button>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="max-h-[600px] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-lg">
				<div className="flex items-center justify-between border-b border-border p-4">
					<h2 className="text-lg font-semibold">Load Project</h2>
					<Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
						Close
					</Button>
				</div>

				<div className="max-h-[480px] overflow-y-auto p-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					) : projects.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground">
							<p>No saved projects yet.</p>
							<p className="mt-2 text-sm">
								Save your first project to see it here.
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{projects.map((project) => (
								<div
									key={project.id}
									className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
								>
									<div className="flex-1">
										<h3 className="font-semibold">{project.name}</h3>
										{project.description && (
											<p className="mt-1 text-sm text-muted-foreground">
												{project.description}
											</p>
										)}
										<div className="mt-2 flex gap-4 text-xs text-muted-foreground">
											<span>Created: {formatDate(project.createdAt)}</span>
											<span>Updated: {formatDate(project.updatedAt)}</span>
											<span>Objects: {project.sceneState.objects.length}</span>
										</div>
									</div>

									<div className="flex gap-2">
										<Button onClick={() => handleLoad(project.id)} size="sm">
											Load
										</Button>
										<Button
											onClick={() => handleDelete(project.id, project.name)}
											variant="outline"
											size="sm"
											className="text-destructive hover:bg-destructive/10"
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
