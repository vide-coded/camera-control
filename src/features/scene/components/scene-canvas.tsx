import { useStore } from "@tanstack/react-store";
/// <reference types="three" />
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { type SceneObject, sceneStore } from "@/stores/scene-store";

const objectColor = (object: SceneObject, isSelected: boolean) => {
	const base = new THREE.Color(object.color);
	if (!isSelected) return base;

	const selected = base.clone().multiplyScalar(1.1);
	return selected;
};

const createMeshForObject = (object: SceneObject) => {
	const material = new THREE.MeshStandardMaterial({
		color: object.color,
		roughness: 0.35,
		metalness: 0.12,
	});

	let geometry: THREE.BufferGeometry;

	if (object.type === "sphere") {
		geometry = new THREE.SphereGeometry(0.8, 32, 32);
	} else if (object.type === "cone") {
		geometry = new THREE.ConeGeometry(0.9, 1.3, 28);
	} else {
		geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
	}

	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	return mesh;
};

export function SceneCanvas() {
	const mountRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const frameRef = useRef<number | null>(null);
	const isAnimatingRef = useRef<boolean>(true);
	const selectedIdRef = useRef<string | null>(null);
	const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
	const lastRenderTimeRef = useRef<number>(0);
	const fpsCounterRef = useRef<{ frames: number; lastCheck: number }>({
		frames: 0,
		lastCheck: Date.now(),
	});

	const { objects, selectedId, isAnimating } = useStore(
		sceneStore,
		(state) => ({
			objects: state.objects,
			selectedId: state.selectedId,
			isAnimating: state.isAnimating,
		}),
	);

	useEffect(() => {
		isAnimatingRef.current = isAnimating;
	}, [isAnimating]);

	useEffect(() => {
		selectedIdRef.current = selectedId ?? null;
	}, [selectedId]);

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color("#f8fafc");
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
		camera.position.set(3, 3, 5);
		camera.lookAt(0, 0, 0);
		cameraRef.current = camera;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		rendererRef.current = renderer;
		mount.appendChild(renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.15);
		directionalLight.position.set(3, 4, 5);
		directionalLight.castShadow = true;
		directionalLight.shadow.bias = -0.0005;
		scene.add(directionalLight);

		const floorGeometry = new THREE.PlaneGeometry(20, 20);
		const floorMaterial = new THREE.MeshStandardMaterial({
			color: "#e2e8f0",
			roughness: 1,
			metalness: 0,
		});
		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -1.2;
		floor.receiveShadow = true;
		scene.add(floor);

		const handleResize = () => {
			const { width, height } = mount.getBoundingClientRect();
			if (!width || !height) return;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};

		const animate = () => {
			const now = performance.now();
			const delta = now - lastRenderTimeRef.current;

			// Target 60 FPS max (~16.67ms per frame)
			if (delta < 16) {
				frameRef.current = requestAnimationFrame(animate);
				return;
			}
			lastRenderTimeRef.current = now;

			// FPS monitoring (dev only)
			if (import.meta.env.DEV) {
				fpsCounterRef.current.frames++;
				const timeSinceCheck = now - fpsCounterRef.current.lastCheck;
				if (timeSinceCheck >= 1000) {
					const fps = Math.round(
						(fpsCounterRef.current.frames * 1000) / timeSinceCheck,
					);
					if (fps < 30) console.warn(`[Scene] Low FPS: ${fps}`);
					fpsCounterRef.current.frames = 0;
					fpsCounterRef.current.lastCheck = now;
				}
			}

			const currentSelectedId = selectedIdRef.current;
			const selectedMesh = currentSelectedId
				? meshMapRef.current.get(currentSelectedId)
				: null;
			if (selectedMesh && isAnimatingRef.current) {
				selectedMesh.rotation.y += 0.01;
				selectedMesh.rotation.x += 0.005;
			}

			renderer.render(scene, camera);
			frameRef.current = requestAnimationFrame(animate);
		};

		handleResize();
		frameRef.current = requestAnimationFrame(animate);
		window.addEventListener("resize", handleResize);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
			window.removeEventListener("resize", handleResize);

			for (const mesh of meshMapRef.current.values()) {
				mesh.geometry.dispose();
				if (Array.isArray(mesh.material)) {
					for (const mat of mesh.material) {
						mat.dispose();
					}
				} else {
					mesh.material.dispose();
				}
				scene.remove(mesh);
			}
			meshMapRef.current.clear();

			floorGeometry.dispose();
			floorMaterial.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode) {
				renderer.domElement.parentNode.removeChild(renderer.domElement);
			}
		};
	}, []);

	useEffect(() => {
		const renderer = rendererRef.current;
		const scene = sceneRef.current;
		const camera = cameraRef.current;
		if (!renderer || !scene || !camera) return;

		const desiredIds = new Set(objects.map((object) => object.id));

		for (const object of objects) {
			let mesh = meshMapRef.current.get(object.id);
			if (!mesh) {
				mesh = createMeshForObject(object);
				meshMapRef.current.set(object.id, mesh);
				scene.add(mesh);
			}

			mesh.position.set(
				object.position.x,
				object.position.y,
				object.position.z,
			);
			mesh.rotation.set(
				object.rotation.x,
				object.rotation.y,
				object.rotation.z,
			);
			mesh.scale.setScalar(object.scale);

			const material = mesh.material as THREE.MeshStandardMaterial;
			material.color = objectColor(object, object.id === selectedId);
			material.emissive = new THREE.Color(
				object.id === selectedId ? "#60a5fa" : "#0f172a",
			);
			material.emissiveIntensity = object.id === selectedId ? 0.25 : 0.05;
		}

		for (const [id, mesh] of meshMapRef.current.entries()) {
			if (desiredIds.has(id)) continue;
			scene.remove(mesh);
			mesh.geometry.dispose();
			if (Array.isArray(mesh.material)) {
				for (const mat of mesh.material) {
					mat.dispose();
				}
			} else {
				mesh.material.dispose();
			}
			meshMapRef.current.delete(id);
		}

		renderer.render(scene, camera);
	}, [objects, selectedId]);

	const selectedObject = objects.find((obj) => obj.id === selectedId);
	const ariaLabel = selectedObject
		? `3D scene canvas. Currently controlling ${selectedObject.type} at position ${selectedObject.position.x.toFixed(1)}, ${selectedObject.position.y.toFixed(1)}, ${selectedObject.position.z.toFixed(1)}. Use keyboard shortcuts to manipulate.`
		: "3D scene canvas. No object selected.";

	return (
		<div
			ref={mountRef}
			className="h-[520px] w-full rounded-lg border border-border bg-card shadow-sm"
			role="img"
			aria-label={ariaLabel}
			tabIndex={0}
		/>
	);
}
