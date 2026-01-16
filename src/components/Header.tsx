import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, Languages, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useData } from "../contexts/DataContext";

export default function Header() {
	return (
		<header className="w-full fixed z-100 bg-white dark:bg-zinc-800 shadow-2xl flex items-center px-8 py-4 justify-between border-b-2 border-zinc-900 dark:border-zinc-600">
			<h1 className="font-bold text-2xl">
				{import.meta.env.VITE_NICKNAME || "Kiuyha"}
			</h1>
			<div className="flex items-center gap-4">
				<LanguageSwitcher />
				<ThemeSwitcher />
			</div>
		</header>
	);
}

function LanguageSwitcher() {
	const { supportedLangs, currentLang } = useData();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const currentPath =
		typeof window !== "undefined" && window.location.pathname;

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [dropdownRef]);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				aria-label="Open language selection menu"
				aria-haspopup="true"
				aria-expanded={isOpen}
				className="cursor-pointer flex items-center justify-center p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				onClick={() => setIsOpen((prev) => !prev)}
			>
				<Languages size={20} />
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -10 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="absolute right-0 top-full mt-2 w-40 rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-zinc-800 dark:ring-gray-300 dark:ring-opacity-10"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="language-menu-button"
					>
						{supportedLangs.map(({ code, name }) => (
							<a
								key={code}
								href={
									currentPath
										? currentPath.replace(
												`/${currentLang}`,
												`/${code}`,
											)
										: `/${code}`
								}
								className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
								role="menuitem"
							>
								<span>{name}</span>
								{currentLang === code && (
									<Check
										size={20}
										className="text-blue-500 dark:text-blue-300"
									/>
								)}
							</a>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function ThemeSwitcher() {
	const { darkMode, setDarkMode } = useTheme();

	return (
		<button
			type="button"
			aria-label="Toggle Dark Mode"
			onClick={() => setDarkMode((prev) => !prev)}
			className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-full flex items-center justify-center"
		>
			<AnimatePresence mode="wait">
				<motion.div
					key={darkMode ? "sun" : "moon"}
					initial={{
						opacity: 0,
						rotate: -90,
					}}
					animate={{
						opacity: 1,
						rotate: 0,
					}}
					exit={{
						opacity: 0,
						rotate: 90,
					}}
					transition={{ duration: 0.3 }}
					className="inline-block"
				>
					{darkMode ? <Sun size={20} /> : <Moon size={20} />}
				</motion.div>
			</AnimatePresence>
		</button>
	);
}
