import { AnimatePresence, motion } from "framer-motion";
import { DataProvider, useData, type Data } from "../contexts/DataContext";
import {
	BarChart,
	Book,
	Donut,
	UserCheck,
	Users,
	AlignStartVertical,
	type LucideIcon,
	Star,
	Lock,
	Globe,
	FileCode2,
	GitFork,
	Calendar,
	History,
	GitPullRequestArrow,
	Info,
	BookMarked,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
} from "chart.js";
import ListCards from "../components/ListCards";
import type { Contributions, LanguagesRepo } from "../lib/schemas";

// Register the necessary Chart.js components
ChartJS.register(
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	BarElement,
);

export default function Contributions({ data }: { data: Data }) {
	return (
		<DataProvider initialData={data}>
			<div className="mt-auto grid grid-cols-6 gap-4">
				<ProfileCard />
				<TopLangsCard />
				<StatsCard />
				<Repositories />
			</div>
		</DataProvider>
	);
}

function ProfileStatsCard({
	Icon,
	name,
	value,
}: {
	Icon: LucideIcon;
	name: string;
	value: string | number;
}) {
	return (
		<motion.div
			whileHover={{
				scale: 1.05,
				transition: {
					duration: 0.2,
				},
			}}
			className="px-2 py-1.5 font-semibold flex flex-col items-center gap-2 border-2 dark:border-zinc-600 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			<Icon size={25} />
			<div className="flex flex-col items-center">
				<span className="text-sm capitalize">{name}</span>
				<span className="text-sm text-gray-500 dark:text-gray-400">
					{value}
				</span>
			</div>
		</motion.div>
	);
}

function ProfileCard() {
	const {
		contributions,
		translations: { contributions: translations },
	} = useData();

	return (
		<motion.div
			initial={{ rotateX: -90 }}
			animate={{ rotateX: 0 }}
			exit={{ rotateX: 90 }}
			transition={{ duration: 0.5 }}
			className="col-span-6 lg:col-span-2 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			<div className="relative mb-4">
				<img
					alt="Contributions Banner"
					className="h-40 w-full object-cover"
					src={"/banners/contributions.avif"}
					loading="eager"
					decoding="async"
					fetchPriority="high"
					onError={(e) => {
						e.currentTarget.src = "/banner_profile.avif";
					}}
				/>

				<div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-8 border-white dark:border-zinc-900 rounded-full">
					<img
						loading="eager"
						decoding="async"
						src={
							contributions.profile.avatarUrl ||
							"/profile_picture.avif"
						}
						alt="Profile Picture Contributions"
						width={200}
						height={200}
						className="max-w-40 max-h-40 rounded-full border-3 dark:border-white object-cover"
						fetchPriority="high"
						onError={(e) => {
							e.currentTarget.src = "/profile_picture.avif";
						}}
					/>
				</div>
			</div>

			{/* stats cards */}
			<div className="pt-18 flex flex-col items-center justify-center gap-2">
				<div className="flex flex-col items-center gap-1">
					<span className="font-semibold text-2xl">
						{contributions.profile.name}
					</span>
					<span className="font-semibold text-gray-500 dark:text-gray-400">
						@{contributions.profile.username}
					</span>
				</div>

				<div className="p-4 flex items-center justify-center gap-4">
					<ProfileStatsCard
						Icon={Users}
						name={translations?.["followers"] || "Followers"}
						value={contributions.profile.followers}
					/>
					<ProfileStatsCard
						Icon={UserCheck}
						name={translations?.["following"] || "Following"}
						value={contributions.profile.following}
					/>
					<ProfileStatsCard
						Icon={Book}
						name={translations?.["repositories"] || "Repositories"}
						value={contributions.profile.totalRepos}
					/>
				</div>
			</div>
		</motion.div>
	);
}

type LanguagesWithPercentage = (LanguagesRepo[number] & {
	percentage: number;
})[];

