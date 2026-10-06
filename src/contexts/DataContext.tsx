import {
	createContext,
	useState,
	type ReactNode,
	useContext,
	useEffect,
} from "react";
import {
	type Achievement,
	type Articles,
	type Contributions,
	type Experience,
	type Project,
	type SupportedLang,
	type Translations,
} from "../lib/schemas";
import {
	fetchProject,
	fetchAchievements,
	fetchExperiences,
	fetchTranslations,
} from "../lib/sheets";
import { fetchArticles } from "../lib/medium";
import { fetchContributions } from "../lib/github";

// Module-level cache: survives DataProvider remounts (e.g. landing page navigation)
// Key: currentLang, Value: timestamp of last successful fetch
const swrCache = new Map<string, number>();
const SWR_TTL = 5 * 60 * 1000; // 5 minutes

export interface Data {
	supportedLangs: SupportedLang[];
	projects: Project[];
	achievements: Achievement[];
	translations: Translations;
	contributions: Contributions;
	articles: Articles;
	experiences?: Experience[];
	currentLang: string;
}

const DataContext = createContext<Data | null>(null);

export function DataProvider({
	children,
	initialData,
}: {
	children: ReactNode;
	initialData: Data;
}) {
	const [data, setData] = useState<Data>(initialData);

	// Sync when Astro View Transitions delivers new initialData (lang change, page nav)
	useEffect(() => {
		if (initialData) {
			setData(initialData);
		}
	}, [initialData]);

	// Stale-while-revalidate: re-fetch fresh data in the background after render
	useEffect(() => {
		const lang = data.currentLang;
		const lastFetch = swrCache.get(lang);
		if (lastFetch && Date.now() - lastFetch < SWR_TTL) return; // Already fresh

		let cancelled = false;

		const langInfo = data.supportedLangs.find((l) => l.code === lang);
		if (!langInfo) return;

		(async () => {
			try {
				const [
					projects,
					achievements,
					contributions,
					articles,
					experiences,
					translations,
				] = await Promise.all([
					fetchProject(),
					fetchAchievements(),
					fetchContributions(),
					fetchArticles(),
					fetchExperiences(),
					fetchTranslations(langInfo.sheetName),
				]);

				if (!cancelled) {
					swrCache.set(lang, Date.now()); // Mark as fetched
					setData((prev) => ({
						...prev,
						projects,
						achievements,
						contributions,
						articles,
						experiences,
						translations,
					}));
				}
			} catch (err) {
				// Keep stale data — never break the UI on refresh failure
				console.warn("[SWR] Background refresh failed:", err);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [data.currentLang]); // Re-fetch when language changes

	return (
		<DataContext.Provider value={data}>{children}</DataContext.Provider>
	);
}

export function useData() {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error("useData must be used within a DataProvider");
	}
	return context;
}
