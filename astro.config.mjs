import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function getGitLastMod(filePaths) {
	try {
		const existing = filePaths.filter((p) => fs.existsSync(p));
		if (existing.length === 0) return null;
		const dateStr = execSync(
			`git log -1 --format=%cI -- ${existing.map((p) => `"${p}"`).join(" ")}`,
			{ encoding: "utf8" }
		).trim();
		return dateStr ? new Date(dateStr) : null;
	} catch {
		return null;
	}
}

const SECTION_CONFIG = {
	profile: {
		priority: 0.9,
		changefreq: "monthly",
		files: ["src/pages/[lang]/profile.astro", "src/views/Profile.tsx"],
	},
	projects: {
		priority: 0.8,
		changefreq: "weekly",
		files: ["src/pages/[lang]/projects.astro", "src/views/Projects.tsx"],
	},
	articles: {
		priority: 0.8,
		changefreq: "weekly",
		files: [
			"src/pages/[lang]/articles.astro",
			"src/views/Articles.tsx",
			"src/components/ArticleReaderModal.tsx",
		],
	},
	achievements: {
		priority: 0.7,
		changefreq: "monthly",
		files: [
			"src/pages/[lang]/achievements.astro",
			"src/views/Achievements.tsx",
		],
	},
	contributions: {
		priority: 0.7,
		changefreq: "monthly",
		files: [
			"src/pages/[lang]/contributions.astro",
			"src/views/Contributions.tsx",
		],
	},
};

const sitemapSinglePlugin = () => ({
	name: "sitemap-single-file",
	hooks: {
		"astro:build:done": async ({ dir, logger }) => {
			const distDir = fileURLToPath(dir);
			const chunk0 = path.join(distDir, "sitemap-0.xml");
			const targetSitemap = path.join(distDir, "sitemap.xml");
			const sitemapIndex = path.join(distDir, "sitemap-index.xml");

			if (fs.existsSync(chunk0)) {
				fs.copyFileSync(chunk0, targetSitemap);
				fs.unlinkSync(chunk0);
			}

			if (fs.existsSync(sitemapIndex)) {
				fs.unlinkSync(sitemapIndex);
			}

			logger.info("`sitemap.xml` generated successfully as a single file.");
		},
	},
});

export default defineConfig({
	integrations: [
		react(),
		sitemap({
			serialize(item) {
				const url = new URL(item.url);
				const segments = url.pathname
					.replace(/\/+$/, "")
					.replace(/^\/+/, "")
					.split("/")
					.filter(Boolean);

				let section = "";
				if (segments.length === 0) {
					section = "root";
				} else if (segments.length === 1) {
					if (["en", "id"].includes(segments[0])) {
						section = "home";
					} else {
						section = segments[0];
					}
				} else {
					section = segments[1];
				}

				let priority = 0.5;
				let changefreq = "monthly";
				let files = [];

				if (section === "root") {
					priority = 1.0;
					changefreq = "weekly";
					files = ["src/pages/index.astro", "src/views/LandingPage.tsx"];
				} else if (section === "home") {
					priority = 0.9;
					changefreq = "weekly";
					files = ["src/pages/[lang]/index.astro", "src/views/LandingPage.tsx"];
				} else if (SECTION_CONFIG[section]) {
					priority = SECTION_CONFIG[section].priority;
					changefreq = SECTION_CONFIG[section].changefreq;
					files = SECTION_CONFIG[section].files;
				}

				const gitMod = getGitLastMod(files) || getGitLastMod(["src/"]);
				if (gitMod) {
					item.lastmod = gitMod;
				}
				item.priority = priority;
				item.changefreq = changefreq;

				return item;
			},
		}),
		sitemapSinglePlugin(),
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
						// React core - rarely changes, excellent cache hit rate
						if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/scheduler")) {
							return "vendor-react";
						}
						// framer-motion - large, separate chunk
						if (id.includes("node_modules/framer-motion")) {
							return "vendor-framer";
						}
						// lucide icons - tree-shaken per page but still sizeable
						if (id.includes("node_modules/lucide-react")) {
							return "vendor-lucide";
						}
						// zod + papaparse - server-side utils used in DataContext
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
	trailingSlash: "always"
});