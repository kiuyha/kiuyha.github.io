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
	type Project,
	type SupportedLang,
	type Translations,
} from "../lib/schemas";

export interface Data {
	supportedLangs: SupportedLang[];
	projects: Project[];
	achievements: Achievement[];
	translations: Translations;
	contributions: Contributions;
	articles: Articles;
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

	useEffect(() => {
        if (initialData) {
            setData(initialData);
        }
    }, [initialData]);

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
