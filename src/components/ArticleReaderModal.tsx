import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
	X,
	ExternalLink,
	Calendar,
	User,
	Clock,
	Tag,
	ArrowLeft,
	BookOpen,
} from "lucide-react";
import type { Articles } from "../lib/schemas";
import Button from "./Button";

interface ArticleReaderModalProps {
	article: Articles["items"][number];
	close: () => void;
	translations?: Record<string, string>;
}

export default function ArticleReaderModal({
	article,
	close,
	translations,
}: ArticleReaderModalProps) {
	// Lock body scroll when modal is open
	useEffect(() => {
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				close();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = originalOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [close]);

	// Calculate estimated read time in minutes
	const readTimeMinutes = useMemo(() => {
		const text = (article.content || article.description || "").replace(
			/<[^>]+>/g,
			" ",
		);
		const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
		return Math.max(1, Math.ceil(wordCount / 200));
	}, [article.content, article.description]);

	const formattedDate = useMemo(() => {
		try {
			return new Date(article.pubDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			return article.pubDate;
		}
	}, [article.pubDate]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.25 }}
			className="fixed inset-0 z-200 flex flex-col bg-black/60 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) close();
			}}
		>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 30 }}
				transition={{ duration: 0.25 }}
				className="flex flex-col w-full h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-hidden"
			>
				{/* Sticky Header */}
				<header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 md:px-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b-2 dark:border-zinc-700 shadow-sm">
					<button
						type="button"
						onClick={close}
						className="cursor-pointer flex items-center gap-2 px-3 py-1.5 font-semibold text-sm border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
						aria-label="Back to articles"
					>
						<ArrowLeft size={18} />
						<span className="hidden sm:inline">
							{translations?.["back"] || "Back to list"}
						</span>
					</button>

					<div className="flex items-center gap-2">
						{article.link && (
							<Button
								isLink
								href={article.link}
								aria-label="Read original on Medium"
								className="text-xs md:text-sm font-semibold flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
							>
								<span>Medium</span>
								<ExternalLink size={14} />
							</Button>
						)}

						<button
							type="button"
							onClick={close}
							aria-label="Close article reader"
							className="cursor-pointer p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
						>
							<X size={24} />
						</button>
					</div>
				</header>

				{/* Scrollable Article Body */}
				<main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-12">
					<article className="max-w-3xl mx-auto flex flex-col gap-6">
						{/* Category Pills */}
						{article.categories && article.categories.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{article.categories.map((cat, i) => (
									<span
										key={i}
										className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase font-semibold border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
									>
										<Tag size={12} />
										{cat}
									</span>
								))}
							</div>
						)}

						{/* Article Title */}
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
							{article.title}
						</h1>

						{/* Meta Info */}
						<div className="flex flex-wrap items-center gap-4 py-3 border-y-2 border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
							<div className="flex items-center gap-1.5">
								<User size={16} />
								<span>{article.author}</span>
							</div>

							<div className="flex items-center gap-1.5">
								<Calendar size={16} />
								<span>{formattedDate}</span>
							</div>

							<div className="flex items-center gap-1.5">
								<Clock size={16} />
								<span>{readTimeMinutes} min read</span>
							</div>
						</div>

						{/* Hero Image (if available) */}
						{article.image &&
							article.image !== "/images/placeholder_article.avif" && (
								<div className="w-full my-2 border-2 border-zinc-900 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
									<img
										src={article.image}
										alt={article.title}
										className="w-full max-h-[460px] object-cover"
										onError={(e) => {
											// Hide hero container if image fails
											(e.currentTarget.parentElement as HTMLElement).style.display =
												"none";
										}}
									/>
								</div>
							)}

						{/* Article Content */}
						<div
							className="article-prose mt-4 text-justify sm:text-left"
							dangerouslySetInnerHTML={{
								__html: article.content || article.description,
							}}
						/>

						{/* Footer / End of Article Section */}
						<div className="mt-12 pt-8 border-t-2 border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
								<BookOpen size={18} />
								<span>You've reached the end of this article</span>
							</div>

							<div className="flex items-center gap-3 w-full sm:w-auto">
								<button
									type="button"
									onClick={close}
									className="cursor-pointer flex-1 sm:flex-initial px-4 py-2 text-sm font-bold uppercase border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
								>
									{translations?.["close"] || "Close"}
								</button>

								{article.link && (
									<Button
										isLink
										href={article.link}
										className="flex-1 sm:flex-initial text-sm font-bold uppercase bg-zinc-200 dark:bg-zinc-700"
										aria-label="View on Medium"
									>
										<span>View on Medium</span>
										<ExternalLink size={16} />
									</Button>
								)}
							</div>
						</div>
					</article>
				</main>
			</motion.div>
		</motion.div>
	);
}
