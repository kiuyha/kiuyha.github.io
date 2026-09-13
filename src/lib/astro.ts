import {
    fetchSupportedLangs,
    fetchProject,
    fetchAchievements,
    fetchExperiences,
    fetchTranslations,
} from "./sheets";
import { fetchArticles } from "../lib/medium";
import { fetchContributions } from "../lib/github";
import {
    type Achievement,
    type Articles,
    type Contributions,
    type Experience,
    type Project,
    type SupportedLang,
} from "../lib/schemas";

// Define the shape of the cached data
interface GlobalData {
    projects: Project[];
    achievements: Achievement[];
    contributions: Contributions;
    articles: Articles;
    experiences: Experience[];
}

let globalCache: GlobalData | null = null;
let langsCache: SupportedLang[] | null = null;

async function getGlobalData() {
    if (globalCache) return globalCache;

    const [projects, achievements, contributions, articles, experiences] = await Promise.all(
        [
            fetchProject(),
            fetchAchievements(),
            fetchContributions(),
            fetchArticles(),
            fetchExperiences(),
        ],
    );

    globalCache = { projects, achievements, contributions, articles, experiences };
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