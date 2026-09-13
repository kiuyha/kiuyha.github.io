import { lazy, Suspense, useMemo, useState } from "react";
import ListCards from "../components/ListCards";
import { DataProvider, type Data } from "../contexts/DataContext";
import {
	Newspaper,
	Calendar,
	User,
	Tag,
	BookOpen,
	ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Articles } from "../lib/schemas";
const ArticleReaderModal = lazy(
	() => import("../components/ArticleReaderModal"),
);
import Button from "../components/Button";

export default function Articles({ data }: { data: Data }) {
	return (
		<DataProvider initialData={data}>
			<ArticlesContent data={data} />
		</DataProvider>
	);
}

function ArticlesContent({ data }: { data: Data }) {
	const {
		translations: { articles: translations, sorting },
		articles,
	} = data;
	const [category, setCategory] = useState("");
	const [sort, setSort] = useState("createdAt-desc");
	const [selectedArticle, setSelectedArticle] = useState<
		Articles["items"][number] | null
	>(null);

	const categories = useMemo(() => {
		return [
			...new Set(articles.items.flatMap((article) => article.categories)),
		].sort();
	}, [articles]);

	return (
		<>
			<ListCards
				title={translations?.["articles-list"] || "Articles List"}
				dataSet={articles.items}
				searchConfig={{
					placeholder:
						translations?.["search-placeholder"] || "Search by Name",
					fieldSearch: ["title", "description"],
				}}
				filterConfig={{
					canReset: true,
					selectField: [
						{
							name: "categories.*",
							label: translations?.["category"] || "category",
							ariaLabel: "choose category of article",
							options: categories.map((category) => ({
								label: category,
								value: category,
							})),
							setValue: setCategory,
							value: category,
						},
						{
							name: "sort",
							label: sorting?.["sort-by"] || "Sort By",
							ariaLabel: "sort articles by",
							options: [
								{
									label:
										sorting?.["createdAt-desc"] ||
										"Newest (Created)",
									value: "createdAt-desc",
									sortingMethod: (a, b) => {
										return (
											new Date(b.pubDate).getTime() -
											new Date(a.pubDate).getTime()
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
											new Date(a.pubDate).getTime() -
											new Date(b.pubDate).getTime()
										);
									},
								},
								{
									label: sorting?.["name-asc"] || "Name (A-Z)",
									value: "name-asc",
									sortingMethod: (a, b) => {
										return a.title.localeCompare(b.title);
									},
								},
								{
									label: sorting?.["name-desc"] || "Name (Z-A)",
									value: "name-desc",
									sortingMethod: (a, b) => {
										return b.title.localeCompare(a.title);
									},
								},
							],
							setValue: setSort,
							value: sort,
						},
					],
				}}
				CustomCard={(item, index, search) => (
					<MediumCard
						data={item}
						index={index}
						search={search}
						onSelect={() => setSelectedArticle(item)}
						translations={translations}
					/>
				)}
			/>

			<AnimatePresence>
				{selectedArticle && (
					<Suspense fallback={null}>
						<ArticleReaderModal
							article={selectedArticle}
							close={() => setSelectedArticle(null)}
							translations={translations}
						/>
					</Suspense>
				)}
			</AnimatePresence>
		</>
	);
}

interface MediumCardProps<T extends Articles["items"][number]> {
	data: T;
	index: number;
	search: string;
	onSelect: () => void;
	translations?: Record<string, string>;
}

function MediumCard<T extends Articles["items"][number]>({
	data,
	index,
	search,
	onSelect,
	translations,
}: MediumCardProps<T>) {
	const [showFullDescription, setShowFullDescription] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);

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

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2, delay: index * 0.08 }}
			className="p-4 flex flex-col gap-4 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] justify-between"
		>
			<div className="pb-4 border-b-2 dark:border-zinc-600 flex flex-col gap-4">
				<div className="flex items-center gap-4">
					<Newspaper size={25} className="shrink-0" />
					<button
						type="button"
						onClick={onSelect}
						className="cursor-pointer text-left hover:underline focus:outline-none"
					>
						<span className="font-semibold uppercase">
							<Highlight text={data.title} />
						</span>
					</button>
				</div>

				<div
					role="button"
					tabIndex={0}
					onClick={onSelect}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onSelect();
						}
					}}
					className="cursor-pointer relative flex-1 max-h-62.5 border-2 dark:border-zinc-600 overflow-hidden group"
				>
					{/* skeleton image */}
					{imageLoading && (
						<div className="absolute inset-0 animate-pulse bg-zinc-600 dark:bg-zinc-800" />
					)}

					{/* image */}
					<img
						src={data.image}
						alt={data.title}
						width={400}
						height={250}
						loading="lazy"
						decoding="async"
						className={`w-full h-full object-cover md:grayscale md:group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300
                            ${imageLoading ? "opacity-0" : "opacity-100"}`}
						onError={(e) => {
							setImageLoading(false);
							e.currentTarget.src = "/placeholders/article.avif";
						}}
						onLoad={() => setImageLoading(false)}
					/>
				</div>

				{/* Description */}
				<p
					onClick={() => setShowFullDescription(!showFullDescription)}
					title={!showFullDescription ? data.description : ""}
					role="button"
					tabIndex={0}
					className={`cursor-pointer text-sm text-gray-500 dark:text-gray-400 ${
						showFullDescription ? "" : "truncate"
					}`}
				>
					{data.description ? (
						<Highlight text={data.description} />
					) : (
						"No description provided"
					)}
				</p>

				<div className="flex items-center gap-2">
					<User size={20} />
					<span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
						{data.author}
					</span>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Calendar size={20} />
					<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
						{new Date(data.pubDate).toLocaleString("en-US", {
							dateStyle: "medium",
							timeStyle: "short",
						})}
					</span>
				</div>
			</div>

			{data.categories.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{data.categories.slice(0, 5).map((cat, i) => (
						<div
							key={i}
							className="flex items-center gap-1 border dark:border-zinc-600 px-2 py-1 bg-gray-50 dark:bg-zinc-800"
						>
							<Tag size={12} />
							<span className="text-xs font-mono uppercase">
								{cat}
							</span>
						</div>
					))}
				</div>
			)}

			<div className="pt-2 border-t-2 dark:border-zinc-700 flex items-center justify-between gap-2">
				<button
					type="button"
					onClick={onSelect}
					className="cursor-pointer px-3 py-1.5 flex items-center gap-2 text-xs font-bold uppercase border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
				>
					<BookOpen size={14} />
					<span>{translations?.["read"] || "Read Article"}</span>
				</button>

				{data.link && (
					<Button
						isLink
						href={data.link}
						aria-label="View on Medium"
						className="p-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						<ExternalLink size={14} />
					</Button>
				)}
			</div>
		</motion.div>
	);
}
