import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import hljs from "highlight.js";
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

const COMMON_LANGUAGES = [
	"python",
	"javascript",
	"typescript",
	"bash",
	"shell",
	"json",
	"html",
	"xml",
	"css",
	"sql",
	"r",
	"java",
	"cpp",
	"c",
	"rust",
	"go",
	"yaml",
	"markdown",
];

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
	const contentRef = useRef<HTMLDivElement>(null);

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

	// Pre-process raw article HTML: classify formula figures and strip tracking pixels
	const processedContent = useMemo(() => {
		const raw = article.content || article.description || "";
		if (!raw) return "";

		// Process figure tags: detect formulas vs diagrams
		let html = raw.replace(
			/<figure[^>]*>([\s\S]*?)<\/figure>/gi,
			(match, inner) => {
				// Strip Medium tracking pixel figures
				if (/medium\.com\/_\/stat/i.test(inner)) return "";

				const captionMatch = inner.match(
					/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
				);
				const caption = (
					captionMatch ? captionMatch[1] : ""
				).toLowerCase();

				const isJpeg = /\.jpe?g/i.test(inner);
				const isDiagram =
					caption.includes("visualization") ||
					caption.includes("meme") ||
					caption.includes("curve") ||
					caption.includes("graph") ||
					caption.includes("plot") ||
					caption.includes("chart") ||
					caption.includes("tree");

				const hasFormulaCaption =
					caption.includes("formula") ||
					caption.includes("equation") ||
					caption.includes("math") ||
					caption.includes("rumus");

				// Medium formula URLs typically have /max/NNN/ where NNN <= 480
				const maxMatch = inner.match(/\/max\/(\d+)\//);
				const maxVal = maxMatch ? parseInt(maxMatch[1], 10) : 9999;

				const isLikelyFormula =
					!isJpeg &&
					!isDiagram &&
					(hasFormulaCaption || (!caption && maxVal <= 480));

				if (isLikelyFormula) {
					const figInner = inner.replace(
						/<img([^>]*)>/i,
						'<img$1 class="article-formula-img">',
					);
					return `<figure class="article-formula-figure">${figInner}</figure>`;
				}

				return match;
			},
		);

		// Remove any remaining standalone stat tracking images
		html = html.replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, "");

		// Process code blocks: auto-detect language with highlight.js, format terminal header, and add copy button
		const copyLabel = translations?.["copy"] || "Copy";

		html = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, innerPre) => {
			const raw = innerPre.replace(/^<code[^>]*>([\s\S]*?)<\/code>$/i, "$1");

			// Normalize newlines and strip inner HTML tags
			let codeText = raw
				.replace(/<br\s*\/?>/gi, "\n")
				.replace(/<\/p><p[^>]*>/gi, "\n")
				.replace(/<[^>]+>/g, "");

			// Decode HTML entities
			codeText = codeText
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.replace(/&#x27;/g, "'")
				.replace(/&nbsp;/g, " ");

			let highlightedHtml = "";
			let detectedLang = "code";

			try {
				const result = hljs.highlightAuto(codeText, COMMON_LANGUAGES);
				if (result.language) {
					detectedLang = result.language;
				}
				highlightedHtml = result.value;
			} catch {
				highlightedHtml = codeText
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;");
			}

			const langDisplay =
				detectedLang === "cpp"
					? "C++"
					: detectedLang === "python"
						? "Python"
						: detectedLang === "javascript"
							? "JavaScript"
							: detectedLang === "typescript"
								? "TypeScript"
								: detectedLang.toUpperCase();

			return `<div class="article-code-wrapper my-6 rounded-lg overflow-hidden border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#282c34]">
				<div class="article-code-header flex items-center justify-between px-4 py-2.5 bg-[#21252b] border-b-2 border-zinc-900 dark:border-zinc-700 select-none">
					<div class="flex items-center gap-2">
						<span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
						<span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
						<span class="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
						<span class="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 ml-1.5">${langDisplay}</span>
					</div>
					<button type="button" class="article-copy-btn inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded border-2 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer" aria-label="Copy code">
						<svg class="copy-icon w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
						<svg class="check-icon hidden w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
						<span class="copy-text">${copyLabel}</span>
					</button>
				</div>
				<pre class="p-4 m-0 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-[#abb2bf] bg-[#282c34]"><code class="hljs language-${detectedLang}">${highlightedHtml}</code></pre>
			</div>`;
		});

		return html;
	}, [article.content, article.description, translations]);

	// Post-mount dynamic detection: inspect rendered image aspect ratios & dimensions
	useEffect(() => {
		if (!contentRef.current) return;

		const container = contentRef.current;
		const imgs = container.querySelectorAll("img");

		const evaluateImg = (img: HTMLImageElement) => {
			if (
				(img.naturalWidth === 1 && img.naturalHeight === 1) ||
				img.src.includes("medium.com/_/stat")
			) {
				img.style.display = "none";
				return;
			}

			// JPEGs are photos or memes, never transparent math formulas
			if (img.src.includes(".jpeg") || img.src.includes(".jpg")) {
				return;
			}

			const figure = img.closest("figure");
			const figcaption = (
				figure?.querySelector("figcaption")?.textContent || ""
			).toLowerCase();

			const isExplicitDiagram =
				figcaption.includes("visualization") ||
				figcaption.includes("meme") ||
				figcaption.includes("curve") ||
				figcaption.includes("graph") ||
				figcaption.includes("plot") ||
				figcaption.includes("chart") ||
				figcaption.includes("tree");

			const isExplicitFormula =
				figcaption.includes("formula") ||
				figcaption.includes("equation") ||
				figcaption.includes("math") ||
				figcaption.includes("rumus");

			const nw = img.naturalWidth;
			const nh = img.naturalHeight;
			const aspect = nh > 0 ? nw / nh : 0;

			const isFormula =
				!isExplicitDiagram &&
				(isExplicitFormula ||
					nh <= 125 ||
					(nh <= 165 && aspect >= 2.8) ||
					(nh <= 240 && aspect >= 3.2 && !figcaption));

			if (isFormula) {
				img.classList.add("article-formula-img");
				if (figure) {
					figure.classList.add("article-formula-figure");
				}
			}
		};

		imgs.forEach((img) => {
			if (img.complete && img.naturalWidth > 0) {
				evaluateImg(img);
			} else {
				img.addEventListener("load", () => evaluateImg(img), {
					once: true,
				});
			}
		});
	}, [processedContent]);

	// Event delegation for copy buttons inside article code blocks
	useEffect(() => {
		if (!contentRef.current) return;
		const container = contentRef.current;

		const handleContainerClick = async (e: MouseEvent) => {
			const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
				".article-copy-btn",
			);
			if (!btn) return;

			const wrapper = btn.closest(".article-code-wrapper");
			const codeEl = wrapper?.querySelector("code");
			if (!codeEl) return;

			const codeToCopy = codeEl.textContent || "";
			try {
				if (navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(codeToCopy);
				} else {
					const textArea = document.createElement("textarea");
					textArea.value = codeToCopy;
					textArea.style.position = "fixed";
					textArea.style.left = "-999999px";
					textArea.style.top = "-999999px";
					document.body.appendChild(textArea);
					textArea.focus();
					textArea.select();
					document.execCommand("copy");
					textArea.remove();
				}

				const copyIcon = btn.querySelector(".copy-icon");
				const checkIcon = btn.querySelector(".check-icon");
				const copyText = btn.querySelector(".copy-text");

				if (copyIcon) copyIcon.classList.add("hidden");
				if (checkIcon) checkIcon.classList.remove("hidden");
				if (copyText)
					copyText.textContent =
						translations?.["copied"] || "Copied!";
				btn.classList.add(
					"!border-emerald-500",
					"!text-emerald-400",
					"!bg-emerald-950/60",
				);

				setTimeout(() => {
					if (copyIcon) copyIcon.classList.remove("hidden");
					if (checkIcon) checkIcon.classList.add("hidden");
					if (copyText)
						copyText.textContent =
							translations?.["copy"] || "Copy";
					btn.classList.remove(
						"!border-emerald-500",
						"!text-emerald-400",
						"!bg-emerald-950/60",
					);
				}, 2000);
			} catch (err) {
				console.error("Failed to copy code:", err);
			}
		};

		container.addEventListener("click", handleContainerClick);
		return () => {
			container.removeEventListener("click", handleContainerClick);
		};
	}, [processedContent, translations]);

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
								<span>
									{readTimeMinutes}{" "}
									{translations?.["min-read"] || "min read"}
								</span>
							</div>
						</div>

						{/* Article Content */}
						<div
							ref={contentRef}
							className="article-prose mt-4 text-justify sm:text-left"
							dangerouslySetInnerHTML={{
								__html: processedContent,
							}}
						/>

						{/* Footer / End of Article Section */}
						<div className="mt-12 pt-8 border-t-2 border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
								<BookOpen size={18} />
								<span>
									{translations?.["end-of-article"] ||
										"You've reached the end of this article"}
								</span>
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
										<span>
											{translations?.["view-on-medium"] ||
												"View on Medium"}
										</span>
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
