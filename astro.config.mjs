// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	integrations: [
		react(),
		sitemap(),
	],
	site: import.meta.env.PUBLIC_WEBSITE_LINK || "https://kiuyha.dev",
	build: {
		assets: "assets",
		format: "directory",
	},
	vite: {
		build: {
			minify: "terser",
			rollupOptions: {
				output: {
					manualChunks(id) {
						// React core — rarely changes, excellent cache hit rate
						if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/scheduler")) {
							return "vendor-react";
						}
						// framer-motion — large, separate chunk
						if (id.includes("node_modules/framer-motion")) {
							return "vendor-framer";
						}
						// lucide icons — tree-shaken per page but still sizeable
						if (id.includes("node_modules/lucide-react")) {
							return "vendor-lucide";
						}
						// zod + papaparse — server-side utils used in DataContext
						if (id.includes("node_modules/zod") || id.includes("node_modules/papaparse")) {
							return "vendor-data";
						}
					},
				},
			},
		},
		plugins: [tailwindcss()],
	},
	prefetch: {
		defaultStrategy: 'viewport',
		prefetchAll: true
	},
	trailingSlash: "never"
});
