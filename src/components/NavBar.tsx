import { motion, type Variants } from "framer-motion";
import {
	Home,
	User,
	Layers,
	FileBadge,
	GitBranch,
	BookOpen,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useEffect, useRef, useState } from "react";

export default function NavBar() {
	const {
		currentLang,
		translations: { navbar: translations },
	} = useData();
	const [basePath, setBasePath] = useState("");

	useEffect(() => {
		const updateBasePath = () =>
			setBasePath(window.location.pathname.split("/")?.[2] || "");

		updateBasePath();
		document.addEventListener("astro:page-load", updateBasePath);

		return () => {
			document.removeEventListener("astro:page-load", updateBasePath);
		};
	}, []);

	return (
		<motion.nav
			className="z-100 fixed w-full md:w-auto px-6 py-3 bottom-0 md:bottom-10 md:rounded-xl left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 shadow-2xl md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
			border-t-2 md:border-l-2 border-zinc-900 dark:border-zinc-600"
		>
			<div className="hidden md:block">
				<DekstopNavBar
					currentLang={currentLang}
					basePath={basePath}
					translations={translations}
				/>
			</div>
			<div className="block md:hidden">
				<MobileNavBar
					currentLang={currentLang}
					basePath={basePath}
					translations={translations}
				/>
			</div>
		</motion.nav>
	);
}

const getMenus = (translations: Record<string, string>) => [
	{
		name: translations?.["home"] || "Home",
		path: "",
		Icon: Home,
	},
	{
		name: translations?.["profile"] || "Profile",
		path: "profile",
		Icon: User,
	},
	{
		name: translations?.["projects"] || "Projects",
		path: "projects",
		Icon: Layers,
	},
	{
		name: translations?.["achievements"] || "Achievements",
		path: "achievements",
		Icon: FileBadge,
	},
	{
		name: translations?.["contributions"] || "Contributions",
		path: "contributions",
		Icon: GitBranch,
	},
	{
		name: translations?.["articles"] || "Articles",
		path: "articles",
		Icon: BookOpen,
	},
];

export const parentVariants: Variants = {
	hidden: {
		scale: 1,
		y: 0,
		transition: { duration: 0.2 },
	},
	visible: {
		scale: 1.2,
		y: -10,
		transition: { duration: 0.2 },
	},
};

export const tooltipVariants: Variants = {
	hidden: {
		opacity: 0,
		y: -10,
		transition: { duration: 0.2 },
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.2 },
	},
};

function DekstopNavBar({
	currentLang,
	basePath,
	translations,
}: {
	currentLang: string;
	basePath: string;
	translations: Record<string, string>;
}) {
	return (
		<ul className="flex gap-6 lg:gap-8 items-center justify-center">
			{getMenus(translations).map(({ name, path, Icon }) => (
				<motion.li
					key={name}
					initial="hidden"
					whileHover="visible"
					variants={parentVariants}
					className="relative"
				>
					<motion.div
						variants={tooltipVariants}
						className="px-1.5 py-1 absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 rounded-md border-2 border-zinc-900 dark:border-zinc-300 pointer-events-none
                            after:content-[''] after:absolute after:-bottom-1/2 after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-zinc-900 dark:after:border-t-zinc-300"
					>
						<span className="text-sm font-bold text-nowrap">
							{name}
						</span>
					</motion.div>

					<a
						aria-label={name}
						href={`/${currentLang}${path ? `/${path}` : ""}`}
						className={`md:px-2 md:py-2.5 rounded flex flex-col items-center transition-all duration-300
                                ${
									basePath === path
										? "bg-black dark:bg-white text-white dark:text-black"
										: "border-black dark:border-white hover:bg-zinc-800 dark:hover:bg-zinc-300 hover:text-white dark:hover:text-black"
								}
                                `}
					>
						<Icon size={30} />
					</a>
				</motion.li>
			))}
		</ul>
	);
}

function MobileNavBar({
	currentLang,
	basePath,
	translations,
}: {
	currentLang: string;
	basePath: string;
	translations: Record<string, string>;
}) {
	const menusRef = useRef<Record<string, HTMLAnchorElement | null>>({});
	const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

	useEffect(() => {
		const updateUnderline = () => {
			const activeMenuNode = menusRef.current[basePath];
			if (activeMenuNode) {
				setUnderlineStyle({
					left: activeMenuNode.offsetLeft + 4,
					width: activeMenuNode.offsetWidth - 8,
				});
			}
		};

		updateUnderline();
		const timer = setTimeout(updateUnderline, 50);
		window.addEventListener("resize", updateUnderline);
		document.addEventListener("astro:page-load", updateUnderline);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("resize", updateUnderline);
			document.removeEventListener("astro:page-load", updateUnderline);
		};
	}, [basePath]);

	return (
		<div className="relative">
			{/* Option B: Active-Only Label on mobile */}
			<ul className="flex items-center justify-between mb-1 gap-1">
				{getMenus(translations).map(({ name, path, Icon }) => {
					const isActive = basePath === path;
					return (
						<li key={name} className="flex-1 flex justify-center min-w-0">
							<a
								ref={(el) => {
									menusRef.current[path] = el;
								}}
								aria-label={name}
								href={`/${currentLang}${path ? `/${path}` : ""}`}
								className={`flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 ${
									isActive
										? "text-zinc-900 dark:text-zinc-100 font-bold"
										: "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
								}`}
							>
								<Icon size={isActive ? 24 : 22} />
								{isActive && (
									<motion.span
										initial={{ opacity: 0, y: 2 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.15 }}
										className="text-[10px] font-bold tracking-tight text-center whitespace-nowrap mt-0.5"
									>
										{name}
									</motion.span>
								)}
							</a>
						</li>
					);
				})}
			</ul>
			{/* Tab Indicator for active item */}
			{underlineStyle.width > 0 && (
				<div
					className="absolute -bottom-1 h-[0.25rem] bg-zinc-900 dark:bg-white transition-all duration-300 rounded-full"
					style={underlineStyle}
				/>
			)}
		</div>
	);
}
