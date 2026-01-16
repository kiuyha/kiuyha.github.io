import {
    fetchSupportedLangs,
    fetchProject,
    fetchAchievements,
    fetchTranslations,
} from "./sheets";
import { fetchArticles } from "../lib/medium";
import { fetchContributions } from "../lib/github";
import {
    type Achievement,
    type Articles,
    type Contributions,
    type Project,
    type SupportedLang,
} from "../lib/schemas";

// Define the shape of the cached data
interface GlobalData {
    projects: Project[];
    achievements: Achievement[];
    contributions: Contributions;
    articles: Articles;
}

let globalCache: GlobalData | null = null;
let langsCache: SupportedLang[] | null = null;

async function getGlobalData() {
    if (globalCache) return globalCache;

    const [projects, achievements, contributions, articles] = await Promise.all(
        [
            fetchProject(),
            fetchAchievements(),
            fetchContributions(),
            fetchArticles(),
        ],
    );

    globalCache = { projects, achievements, contributions, articles };
    return globalCache;
}

export async function getSharedStaticPaths() {
    if (!langsCache) {
        langsCache = await fetchSupportedLangs();
    }

    // Transform the raw language list into Astro's required format
    return langsCache.map((lang) => ({
        params: { lang: lang.code },
        props: { langInfo: lang },
    }));
}

export async function getPageData(langCode: string, langInfo: SupportedLang) {
    const globals = await getGlobalData();
    const translations = await fetchTranslations(langInfo.sheetName);

    return {
        supportedLangs: langsCache || [langInfo],
        ...globals,
        translations,
        currentLang: langCode,
    };
}