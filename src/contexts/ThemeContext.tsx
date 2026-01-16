import {
	useState,
	useEffect,
	createContext,
	useContext,
	type ReactNode,
} from "react";

const ThemeContext = createContext<{
	darkMode: boolean;
	setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [darkMode, setDarkMode] = useState<boolean>(
		typeof window !== "undefined" &&
			localStorage.getItem("theme") === "dark",
	);

	useEffect(() => {
		const setTheme = () =>
			document.documentElement.classList.toggle("dark", darkMode);

		setTheme();
		localStorage.setItem("theme", darkMode ? "dark" : "light");

		// Re-apply class after navigation
		document.addEventListener("astro:after-swap", setTheme);

		// Listen for System Changes
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onSystemChange = (e: MediaQueryListEvent) =>
			setDarkMode(e.matches);
		media.addEventListener("change", onSystemChange);

		return () => {
			document.removeEventListener("astro:after-swap", setTheme);
			media.removeEventListener("change", onSystemChange);
		};
	}, [darkMode]);

	return (
		<ThemeContext.Provider value={{ darkMode, setDarkMode }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
