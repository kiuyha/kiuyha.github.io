import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	CircleCheck,
	Download,
	GraduationCap,
	Info,
	UserSearch,
	type LucideIcon,
	MapPin,
	Briefcase,
	Calendar,
	Send,
	Search,
	RefreshCcw,
	Layers,
	FolderGit2,
	ExternalLink,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { DataProvider, useData, type Data } from "../contexts/DataContext";
import EmailModal from "../components/EmailModal";
import DetailsModal from "../components/DetailsModal";
import ImagesSlider from "../components/ImagesSlider";
import { IframeMedia } from "../components/IframeMedia";
import type { Experience, Project } from "../lib/schemas";

export default function Profile({ data }: { data: Data }) {
	return (
		<DataProvider initialData={data}>
			<ProfileContent />
		</DataProvider>
	);
}

function ProfileContent() {
	const {
		projects,
		translations: {
			projects: projectTranslations,
			email: emailTranslations,
		},
	} = useData();
	const [showEmailModal, setShowEmailModal] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(
		null,
	);

	return (
		<div className="flex flex-col gap-8">
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

			{/* Top Row: Profile Card & Personal Details Card */}
			<div className="grid grid-cols-4 gap-6">
				<ProfileCard onOpenEmail={() => setShowEmailModal(true)} />
				<DetailsCard />
			</div>

			{/* Bottom Full-Width Section: Work Experience CV Timeline (Single Column with Filters) */}
			<WorkExperienceSection
				allProjects={projects}
				onSelectProject={setSelectedProject}
			/>
		</div>
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

function ProfileCard({ onOpenEmail }: { onOpenEmail: () => void }) {
	const {
		translations: { details: translations },
	} = useData();
	const githubLink =
		import.meta.env.PUBLIC_GITHUB_LINK || "https://github.com/kiuyha";
	const linkedinLink =
		import.meta.env.PUBLIC_LINKEDIN_LINK ||
		"https://www.linkedin.com/in/ketut-shridhara-46bb792a5";
	const resumeUrl = import.meta.env.PUBLIC_RESUME_URL || "";

	return (
		<motion.div
			initial={{ rotateX: -90 }}
			animate={{ rotateX: 0 }}
			exit={{ rotateX: 90 }}
			transition={{ duration: 0.5 }}
			className="col-span-4 lg:col-span-1 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
		>
			<div>
				<div className="relative mb-4">
					<img
						alt="Profile Banner"
						className="h-36 w-full object-cover border-b-2 border-zinc-900 dark:border-zinc-600"
						src="/banners/profile.avif"
						loading="eager"
						decoding="async"
						fetchPriority="high"
					/>

					<div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-6 border-white dark:border-zinc-900 rounded-full">
						<img
							loading="eager"
							decoding="async"
							src="/profile_picture.avif"
							alt="Profile Picture"
							width={160}
							height={160}
							className="w-28 h-28 rounded-full border-2 border-zinc-900 dark:border-white object-cover"
							fetchPriority="high"
						/>
					</div>
				</div>

				<div className="p-4 pt-16 flex flex-col items-center justify-center text-center">
					<h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
						{import.meta.env.PUBLIC_FULL_NAME || "Ketut Shridhara"}
					</h2>
					<h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">
						({import.meta.env.PUBLIC_NICKNAME || "Kiuyha"})
					</h3>
					<TypingAnimation
						sentence={
							import.meta.env.PUBLIC_TITLE ||
							"Developer | Data Scientist"
						}
					/>
				</div>
			</div>

			{/* Action buttons */}
			<div className="p-4 pt-0 flex flex-col gap-2.5">
				<button
					type="button"
					onClick={onOpenEmail}
					className="cursor-pointer w-full py-2.5 px-3 flex items-center justify-center gap-2 border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
				>
					<Send size={15} />
					<span>{translations?.["contact-me"] || "Contact Me"}</span>
				</button>

				{resumeUrl && (
					<a
						href={resumeUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="cursor-pointer w-full py-2.5 px-3 flex items-center justify-center gap-2 border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
					>
						<Download size={15} />
						<span>{translations?.["download-cv"] || "Download CV"}</span>
					</a>
				)}

				<div className="flex items-center gap-2 pt-1">
					<a
						href={linkedinLink}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="LinkedIn Profile"
						className="flex-1 py-2 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
					>
						<img
							src="/icons/linkedin.svg"
							alt="LinkedIn"
							width={16}
							height={16}
							className="dark:invert"
						/>
					</a>

					<a
						href={githubLink}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub Profile"
						className="flex-1 py-2 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
					>
						<img
							src="/icons/github.svg"
							alt="GitHub"
							width={16}
							height={16}
							className="dark:invert"
						/>
					</a>
				</div>
			</div>
		</motion.div>
	);
}

function CollapsedContent({
	title,
	children,
	Icon,
	initialOpen = false,
}: {
	title: string;
	children: React.ReactNode;
	Icon: LucideIcon;
	initialOpen?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(initialOpen);
	return (
		<div>
			<button
				type="button"
				aria-label="Toggle collapsed content"
				onClick={() => setIsOpen((prev) => !prev)}
				className="cursor-pointer rounded-full flex items-center justify-between gap-2 w-full"
			>
				<div className="flex items-center gap-4 md:gap-2">
					<Icon size={20} />
					<span className="font-semibold uppercase">{title}</span>
				</div>
				<ChevronDown
					size={20}
					className={`${
						isOpen ? "rotate-180" : ""
					} transition-transform duration-300 ease-in-out`}
				/>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="mt-4 ml-2"
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function DetailsCard() {
	const {
		translations: { details: translations },
	} = useData();

	const educationLength =
		translations?.["education-length"] &&
		!isNaN(Number(translations["education-length"]))
			? Number(translations["education-length"])
			: null;

	return (
		<motion.div
			initial={{ rotateX: -90 }}
			animate={{ rotateX: 0 }}
			exit={{ rotateX: 90 }}
			transition={{ duration: 0.5 }}
			className="px-6 py-8 col-span-4 lg:col-span-3 flex flex-col gap-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			{/* About Me */}
			<CollapsedContent
				title={translations?.["about-me"] || "About Me"}
				Icon={Info}
				initialOpen
			>
				<p className="semibold text-justify leading-relaxed">
					{translations?.["about-me-description"] ||
						`A developer specializing in Web and Data Science. I build
					intelligent web applications and turn data into meaningful
					insights. Based in Indonesia.`}
				</p>
			</CollapsedContent>

			{/* Personal Information */}
			<CollapsedContent
				title={
					translations?.["personal-info"] || "Personal Information"
				}
				Icon={UserSearch}
				initialOpen
			>
				<div className="space-y-3">
					<p className="semibold text-justify">
						<strong>
							{translations?.["personal-info-address"] ||
								"Address:"}
						</strong>{" "}
						{translations?.["personal-info-address-value"] ||
							"Surabaya, Jawa Timur, Indonesia"}
					</p>
					<p className="semibold text-justify">
						<strong>
							{translations?.["personal-info-email"] || "Email:"}
						</strong>{" "}
						<a
							href={`mailto:${translations?.["personal-info-email-value"] || "ketutshridhara@gmail.com"}`}
							className="hover:underline text-blue-600 dark:text-blue-400 font-medium"
						>
							{translations?.["personal-info-email-value"] ||
								"ketutshridhara@gmail.com"}
						</a>
					</p>
					<p className="semibold text-justify">
						<strong>
							{translations?.["personal-info-birth-date"] ||
								"Birth Date:"}
						</strong>{" "}
						{translations?.["personal-info-birth-date-value"] ||
							"12 Maret 2007"}
					</p>
				</div>
			</CollapsedContent>

			{/* Education */}
			<CollapsedContent
				title={translations?.["education"] || "Education"}
				Icon={GraduationCap}
				initialOpen
			>
				<div className="flex flex-col md:flex-row w-full justify-center gap-12 pt-2">
					{educationLength &&
						Array.from({
							length: educationLength,
						}).map((_, index) => {
							const first = index === 0;
							const last = index === educationLength - 1;
							return (
								<motion.div
									key={index}
									className="relative"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.5,
										delay: index * 0.2,
									}}
								>
									{/* VERTICAL line for mobile view */}
									<motion.div
										initial={{ height: 0 }}
										animate={{ height: "100%" }}
										transition={{
											duration: 0.5,
											delay: index * 0.2 + 0.5,
										}}
										className={`md:hidden absolute left-5 w-0.5 bg-gray-300
											${first ? "top-1/2 h-1/2" : last ? "-top-1/2 h-1/2" : "top-0 h-full"}
											`}
									/>

									{/* HORIZONTAL line for desktop view */}
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: "100%" }}
										transition={{
											duration: 0.5,
											delay: index * 0.2 + 0.5,
										}}
										className={`hidden md:block absolute top-5 h-0.5 bg-gray-300
									${first ? "left-1/2 w-1/2" : last ? "-left-1/2 w-1/2" : "left-0 w-full"}`}
									/>

									{/* The Icon and Content Container */}
									<div className="relative flex flex-row md:flex-col items-center z-10">
										<div className="bg-white dark:bg-zinc-900 p-1 rounded-full border-2 border-zinc-200 dark:border-zinc-800 md:mx-auto">
											<CircleCheck
												className="text-blue-600 dark:text-blue-500"
												size={30}
												strokeWidth={2}
											/>
										</div>

										<div className="pl-5 md:pl-0 md:text-center md:mt-4">
											<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
												{translations?.[
													`education-${index}-year`
												] || "Year"}
											</p>
											<div className="mt-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm min-w-[220px]">
												<h3 className="font-bold">
													{translations?.[
														`education-${index}-title`
													] || "Title"}
												</h3>
												<p className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
													{translations?.[
														`education-${index}-institution`
													] || "Institution"}
												</p>
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
				</div>
			</CollapsedContent>
		</motion.div>
	);
}

/**
 * Single-Column CV Timeline Work Experience Section
 * - Includes full search and filters (Job Type, Company, Sort)
 * - Single column layout like a real CV (NOT 3 columns)
 * - Click to open full experience in reader modal (like an article, NO "Read More" button)
 * - Connected projects
 */
function WorkExperienceSection({
	allProjects,
	onSelectProject,
}: {
	allProjects: Project[];
	onSelectProject: (p: Project) => void;
}) {
	const {
		translations: { details: translations, sorting },
		experiences,
		currentLang,
	} = useData();

	const [search, setSearch] = useState("");
	const [type, setType] = useState("");
	const [company, setCompany] = useState("");
	const [sort, setSort] = useState("newest");

	const types = useMemo(() => {
		if (!experiences) return [];
		return [
			...new Set(experiences.map((exp) => exp.type).filter(Boolean)),
		].sort();
	}, [experiences]);

	const companies = useMemo(() => {
		if (!experiences) return [];
		return [
			...new Set(experiences.map((exp) => exp.company).filter(Boolean)),
		].sort();
	}, [experiences]);

	// Filter & search logic
	const filteredExperiences = useMemo(() => {
		if (!experiences) return [];
		let result = experiences.filter((exp) => {
			const inType = type === "" || exp.type === type;
			const inCompany = company === "" || exp.company === company;

			const desc =
				(exp[`description_${currentLang}`] as string) ||
				(exp.description_en as string) ||
				"";

			const inSearch =
				search === "" ||
				exp.role?.toLowerCase().includes(search.toLowerCase()) ||
				exp.company?.toLowerCase().includes(search.toLowerCase()) ||
				desc.toLowerCase().includes(search.toLowerCase()) ||
				exp.skills?.some((s) =>
					s.toLowerCase().includes(search.toLowerCase()),
				);

			return inType && inCompany && inSearch;
		});

		if (sort === "oldest") {
			result = [...result].reverse();
		}

		return result;
	}, [experiences, type, company, sort, search, currentLang]);

	const hasActiveFilters = Boolean(
		search || type || company || sort !== "newest",
	);

	const resetFilters = () => {
		setSearch("");
		setType("");
		setCompany("");
		setSort("newest");
	};

	return (
		<section className="col-span-4 flex flex-col gap-4">
			{/* Headline of the section - exactly like other ListCards */}
			<motion.div
				initial={{ rotateX: -90 }}
				animate={{ rotateX: 0 }}
				exit={{ rotateX: 90 }}
				transition={{ duration: 0.5 }}
				className="font-semibold px-4 py-2 flex gap-2 items-center bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
			>
				<Briefcase size={25} />
				<h2 className="text-md uppercase font-bold">
					{translations?.["work-experience"] || "Work Experience"}
				</h2>
				<p>({filteredExperiences.length})</p>
			</motion.div>

			{/* Filter & Search Bar like other ListCards */}
			<div className="flex flex-col gap-2 lg:flex-row lg:bg-white lg:dark:bg-zinc-900 lg:border-2 dark:border-zinc-600 lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
				{/* Search bar */}
				<div
					aria-label="Search bar"
					className="px-4 py-2 flex-1 flex gap-2 items-center bg-white dark:bg-zinc-900 border-2 lg:border-0 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-none"
				>
					<Search size={25} />
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={
							translations?.["search-experiences-placeholder"] ||
							"Search by role, company, or skills..."
						}
						className="w-full bg-transparent outline-none font-semibold text-sm lg:text-base"
					/>
				</div>

				{/* Filters & Refresh Button container */}
				<div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:border-0 lg:shadow-none w-full lg:w-auto">
					{/* Type Filter */}
					<select
						value={type}
						onChange={(e) => setType(e.target.value)}
						aria-label="Filter by job type"
						className="w-full sm:flex-1 min-w-0 px-3 py-2 text-sm lg:text-base font-semibold uppercase cursor-pointer bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition outline-none border-r-2 border-b-2 sm:border-b-0 sm:border-r-2 lg:border-l-4 dark:border-zinc-600"
					>
						<option value="">
							{translations?.["all-job-types"] || "All Job Types"}
						</option>
						{types.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>

					{/* Company Filter */}
					<select
						value={company}
						onChange={(e) => setCompany(e.target.value)}
						aria-label="Filter by company"
						className="w-full sm:flex-1 min-w-0 px-3 py-2 text-sm lg:text-base font-semibold uppercase cursor-pointer bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition outline-none border-b-2 sm:border-b-0 sm:border-r-2 dark:border-zinc-600"
					>
						<option value="">
							{translations?.["all-companies"] || "All Companies"}
						</option>
						{companies.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>

					{/* Sort By */}
					<select
						value={sort}
						onChange={(e) => setSort(e.target.value)}
						aria-label="Sort experiences by"
						className="w-full sm:flex-1 min-w-0 px-3 py-2 text-sm lg:text-base font-semibold uppercase cursor-pointer bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition outline-none border-r-2 sm:border-r-0 dark:border-zinc-600"
					>
						<option value="newest">
							{sorting?.["newest"] || "Newest"}
						</option>
						<option value="oldest">
							{sorting?.["oldest"] || "Oldest"}
						</option>
					</select>

					{/* Reset / Refresh Button like ListCards */}
					<button
						type="button"
						onClick={resetFilters}
						aria-label="reset filters"
						title={sorting?.["reset-filters"] || "Reset all filters"}
						className="cursor-pointer border-t-0 sm:border-t-0 sm:border-l-4 px-4 py-2 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0 flex items-center justify-center bg-white dark:bg-zinc-900"
					>
						<RefreshCcw size={25} />
					</button>
				</div>
			</div>

			{/* Single-Column CV Timeline List (Returned card background and shadow) */}
			{filteredExperiences.length > 0 ? (
				<div className="flex flex-col gap-4 pt-1">
					{filteredExperiences.map((exp, index) => (
						<ExperienceCardItem
							key={`${exp.role}-${exp.company}-${index}`}
							exp={exp}
							currentLang={currentLang}
							allProjects={allProjects}
							onSelectProject={onSelectProject}
						/>
					))}
				</div>
			) : (
				<p className="text-sm text-zinc-500 dark:text-zinc-400 italic p-4 text-center">
					{hasActiveFilters
						? translations?.["no-experiences-match"] ||
							"No work experiences match the current filters."
						: translations?.["no-experiences-available"] ||
							"Work experience details will appear once added to the Experiences sheet in Google Sheets."}
				</p>
			)}
		</section>
	);
}

function ExperienceCardItem({
	exp,
	currentLang,
	allProjects,
	onSelectProject,
}: {
	exp: Experience;
	currentLang: string;
	allProjects: Project[];
	onSelectProject: (p: Project) => void;
}) {
	const {
		translations: { details: translations },
	} = useData();
	const [showFullDescription, setShowFullDescription] = useState(false);

	const description = useMemo(() => {
		const raw =
			(exp[`description_${currentLang}`] as string) ||
			(exp.description_en as string) ||
			"";
		return raw.replace(/\\n/g, "\n");
	}, [exp, currentLang]);

	// Match connected projects
	const connectedProjects = useMemo(() => {
		if (!allProjects || allProjects.length === 0) return [];
		return allProjects.filter((p) => {
			if (exp.projects && exp.projects.length > 0) {
				const match = exp.projects.some(
					(pName) =>
						p.name.toLowerCase().includes(pName.toLowerCase()) ||
						pName.toLowerCase().includes(p.name.toLowerCase()),
				);
				if (match) return true;
			}
			if (
				exp.company &&
				p.description &&
				p.description
					.toLowerCase()
					.includes(exp.company.toLowerCase())
			) {
				return true;
			}
			return false;
		});
	}, [allProjects, exp]);

	return (
		<div
			className="p-5 md:p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3"
		>
			{/* Title, Company & Date Row */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900/15 dark:border-zinc-700 pb-3">
				<div>
					<h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
						<span>{exp.role}</span>
					</h3>
					<p className="text-base font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
						{exp.company}
					</p>
				</div>

				<span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
					<Calendar size={13} />
					{exp.start_date} -{" "}
					{exp.end_date || translations?.["present"] || "Present"}
				</span>
			</div>

			{/* Badges: Type & Location */}
			<div className="flex flex-wrap items-center gap-2">
				{exp.type && (
					<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-900">
						<Briefcase size={12} />
						{exp.type}
					</span>
				)}
				{exp.location && (
					<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-900">
						<MapPin size={12} />
						{exp.location}
					</span>
				)}
			</div>

			{/* Description: expands inline like articles section, preserves 'enters' */}
			{description && (
				<p
					onClick={() => setShowFullDescription(!showFullDescription)}
					role="button"
					tabIndex={0}
					title={
						!showFullDescription
							? translations?.["click-to-expand"] ||
								"Click to expand full description"
							: translations?.["click-to-collapse"] ||
								"Click to collapse description"
					}
					className={`cursor-pointer text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line text-justify transition-colors hover:text-zinc-900 dark:hover:text-zinc-200 ${
						showFullDescription ? "" : "line-clamp-3"
					}`}
				>
					{description}
				</p>
			)}

			{/* Skills Tags */}
			{exp.skills && exp.skills.length > 0 && (
				<div className="flex flex-wrap gap-1.5 pt-1">
					{exp.skills.map((skill, si) => (
						<span
							key={si}
							className="text-xs font-mono font-semibold px-2 py-0.5 border border-zinc-900 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800"
						>
							{skill}
						</span>
					))}
				</div>
			)}

			{/* Connected Projects Chips (if any) */}
			{connectedProjects.length > 0 && (
				<div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900/10 dark:border-zinc-700">
					<span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
						<Layers size={12} />
						{translations?.["projects-label"] || "Projects:"}
					</span>
					{connectedProjects.map((p) => (
						<button
							key={p.name}
							type="button"
							onClick={() => onSelectProject(p)}
							className="cursor-pointer px-2.5 py-1 border border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-bold flex items-center gap-1.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition"
							title={`View ${p.name} details`}
						>
							<FolderGit2 size={12} />
							<span>{p.name}</span>
							<ExternalLink size={11} />
						</button>
					))}
				</div>
			)}
		</div>
	);
}