function LanguagesBar({ languages }: { languages: LanguagesWithPercentage }) {
	return (
		<div className="flex h-3 w-full overflow-hidden rounded-full">
			<AnimatePresence>
				{languages.map((lang, index) => (
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${lang.percentage}%` }}
						exit={{ width: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						key={lang.name}
						className="h-full"
						style={{
							width: `${lang.percentage}%`,
							backgroundColor: lang.color,
						}}
						title={`${lang.name}: ${lang.percentage.toFixed(2)}%`}
					/>
				))}
			</AnimatePresence>
		</div>
	);
}

function LanguagesDescription({
	languages,
}: {
	languages: LanguagesWithPercentage;
}) {
	return (
		<div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
			<AnimatePresence>
				{languages.map((lang, index) => (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						key={lang.name}
						className="flex items-center gap-2"
					>
						<span
							className="h-3 w-3 shrink-0 rounded-full"
							style={{ backgroundColor: lang.color }}
						/>
						<div className="flex min-w-0 flex-1 items-center justify-between gap-2">
							<span
								className="truncate font-semibold"
								title={lang.name}
							>
								{lang.name}
							</span>

							<span className="shrink-0 text-zinc-500 dark:text-zinc-400">
								{lang.percentage.toFixed(2)}%
							</span>
						</div>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}

function TopLangsCard() {
	const {
		contributions,
		translations: { contributions: translations },
	} = useData();
	const [chartType, setChartType] = useState("bar");

	const processedLangs = useMemo(() => {
		const totalSize = contributions.topLanguages.reduce(
			(sum, lang) => sum + lang.size,
			0,
		);

		if (totalSize === 0) {
			return [];
		}

		return contributions.topLanguages.map((lang) => ({
			...lang,
			percentage: (lang.size / totalSize) * 100,
		}));
	}, [contributions.topLanguages]);

	const doughnutData = useMemo(
		() => ({
			data: {
				labels: processedLangs.map((lang) => lang.name),
				datasets: [
					{
						data: processedLangs.map((lang) => lang.percentage),
						backgroundColor: processedLangs.map(
							(lang) => lang.color,
						),
						borderColor: "#18181b",
						borderWidth: 1.8,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
				},
			},
		}),
		[processedLangs],
	);

	return (
		<motion.div
			initial={{ rotateX: -90 }}
			animate={{ rotateX: 0 }}
			exit={{ rotateX: 90 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col col-span-6 md:col-span-3 lg:col-span-2 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			{/* Header and Toggle Button */}
			<div className="p-4 flex items-center justify-between border-b-2 dark:border-zinc-600">
				<div className="flex items-center gap-2">
					<img
						src="/animations/codeIcon.avifs"
						alt="code icon"
						width={25}
						height={25}
					/>
					<span className="font-semibold text-xl capitalize">
						{translations?.["top-langs-title"] ||
							"Most used languages"}
					</span>
				</div>
				<button
					className="cursor-pointer"
					onClick={() =>
						setChartType(chartType === "bar" ? "doughnut" : "bar")
					}
				>
					{chartType === "bar" ? (
						<Donut size={25} />
					) : (
						<BarChart size={25} />
					)}
				</button>
			</div>

			<div
				className={`p-8 flex-1 flex flex-col items-center justify-center ${chartType === "bar" ? "gap-10" : "gap-4"} `}
			>
				{chartType === "bar" ? (
					<LanguagesBar languages={processedLangs} />
				) : (
					<div className="h-60 flex items-center">
						<Doughnut
							data={doughnutData.data}
							options={doughnutData.options}
						/>
					</div>
				)}

				<LanguagesDescription languages={processedLangs} />
			</div>
		</motion.div>
	);
}

function GetStat({
	name,
	value,
	Icon,
	className,
}: {
	name: string;
	value: string | number;
	Icon: LucideIcon;
	className?: string;
}) {
	return (
		<div
			className={`flex items-center justify-between font-semibold ${className}`}
		>
			<div className="flex items-center gap-2">
				<Icon
					size={20}
					className="text-yellow-500 dark:text-yellow-400"
				/>
				<span className="font-semibold">{name}</span>
			</div>
			<span>{value}</span>
		</div>
	);
}

function StatsCard() {
	const {
		contributions,
		translations: { contributions: translations },
	} = useData();
	const doughnutData = useMemo(
		() => ({
			data: {
				datasets: [
					{
						data: [
							100 - contributions.stats.rank.percentile,
							contributions.stats.rank.percentile,
						],
						backgroundColor: ["#fe428e", "#fe428e30"],
						borderWidth: 0,
						borderRadius: 50,
						cutout: "80%",
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
				},
			},
		}),
		[contributions.stats.rank.percentile],
	);

	return (
		<motion.div
			initial={{ rotateX: -90 }}
			animate={{ rotateX: 0 }}
			exit={{ rotateX: 90 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col col-span-6 md:col-span-3 lg:col-span-2 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			{/* Header and Toggle Button */}
			<div className="p-4 flex items-center gap-4 border-b-2 dark:border-zinc-600">
				<AlignStartVertical size={25} />
				<span className="font-semibold text-xl capitalize">
					{(translations?.["stats-title"] || ":name Stats").replace(
						":name",
						contributions.profile.name,
					)}
				</span>
			</div>

			<div className="flex-1 px-4 py-8 flex flex-col items-center justify-between">
				<div className="relative h-35 w-35">
					<Doughnut
						data={doughnutData.data}
						options={doughnutData.options}
					/>

					{/* Absolutely center the text inside the container */}
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="text-2xl font-bold">
							{contributions.stats.rank.level}
						</span>
					</div>
				</div>

				<div className="w-full flex flex-col gap-2">
					<GetStat
						Icon={Star}
						name={`${translations?.["stats-stars-earned"] || "Total Stars Earned"}:`}
						value={contributions.stats.totalStars}
					/>
					<GetStat
						Icon={History}
						name={`${(
							translations?.["stats-commits"] ||
							`Total Commits :year`
						).replace(
							":year",
							import.meta.env
								.VITE_CONTRIBUTIONS_INCLUDE_ALL_COMMITS ===
								"true"
								? ""
								: `(${new Date().getFullYear()})`,
						)}:`}
						value={contributions.stats.totalCommits}
					/>
					<GetStat
						Icon={GitPullRequestArrow}
						name={translations?.["stats-prs"] || "Total PRs:"}
						value={contributions.stats.totalPRs}
					/>
					<GetStat
						Icon={Info}
						name={translations?.["stats-issues"] || "Total Issues:"}
						value={contributions.stats.totalIssues}
					/>
					<GetStat
						Icon={BookMarked}
						name={
							translations?.["stats-contributed-to"] ||
							"Contributed to (last year):"
						}
						value={contributions.stats.contributedTo}
					/>
				</div>
			</div>
		</motion.div>
	);
}

function Repositories() {
	const {
		contributions,
		translations: { contributions: translations, sorting },
	} = useData();
	const [language, setLanguage] = useState("");
	const [sort, setSort] = useState("createdAt-desc");
	const languages = useMemo(() => {
		return [
			...new Set(
				contributions.repositories.flatMap((repo) =>
					repo.languages.flatMap((langObj) => langObj.name),
				),
			),
		].sort();
	}, [contributions.repositories]);

	return (
		<ListCards
			title={translations?.["repositories-list"] || "Repositories List"}
			dataSet={contributions.repositories}
			searchConfig={{
				placeholder:
					translations?.["search-placeholder"] || "Search by name",
				fieldSearch: ["name", "description"],
			}}
			filterConfig={{
				canReset: true,
				selectField: [
					{
						name: "languages.*.name",
						label: translations?.["language"] || "Language",
						ariaLabel: "Select a language",
						options: languages.map((lang) => ({
							label: lang,
							value: lang,
						})),
						setValue: setLanguage,
						value: language,
					},
					{
						name: "sort",
						label: sorting?.["sort-by"] || "Sort By",
						ariaLabel: "sort projects by",
						options: [
							{
								label: sorting?.["name-asc"] || "Name (A-Z)",
								value: "name-asc",
								sortingMethod: (a, b) => {
									return a.name.localeCompare(b.name);
								},
							},
							{
								label: sorting?.["name-desc"] || "Name (Z-A)",
								value: "name-desc",
								sortingMethod: (a, b) => {
									return b.name.localeCompare(a.name);
								},
							},
							{
								label: sorting?.["size-desc"] || "Largest size",
								value: "size-desc",
								sortingMethod: (a, b) => {
									return b.sizeInKB - a.sizeInKB;
								},
							},
							{
								label: sorting?.["size-asc"] || "Smallest size",
								value: "size-asc",
								sortingMethod: (a, b) => {
									return a.sizeInKB - b.sizeInKB;
								},
							},
							{
								label: sorting?.["stars-desc"] || "Most stars",
								value: "stars-desc",
								sortingMethod: (a, b) => {
									return b.stars - a.stars;
								},
							},
							{
								label: sorting?.["stars-asc"] || "Least stars",
								value: "stars-asc",
								sortingMethod: (a, b) => {
									return a.stars - b.stars;
								},
							},
							{
								label: sorting?.["forks-desc"] || "Most forks",
								value: "forks-desc",
								sortingMethod: (a, b) => {
									return b.forks - a.forks;
								},
							},
							{
								label: sorting?.["forks-asc"] || "Least forks",
								value: "forks-asc",
								sortingMethod: (a, b) => {
									return a.forks - b.forks;
								},
							},
							{
								label:
									sorting?.["createdAt-desc"] ||
									"Newest (Created)",
								value: "createdAt-desc",
								sortingMethod: (a, b) => {
									return (
										new Date(b.createdAt).getTime() -
										new Date(a.createdAt).getTime()
									);
								},
							},
							{
								label:
									sorting?.["createdAt-asc"] ||
									"Oldest (Created)",
								value: "createdAt-asc",
								sortingMethod: (a, b) => {
									return (
										new Date(a.createdAt).getTime() -
										new Date(b.createdAt).getTime()
									);
								},
							},
							{
								label:
									sorting?.["updatedAt-desc"] ||
									"Newest (Updated)",
								value: "updatedAt-desc",
								sortingMethod: (a, b) => {
									return (
										new Date(b.updatedAt).getTime() -
										new Date(a.updatedAt).getTime()
									);
								},
							},
							{
								label:
									sorting?.["updatedAt-asc"] ||
									"Oldest (Updated)",
								value: "updatedAt-asc",
								sortingMethod: (a, b) => {
									return (
										new Date(a.updatedAt).getTime() -
										new Date(b.updatedAt).getTime()
									);
								},
							},
						],
						setValue: setSort,
						value: sort,
					},
				],
			}}
			CustomCard={(data, index, search) => (
				<RepoCard data={data} index={index} search={search} />
			)}
		/>
	);
}

interface RepoCardProps<T extends Contributions["repositories"][number]> {
	data: T;
	index: number;
	search: string;
}

function RepoCard<T extends Contributions["repositories"][number]>({
	data,
	index,
	search,
}: RepoCardProps<T>) {
	const {
		translations: { contributions: translations },
	} = useData();
	const [showFullDescription, setShowFullDescription] = useState(false);
	const Highlight = ({ text }: { text: string }) => {
		if (!search.trim()) {
			return <span>{text}</span>;
		}
		const regex = new RegExp(`(${search})`, "gi");
		const parts = text.split(regex);

		return (
			<span>
				{parts.map((part, i) =>
					regex.test(part) ? (
						<mark key={i} className="bg-yellow-500">
							{part}
						</mark>
					) : (
						<span key={i}>{part}</span>
					),
				)}
			</span>
		);
	};

	const formatSize = (sizeInKB: number) => {
		if (sizeInKB >= 1024 * 1024) {
			return `${(sizeInKB / 1024 / 1024).toFixed(2)} GB`;
		} else if (sizeInKB >= 1024) {
			return `${(sizeInKB / 1024).toFixed(2)} MB`;
		}
		return `${sizeInKB} KB`;
	};

	const processedLangs = useMemo(() => {
		const totalSize = data.languages.reduce(
			(sum, lang) => sum + lang.size,
			0,
		);

		if (totalSize === 0) {
			return [];
		}

		return data.languages.map((lang) => ({
			...lang,
			percentage: (lang.size / totalSize) * 100,
		}));
	}, [data.languages]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2, delay: index * 0.08 }}
			className="p-4 flex flex-col gap-4 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			<div className="pb-4 border-b-2 dark:border-zinc-600 flex flex-col gap-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<Book size={25} className="shrink-0" />
						{data.isPrivate ? (
							<span className="font-semibold uppercase">
								<Highlight text={data.name} />
							</span>
						) : (
							<a
								href={data.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between hover:underline"
							>
								<span className="font-semibold uppercase">
									<Highlight text={data.name} />
								</span>
							</a>
						)}
					</div>

					<div
						className="shrink-0"
						title={data.isPrivate ? "Private" : "Public"}
					>
						{data.isPrivate ? (
							<Lock size={20} />
						) : (
							<Globe size={20} />
						)}
					</div>
				</div>

				<p
					onClick={() => setShowFullDescription(!showFullDescription)}
					title={
						!showFullDescription && data.description
							? data.description
							: ""
					}
					role="button"
					tabIndex={0}
					className={`cursor-pointer text-sm text-gray-500 dark:text-gray-400 ${showFullDescription ? "" : "truncate"}`}
				>
					{data.description ||
						translations?.["repo-no-desc"] ||
						"No description provided"}
				</p>

				<div className="flex items-center gap-2">
					<FileCode2 size={20} />
					<span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
						{formatSize(data.sizeInKB)}
					</span>
				</div>

				<div className="flex items-center gap-4">
					<GetStat
						name={`${translations?.["repo-stars"] || "Stars"}:`}
						value={data.stars}
						Icon={Star}
						className="gap-4"
					/>
					<GetStat
						name={`${translations?.["repo-forks"] || "Forks"}:`}
						value={data.forks}
						Icon={GitFork}
						className="gap-4"
					/>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Calendar size={20} />
					<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
						{new Date(data.createdAt).toLocaleString("en-US", {
							dateStyle: "medium",
							timeStyle: "short",
						})}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Calendar size={20} />
					<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
						{new Date(data.updatedAt).toLocaleString("en-US", {
							dateStyle: "medium",
							timeStyle: "short",
						})}
					</span>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				<LanguagesBar languages={processedLangs} />
				<LanguagesDescription languages={processedLangs} />
			</div>
		</motion.div>
	);
}
