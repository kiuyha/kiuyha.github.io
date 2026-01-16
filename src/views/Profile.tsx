import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	CircleCheck,
	GraduationCap,
	Info,
	UserSearch,
	type LucideIcon,
	Globe,
	TerminalSquare,
	ExternalLink,
	BrainCircuit,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { DataProvider, useData, type Data } from "../contexts/DataContext";
import ListCards from "../components/ListCards";
import Button from "../components/Button";
import ImagesSlider from "../components/ImagesSlider";
import DetailsModal from "../components/DetailsModal";
import { IframeMedia } from "../components/IframeMedia";

export default function Profile({ data }: { data: Data }) {
	return (
		<DataProvider initialData={data}>
			<div className="mt-auto grid grid-cols-4 gap-4">
				<ProfileCard />
				<DetailsCard />
				<Projects />
			</div>
		</DataProvider>
	);
}

function TypingAnimation({ sentence }: { sentence: string }) {
	const [index, setIndex] = useState(0);
	const [text, setText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		// Determine the speed of typing/deleting
		const typingSpeed = 100;
		const deletingSpeed = 100;
		const pauseDuration = 1500;

		const handleTyping = () => {
			if (!isDeleting) {
				// If we are typing
				if (text.length < sentence.length) {
					setText(sentence.substring(0, text.length + 1));
				} else {
					// Finished typing, wait then start deleting
					setTimeout(() => setIsDeleting(true), pauseDuration);
				}
			} else {
				// If we are deleting
				if (text.length > 0) {
					setText(sentence.substring(0, text.length - 1));
				} else {
					// Finished deleting, move to next sentence
					setIsDeleting(false);
					setIndex((prevIndex) => (prevIndex + 1) % sentence.length);
				}
			}
		};

		const timeout = setTimeout(
			handleTyping,
			isDeleting ? deletingSpeed : typingSpeed,
		);

		// Cleanup timeout on component unmount or state change
		return () => clearTimeout(timeout);
	}, [text, isDeleting, index]);

	return (
		<div className="flex flex-wrap items-center font-mono font-bold min-h-[1.5rem] max-w-full">
			<AnimatePresence>
				{text.split("").map((char, i) => (
					<motion.span
						key={`${char}-${i}`}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.05 }}
						className="min-w-[0.5rem]"
					>
						{char}
					</motion.span>
				))}
			</AnimatePresence>

			{/* Blinking Cursor */}
			<motion.span
				className="w-0.5 h-5 bg-current rounded-full ml-1"
				animate={{ opacity: [0, 1, 0] }}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}

