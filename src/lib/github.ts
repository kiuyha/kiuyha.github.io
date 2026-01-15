import z from "zod";
import {
	ContributionsSchema,
	defaultContributions,
	type Contributions,
} from "./schemas";

async function fetchGithubContributions(): Promise<unknown> {
	const username = import.meta.env.VITE_GITHUB_LINK.split("/")?.[3] || "kiuyha";
	const baseHost = import.meta.env.VITE_GITHUB_API_LINK || "https://github-stats.kiuyha.my.id";
	const basePath = `/api/portfolio-data`;
	const queryParams = new URLSearchParams({
		username: username,
		langs_count: import.meta.env.VITE_CONTRIBUTIONS_LANGS_COUNT || "10",
		include_all_commits:
			import.meta.env.VITE_CONTRIBUTIONS_INCLUDE_ALL_COMMITS || "false",
	});

	const response = await fetch(`${baseHost}${basePath}?${queryParams.toString()}`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response.json();
}

export async function fetchContributions(): Promise<Contributions> {
	const data = await fetchGithubContributions();
	const validResult = ContributionsSchema.safeParse(data);
	if (!validResult.success) {
		console.error(
			"Invalid contribution data received from source:",
			z.prettifyError(validResult.error),
		);
		return defaultContributions;
	}

	return validResult.data;
}
