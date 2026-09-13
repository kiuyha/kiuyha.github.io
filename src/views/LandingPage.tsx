import { AnimatePresence, motion } from "framer-motion";
import {
	Briefcase,
	Calendar,
	ChevronDown,
	ChevronUp,
	Download,
	ExternalLink,
	Info,
	Layers,
	Mail,
	MapPin,
	Send,
	User,
	ArrowRight,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { DataProvider, useData, type Data } from "../contexts/DataContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { LanguageSwitcher, ThemeSwitcher } from "../components/Header";
import EmailModal from "../components/EmailModal";
import DetailsModal from "../components/DetailsModal";
import ImagesSlider from "../components/ImagesSlider";
import { IframeMedia } from "../components/IframeMedia";
import type { Project } from "../lib/schemas";

export default function LandingPage({ data }: { data: Data }) {
	return (
		<ThemeProvider>
			<DataProvider initialData={data}>
				<LandingContent />
			</DataProvider>
		</ThemeProvider>
	);
}

function TypingAnimation({ sentence }: { sentence: string }) {
	const [text, setText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const typingSpeed = 90;
		const deletingSpeed = 50;
		const pauseDuration = 2000;

		let timeout: ReturnType<typeof setTimeout>;

		if (!isDeleting) {
			if (text.length < sentence.length) {
				timeout = setTimeout(() => {
					setText(sentence.substring(0, text.length + 1));
				}, typingSpeed);
			} else {
				timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
			}
		} else {
			if (text.length > 0) {
				timeout = setTimeout(() => {
					setText(sentence.substring(0, text.length - 1));
				}, deletingSpeed);
			} else {
				setIsDeleting(false);
			}
		}

		return () => clearTimeout(timeout);
	}, [text, isDeleting, sentence]);

	return (
		<div className="flex items-center font-mono font-bold min-h-[1.5rem] text-sm md:text-base text-zinc-700 dark:text-zinc-300">
			<span>{text}</span>
			<motion.span
				className="w-0.5 h-4 bg-current ml-1 inline-block"
				animate={{ opacity: [0, 1, 0] }}
				transition={{
					duration: 0.8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}

function formatProjectType(type: string): string {
	switch (type) {
		case "website":
			return "Web Application";
		case "cli_tool":
			return "CLI Tool";
		case "ml_model":
			return "Machine Learning";
		default:
			return type.replace(/_/g, " ");
	}
}

function LandingContent() {
	const {
		translations: {
			details: translations,
			projects: projectTranslations,
			landing: landingTranslations,
			email: emailTranslations,
			common: commonTranslations,
		},
		experiences,
		projects,
		currentLang,
	} = useData();

	const [showEmailModal, setShowEmailModal] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(
		null,
	);
	const [expandedProjects, setExpandedProjects] = useState<
		Record<string, boolean>
	>({});

	const toggleProjectDescription = (name: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedProjects((prev) => ({
			...prev,
			[name]: !prev[name],
		}));
	};

	const fullName = import.meta.env.PUBLIC_FULL_NAME || "Ketut Shridhara";
	const nickname = import.meta.env.PUBLIC_NICKNAME || "Kiuyha";
	const title = import.meta.env.PUBLIC_TITLE || "Developer | Data Scientist";
	const githubLink =
		import.meta.env.PUBLIC_GITHUB_LINK || "https://github.com/kiuyha";
	const linkedinLink =
		import.meta.env.PUBLIC_LINKEDIN_LINK ||
		"https://www.linkedin.com/in/ketut-shridhara-46bb792a5";
	const resumeUrl = import.meta.env.PUBLIC_RESUME_URL || "";

	const address =
		translations?.["personal-info-address-value"] ||
		"Surabaya, East Java, Indonesia";
	const email =
		translations?.["personal-info-email-value"] ||
		"ketutshridhara@gmail.com";
	const bio =
		translations?.["about-me-description"] ||
		"A developer specializing in Web and Data Science. I build intelligent web applications and turn data into meaningful insights.";

	// Work experiences are already reversed (latest first)
	const featuredExperiences = useMemo(() => {
		return experiences?.slice(0, 3) || [];
	}, [experiences]);

	// Reverse projects so the latest row added to Google Sheets is shown first
	const featuredProjects = useMemo(() => {
		return [...(projects || [])].reverse().slice(0, 3);
	}, [projects]);

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
			{/* Shared Email Modal */}
			<AnimatePresence>
				{showEmailModal && (
					<EmailModal
						translations={emailTranslations}
						close={() => setShowEmailModal(false)}
					/>
				)}
			</AnimatePresence>

			{/* Project Details Modal */}
			<AnimatePresence>
				{selectedProject && (
					<DetailsModal
						close={() => setSelectedProject(null)}
						data={selectedProject}
						translations={projectTranslations}
						descriptionField="description"
						titleField="name"
						tagsField="tech_stack"
						externalLinkField="link"
						mediaPanel={
							selectedProject.type === "website" ? (
								<IframeMedia link={selectedProject.link} />
							) : (
								<ImagesSlider
									images={[
										selectedProject.thumbnail,
										...(selectedProject.images || []),
									]}
									placeholderImage="/placeholders/project.avif"
								/>
							)
						}
					/>
				)}
			</AnimatePresence>

			{/* Minimal Standalone Header Bar */}
			<header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-40">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
					<span className="font-extrabold text-lg sm:text-xl tracking-tight">
						{fullName}{" "}
						<span className="text-zinc-400 font-medium text-sm">
							({nickname})
						</span>
					</span>

					<div className="flex items-center gap-3">
						<LanguageSwitcher />
						<ThemeSwitcher />
						<a
							href={`/${currentLang}/profile`}
							className="cursor-pointer ml-2 px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
						>
							<span>
								{landingTranslations?.["explore-details"] ||
									"Explore Details"}
							</span>
							<ArrowRight size={14} />
						</a>
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-12">
				{/* Clean Hero Profile Card */}
				<motion.section
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-col items-center text-center gap-6 p-6 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
				>
					{/* Profile Avatar */}
					<div className="relative">
						<img
							src="/profile_picture.avif"
							alt={fullName}
							width={130}
							height={130}
							className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-md"
							loading="eager"
						/>
						<div
							className="absolute bottom-1 right-1 bg-emerald-500 border-2 border-white dark:border-zinc-900 w-4 h-4 rounded-full"
							title={
								landingTranslations?.[
									"available-for-opportunities"
								] || "Available for opportunities"
							}
						/>
					</div>

					{/* Title and Summary */}
					<div className="flex flex-col items-center gap-2 max-w-xl">
						<div className="flex items-center gap-2 flex-wrap justify-center">
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
								{fullName}
							</h1>
							<span className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-semibold">
								({nickname})
							</span>
						</div>

						<TypingAnimation sentence={title} />

						<p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
							{bio}
						</p>

						{/* Contact & Location pills */}
						<div className="flex items-center justify-center gap-4 mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex-wrap">
							<div className="flex items-center gap-1.5">
								<MapPin
									size={15}
									className="text-zinc-400 shrink-0"
								/>
								<span>{address}</span>
							</div>
							<div className="flex items-center gap-1.5">
								<Mail
									size={15}
									className="text-zinc-400 shrink-0"
								/>
								<a
									href={`mailto:${email}`}
									className="hover:underline text-blue-600 dark:text-blue-400 font-medium transition"
								>
									{email}
								</a>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center justify-center gap-3 mt-1">
						<button
							type="button"
							onClick={() => setShowEmailModal(true)}
							className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
						>
							<Send size={15} />
							<span>
								{translations?.["contact-me"] || "Contact Me"}
							</span>
						</button>

						{resumeUrl && (
							<a
								href={resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition shadow-sm"
								aria-label="Download Resume"
							>
								<Download size={15} />
								<span>
									{translations?.["download-cv"] ||
										"Download CV"}
								</span>
							</a>
						)}

						<div className="flex items-center gap-2 pl-1">
							<a
								href={linkedinLink}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="LinkedIn Profile"
								className="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition shadow-sm"
							>
								<img
									src="/icons/linkedin.svg"
									alt="LinkedIn"
									width={18}
									height={18}
									className="dark:invert"
								/>
							</a>

							<a
								href={githubLink}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="GitHub Profile"
								className="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition shadow-sm"
							>
								<img
									src="/icons/github.svg"
									alt="GitHub"
									width={18}
									height={18}
									className="dark:invert"
								/>
							</a>
						</div>
					</div>
				</motion.section>

				{/* Clear Navigation Callouts */}
				<section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<a
						href={`/${currentLang}/profile`}
						className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm transition flex items-center justify-between"
					>
						<div className="flex items-center gap-3.5">
							<div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
								<User size={22} />
							</div>
							<div>
								<h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
									{landingTranslations?.[
										"career-and-education"
									] || "Career & Education"}
								</h2>
								<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
									{landingTranslations?.[
										"career-and-education-desc"
									] ||
										"Detailed work history, biography & schooling"}
								</p>
							</div>
						</div>
						<ArrowRight
							size={18}
							className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-transform"
						/>
					</a>

					<a
						href={`/${currentLang}/projects`}
						className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm transition flex items-center justify-between"
					>
						<div className="flex items-center gap-3.5">
							<div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
								<Layers size={22} />
							</div>
							<div>
								<h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
									{landingTranslations?.[
										"portfolio-projects"
									] || "Portfolio Projects"}
								</h2>
								<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
									{landingTranslations?.[
										"portfolio-projects-desc"
									] ||
										"Web apps, models, tools & live demos"}
								</p>
							</div>
						</div>
						<ArrowRight
							size={18}
							className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-1 transition-transform"
						/>
					</a>
				</section>

				{/* Latest Work Experience (Latest first) */}
				{featuredExperiences.length > 0 && (
					<section className="flex flex-col gap-4">
						<div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
							<div className="flex items-center gap-2.5">
								<Briefcase
									size={20}
									className="text-zinc-700 dark:text-zinc-300"
								/>
								<h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
									{landingTranslations?.[
										"recent-work-experience"
									] || "Recent Work Experience"}
								</h2>
							</div>
							<a
								href={`/${currentLang}/profile`}
								className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
							>
								<span>
									{landingTranslations?.["full-history"] ||
										"Full history"}
								</span>
								<ArrowRight size={14} />
							</a>
						</div>

						<div className="flex flex-col gap-4">
							{featuredExperiences.map((exp, index) => {
								const description =
									(exp[
										`description_${currentLang}`
									] as string) ||
									(exp.description_en as string) ||
									"";

								return (
									<div
										key={index}
										className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col gap-2.5"
									>
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
											<div>
												<h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
													{exp.role}
												</h3>
												<p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
													{exp.company}
												</p>
											</div>
											<span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 self-start sm:self-auto">
												<Calendar
													size={12}
													className="inline mr-1"
												/>
												{exp.start_date} -{" "}
												{exp.end_date ||
													translations?.["present"] ||
													"Present"}
											</span>
										</div>

										<div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
											{exp.type && (
												<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
													<Briefcase size={12} />
													{exp.type}
												</span>
											)}
											{exp.location && (
												<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
													<MapPin size={12} />
													{exp.location}
												</span>
											)}
										</div>

										{description && (
											<p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line line-clamp-3">
												{description}
											</p>
										)}

										{exp.skills &&
											exp.skills.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-1">
													{exp.skills.map(
														(skill, si) => (
															<span
																key={si}
																className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
															>
																{skill}
															</span>
														),
													)}
												</div>
											)}
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* Latest Featured Projects (Single Column with Expandable Short Description & Modal Popup) */}
				{featuredProjects.length > 0 && (
					<section className="flex flex-col gap-4">
						<div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
							<div className="flex items-center gap-2.5">
								<Layers
									size={20}
									className="text-zinc-700 dark:text-zinc-300"
								/>
								<h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
									{landingTranslations?.["featured-projects"] ||
										"Featured Projects"}
								</h2>
							</div>
							<a
								href={`/${currentLang}/projects`}
								className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
							>
								<span>
									{landingTranslations?.["all-projects"] ||
										"All projects"}
								</span>
								<ArrowRight size={14} />
							</a>
						</div>

						{/* Single column layout */}
						<div className="flex flex-col gap-4">
							{featuredProjects.map((project, index) => {
								const isExpanded =
									Boolean(expandedProjects[project.name]);

								return (
									<div
										key={index}
										onClick={() => setSelectedProject(project)}
										className="cursor-pointer group p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm transition flex flex-col sm:flex-row gap-5"
									>
										{/* Thumbnail Image */}
										{project.thumbnail && (
											<div className="sm:w-48 h-36 sm:h-auto rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-100 dark:bg-zinc-800">
												<img
													src={project.thumbnail}
													alt={project.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													loading="lazy"
												/>
											</div>
										)}

										{/* Project Content */}
										<div className="flex flex-col justify-between flex-1 gap-3">
											<div>
												<div className="flex items-center justify-between gap-2 flex-wrap">
													<h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
														{project.name}
													</h3>
													<span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
														{formatProjectType(
															project.type,
														)}
													</span>
												</div>

												{/* Short description with expand / collapse toggle */}
												<div className="mt-2">
													<p
														onClick={(e) =>
															toggleProjectDescription(
																project.name,
																e,
															)
														}
														className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer ${
															isExpanded
																? ""
																: "line-clamp-2"
														}`}
														title={
															isExpanded
																? translations?.[
																		"click-to-collapse"
																	] ||
																	"Click to collapse description"
																: translations?.[
																		"click-to-expand"
																	] ||
																	"Click to expand full description"
														}
													>
														{project.description}
													</p>
													{project.description &&
														project.description
															.length > 90 && (
															<button
																type="button"
																onClick={(e) =>
																	toggleProjectDescription(
																		project.name,
																		e,
																	)
																}
																className="cursor-pointer text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1 flex items-center gap-0.5"
															>
																<span>
																	{isExpanded
																		? landingTranslations?.[
																				"show-less"
																			] ||
																			"Show less"
																		: landingTranslations?.[
																				"read-more"
																			] ||
																			"Read more"}
																</span>
																{isExpanded ? (
																	<ChevronUp
																		size={12}
																	/>
																) : (
																	<ChevronDown
																		size={12}
																	/>
																)}
															</button>
														)}
												</div>
											</div>

											{/* Footer of card: Tech stack & actions */}
											<div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
												<div className="flex flex-wrap gap-1.5">
													{project.tech_stack
														?.slice(0, 4)
														.map((tech, ti) => (
															<span
																key={ti}
																className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
															>
																{tech}
															</span>
														))}
												</div>

												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedProject(
																project,
															);
														}}
														className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition"
													>
														<Info size={13} />
														<span>
															{landingTranslations?.[
																"details"
															] || "Details"}
														</span>
													</button>

													{project.github_link && (
														<a
															href={
																project.github_link
															}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) =>
																e.stopPropagation()
															}
															className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
															aria-label={`GitHub repo for ${project.name}`}
														>
															<img
																src="/icons/github.svg"
																alt="GitHub"
																width={16}
																height={16}
																className="dark:invert"
															/>
														</a>
													)}
													{project.link && (
														<a
															href={project.link}
															target="_blank"
															rel="noopener noreferrer"
															onClick={(e) =>
																e.stopPropagation()
															}
															className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
															aria-label={`Live demo for ${project.name}`}
														>
															<ExternalLink
																size={16}
															/>
														</a>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* Friendly Exploration Banner */}
				<section className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="text-center sm:text-left">
						<h3 className="font-extrabold text-lg sm:text-xl">
							{landingTranslations?.["portfolio-cta-title"] ||
								"Want to see the complete interactive portfolio?"}
						</h3>
						<p className="text-xs sm:text-sm text-zinc-300 dark:text-zinc-600 mt-1">
							{landingTranslations?.["portfolio-cta-desc"] ||
								"Browse all interactive widgets, achievements, contributions, and technical writeups."}
						</p>
					</div>

					<div className="flex items-center gap-3 shrink-0">
						<a
							href={`/${currentLang}/profile`}
							className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 transition shadow-sm"
						>
							<span>
								{landingTranslations?.["view-profile"] ||
									"View Profile"}
							</span>
							<ArrowRight size={16} />
						</a>
						<a
							href={`/${currentLang}/projects`}
							className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-current hover:opacity-80 transition"
						>
							<span>
								{landingTranslations?.["all-projects"] ||
									"All Projects"}
							</span>
						</a>
					</div>
				</section>
			</main>

			{/* Minimal Standalone Landing Page Footer */}
			<footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
				<p>
					&copy; {new Date().getFullYear()} {fullName}.{" "}
					{commonTranslations?.["all-rights-reserved"] ||
						"All rights reserved."}
				</p>
			</footer>
		</div>
	);
}
