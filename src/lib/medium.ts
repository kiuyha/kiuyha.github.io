import z from "zod";
import { ArticlesSchema, defaultArticles, type Articles } from "./schemas";

async function fetchMediumArticles(): Promise<unknown> {
	const username =
		import.meta.env.VITE_GITHUB_LINK.split("@")?.[1] || "kiuyha";
	const response = await fetch(
		`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${username}`,
	);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response.json();
}

export async function fetchArticles(): Promise<Articles> {
	const data = await fetchMediumArticles();
	const validResult = ArticlesSchema.safeParse(data);
	if (!validResult.success) {
		console.error(
			"Invalid contribution data received from source:",
			z.prettifyError(validResult.error),
		);
		return defaultArticles;
	}

	return {
		...validResult.data,
		items: validResult.data.items.map((item) => ({
			...item,
			
		})),
	};
}