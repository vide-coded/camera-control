import path from "node:path";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
	plugins: [
		react(),
		// Bundle analyzer - run with ANALYZE=true npm run build
		process.env.ANALYZE === "true" &&
			visualizer({
				open: true,
				gzipSize: true,
				brotliSize: true,
				filename: "dist/stats.html",
			}),
		// Gzip compression
		viteCompression({
			algorithm: "gzip",
			ext: ".gz",
		}),
		// Brotli compression (better than gzip)
		viteCompression({
			algorithm: "brotliCompress",
			ext: ".br",
		}),
	].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		// Target modern browsers for smaller bundle
		target: "es2020",

		// Enable minification
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Remove console.logs in production
				drop_debugger: true,
				pure_funcs: ["console.log", "console.info"],
			},
		},

		// Chunk splitting strategy
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor chunks
					"vendor-react": ["react", "react-dom"],
					"vendor-tanstack": [
						"@tanstack/react-router",
						"@tanstack/react-store",
						"@tanstack/router-devtools",
						"@tanstack/react-query",
						"@tanstack/react-query-devtools",
					],

					// Large libraries as separate chunks (lazy loaded)
					"vendor-three": ["three"],
					"vendor-mediapipe": ["@mediapipe/tasks-vision"],

					// UI components
					ui: [
						"@radix-ui/react-slot",
						"class-variance-authority",
						"clsx",
						"tailwind-merge",
						"lucide-react",
					],
				},

				// Optimize chunk file names
				chunkFileNames: "assets/[name]-[hash].js",
				entryFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash].[ext]",
			},
		},

		// Increase chunk size warning limit (we're handling it manually)
		chunkSizeWarningLimit: 600,
	},

	// Optimize dependencies
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"@tanstack/react-router",
			"@tanstack/react-store",
		],
		exclude: [
			"@mediapipe/tasks-vision", // Don't pre-bundle, lazy load
		],
	},
});
