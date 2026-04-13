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
	site: import.meta.env.VITE_WEBSITE_LINK || "https://kiuyha.my.id",
	build: {
		assets: "assets",
		format: "file",
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
