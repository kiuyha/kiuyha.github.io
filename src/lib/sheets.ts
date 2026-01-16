import Papa from "papaparse";
import z from "zod";
import {
	AchievementSchema,
	BaseAchievementSchema,
	BaseProjectSchema,
	ProjectSchema,
	SupportedLangSchema,
	type Achievement,
	type Project,
	type SupportedLang,
	type Translations,
} from "./schemas";

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
async function fetchData(sheetName: string): Promise<Record<string, unknown>[]> {
	const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
	const response = await fetch(sheetUrl);
	const csvText = await response.text();

	return new Promise((resolve, reject) => {
		Papa.parse(csvText, {
			header: true,
			complete: (results) => {
				resolve(results.data as Record<string, unknown>[]);
			},
			error: (error: Error) => {
				console.error(`Error fetching sheet "${sheetName}":`, error);
				reject(error);
			},
		});
	});
}

const TranslationFromSourceSchema = z.array(
	z.object({
		group: z.string(),
		key: z.string(),
		value: z.string(),
	}),
);

export async function fetchTranslations(
	sheetName: string,
): Promise<Translations> {
	const data = await fetchData(sheetName);

	const validationResult = TranslationFromSourceSchema.safeParse(data);
	if (!validationResult.success) {
		console.error(
			"Invalid translation data received from source:",
			z.prettifyError(validationResult.error),
		);
		return {};
	}

	return validationResult.data.reduce((acc, item) => {
		const { group, key, value } = item;

		if (!acc[group]) {
			// If the group doesn't exist, create it
			acc[group] = {};
		}

		acc[group][key] = value;
		return acc;
	}, {} as Translations);
}

export async function fetchSupportedLangs(): Promise<SupportedLang[]> {
	const data = await fetchData("supportedLangs");
	const validResult = z.array(SupportedLangSchema).safeParse(data);

	if (!validResult.success) {
		console.error(
			"Invalid supported lang data received from source:",
			z.prettifyError(validResult.error),
		);
		return [];
	}

	return validResult.data;
}

const ParseProjectSchema = z.array(
	BaseProjectSchema.omit({
		tech_stack: true,
		images: true,
	})
		.extend({
			tech_stack: z.string(),
			images: z.string(),
		})
		.catchall(z.string())
		.transform((item) => {
			return {
				...item,
				images: item.images
					? item.images.split(",").map((url) => url.trim())
					: [],
					tech_stack: item.tech_stack
					? item.tech_stack.split(",").map((tech) => tech.trim())
					: [],
			};
		})
		.pipe(ProjectSchema)
);

export async function fetchProject(): Promise<Project[]> {
	const data = await fetchData("Projects");
	const validResult = ParseProjectSchema.safeParse(data);
	if (!validResult.success) {
		console.error(
			"Invalid project data received from source:",
			z.prettifyError(validResult.error),
		);
		return [];
	}
	
	return validResult.data;
}

const ParseAchievementSchema = z.array(
	BaseAchievementSchema.omit({
		skills: true,
		images: true,
	})
		.extend({
			skills: z.string(),
			images: z.string(),
		})
		.transform((item) => {
			return {
				...item,
				images: item.images
					? item.images.split(",").map((url) => url.trim())
					: [],
				skills: item.skills
					? item.skills.split(",").map((skill) => skill.trim())
					: [],
			};
		})
		.pipe(AchievementSchema),
);

export async function fetchAchievements(): Promise<Achievement[]> {
	const data = await fetchData("Achievements");
	const validResult = ParseAchievementSchema.safeParse(data);

	if (!validResult.success) {
		console.error(
			"Invalid achievement data received from source:",
			z.prettifyError(validResult.error),
		);
		return [];
	}

	return validResult.data;
}
