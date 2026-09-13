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
		},
		plugins: [tailwindcss()],
	},
	prefetch: {
		defaultStrategy: 'viewport',
		prefetchAll: true
	},
	trailingSlash: "never"
});