function ProfileCard() {
	return (
		<motion.div
			initial={{ rotateX: -90 }}
			animate={{ rotateX: 0 }}
			exit={{ rotateX: 90 }}
			transition={{ duration: 0.5 }}
			className="col-span-4 lg:col-span-1 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] "
		>
			<div className="relative mb-4">
				<img
					alt="Profile Banner"
					className="h-36 w-full object-cover border-2"
					src="/banners/profile.avif"
					loading="eager"
					decoding="async"
					fetchPriority="high"
				/>

				<div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-8 border-white dark:border-zinc-900 rounded-full">
					<img
						loading="eager"
						decoding="async"
						src="/profile_picture.avif"
						alt="Profile Picture"
						width={200}
						height={200}
						className="max-w-35 max-h-35 rounded-full border-3 dark:border-white object-cover"
						fetchPriority="high"
					/>
				</div>
			</div>

			<div className="p-4 pt-18 flex flex-col items-center justify-center">
				<h2 className="text-xl font-bold ">
					{import.meta.env.VITE_FULL_NAME || "Ketut Shridhara"}
				</h2>
				<h3 className="text-md font-semibold mb-2">
					({import.meta.env.VITE_NICKNAME || "Kiuyha"})
				</h3>
				<TypingAnimation
					sentence={
						import.meta.env.VITE_TITLE ||
						"Developer | Data Scientist"
					}
				/>
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
			className="px-4 py-8 col-span-4 lg:col-span-3 flex flex-col gap-8 bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] "
		>
			<CollapsedContent
				title={translations?.["about-me"] || "About Me"}
				Icon={Info}
				initialOpen
			>
				<p className="semibold text-justify">
					{translations?.["about-me-description"] ||
						`A developer specializing in Web and Data Science. I build
					intelligent web applications and turn data into meaningful
					insights. Based in Indonesia.`}
				</p>
			</CollapsedContent>

			<CollapsedContent
				title={
					translations?.["personal-info"] || "Personal Information"
				}
				Icon={UserSearch}
			>
				<div className="space-y-2">
					<p className="semibold text-justify">
						<strong>
							{translations?.["personal-info-address"] ||
								"Address:"}
						</strong>
						{translations?.["personal-info-address-value"] ||
							"Surabaya, Jawa Timur, Indonesia"}
					</p>
					<p className="semibold text-justify">
						<strong>
							{translations?.["personal-info-email"] || "Email:"}
						</strong>
						{translations?.["personal-info-email-value"] ||
							"ketutshridhara@gmail.com"}
					</p>
					<p className="semibold text-justify">
						<strong>
							{translations?.["personal-info-birth-date"] ||
								"Birth Date:"}
						</strong>
						{translations?.["personal-info-birth-date-value"] ||
							"12 Maret 2007"}
					</p>
				</div>
			</CollapsedContent>

			<CollapsedContent
				title={translations?.["education"] || "Education"}
				Icon={GraduationCap}
			>
				<div className="flex flex-col md:flex-row w-full justify-center gap-12">
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
										{/* Icon with background to "cut" the line */}
										<div className="bg-white dark:bg-zinc-900 p-1 rounded-full border-2 border-zinc-200 dark:border-zinc-800 md:mx-auto">
											<CircleCheck
												className="text-blue-600 dark:text-blue-500"
												size={30}
												strokeWidth={2}
											/>
										</div>

										{/* Text content */}
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

function Projects() {
	const {
		projects,
		translations: { projects: translations, sorting },
	} = useData();
	const [type, setType] = useState("");
	const [techStack, setTechStack] = useState("");
	const [sort, setSort] = useState("newest");
	const types = useMemo(() => {
		return [...new Set(projects.map((project) => project.type))].sort();
	}, [projects]);

	const techStacks = useMemo(() => {
		return [
			...new Set(projects.flatMap((project) => project.tech_stack)),
		].sort();
	}, [projects]);
	return (
		<ListCards
			title={translations?.["projects-list"] || "Projects List"}
			dataSet={projects}
			searchConfig={{
				placeholder:
					translations?.["search-placeholder"] || "Search by name",
				fieldSearch: "name",
			}}
			filterConfig={{
				canReset: true,
				selectField: [
					{
						name: "type",
						label: translations?.["type"] || "type",
						ariaLabel: "choose type of project",
						options: types.map((type) => ({
							label: type,
							value: type,
						})),
						setValue: setType,
						value: type,
					},
					{
						name: "tech_stack",
						label: translations?.["tech-stack"] || "tech_stack",
						ariaLabel: "choose tech stack",
						options: techStacks.map((techStack) => ({
							label: techStack,
							value: techStack,
						})),
						setValue: setTechStack,
						value: techStack,
					},
					{
						name: "sort",
						label: sorting?.["sort-by"] || "Sort By",
						ariaLabel: "sort projects by",
						options: [
							{
								label: sorting?.["newest"] || "newest",
								value: "newest",
							},
							{
								label: sorting?.["oldest"] || "Oldest",
								value: "oldest",
							},
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
						],
						setValue: setSort,
						value: sort,
					},
				],
			}}
			cardConfig={{
				titleField: "name",
				imageField: "thumbnail",
				placeholderImage: "/placeholders/project.avif",
				buttons: {
					leftButton: (data) =>
						(() => {
							const Icon = (() => {
								switch (data.type) {
									case "website":
										return Globe;
									case "cli_tool":
										return TerminalSquare;
									case "ml_model":
										return BrainCircuit;
									default:
										return Info;
								}
							})();
							return (
								<Button
									ariaLabel="type of project"
									tooltip={data.type}
								>
									<Icon size={25} />
								</Button>
							);
						})(),
					rightButton: (data, setOpenModal) => (
						<>
							<Button
								ariaLabel="view details of project"
								onClick={() => setOpenModal(true)}
							>
								<Info size={15} />
							</Button>
							{data.github_link && (
								<Button
									href={data.github_link}
									ariaLabel={`Github link for project ${data.name}`}
								>
									<img
										src="/icons/github.svg"
										alt="github"
										width={15}
										height={15}
										className="dark:invert"
									/>
								</Button>
							)}
							{data.link && (
								<Button
									href={data.link}
									ariaLabel={`External link for project ${data.name}`}
								>
									<ExternalLink size={15} />
								</Button>
							)}
						</>
					),
				},
			}}
			modal={(project, setOpenModal) => (
				<DetailsModal
					close={() => setOpenModal(false)}
					data={project}
					translations={translations}
					descriptionField="description"
					titleField="name"
					tagsField="tech_stack"
					externalLinkField="link"
					mediaPanel={
						project.type === "website" ? (
							<IframeMedia link={project.link} />
						) : (
							<ImagesSlider
								images={[project.thumbnail, ...project.images]}
								placeholderImage="/placeholders/project.avif"
							/>
						)
					}
				/>
			)}
		/>
	);
}