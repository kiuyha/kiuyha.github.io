// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	integrations: [react()],
	build: {
		assets: "assets",
	},
	vite: {
		// RESTORE YOUR CUSTOM VITE CONFIG HERE
		build: {
			minify: "terser",
		},
		plugins: [tailwindcss()],
	},
    prefetch: {
        defaultStrategy: 'viewport',
        prefetchAll: true
    }
});
