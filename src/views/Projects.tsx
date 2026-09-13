import {
	Globe,
	TerminalSquare,
	ExternalLink,
	BrainCircuit,
	Info,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DataProvider, useData, type Data } from "../contexts/DataContext";
import ListCards from "../components/ListCards";
import Button from "../components/Button";
import ImagesSlider from "../components/ImagesSlider";
import DetailsModal from "../components/DetailsModal";
import { IframeMedia } from "../components/IframeMedia";

export default function ProjectsView({ data }: { data: Data }) {
	return (
		<DataProvider initialData={data}>
			<ProjectsContent />
		</DataProvider>
	);
}

function ProjectsContent() {
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
						options: types.map((t) => ({
							label: t,
							value: t,
						})),
						setValue: setType,
						value: type,
					},
					{
						name: "tech_stack",
						label: translations?.["tech-stack"] || "tech_stack",
						ariaLabel: "choose tech stack",
						options: techStacks.map((ts) => ({
							label: ts,
							value: ts,
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
					leftButton: (projectData) =>
						(() => {
							const Icon = (() => {
								switch (projectData.type) {
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
									tooltip={projectData.type}
								>
									<Icon size={25} />
								</Button>
							);
						})(),
					rightButton: (projectData, setOpenModal) => (
						<>
							<Button
								ariaLabel="view details of project"
								onClick={() => setOpenModal(true)}
							>
								<Info size={15} />
							</Button>
							{projectData.github_link && (
								<Button
									href={projectData.github_link}
									ariaLabel={`Github link for project ${projectData.name}`}
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
							{projectData.link && (
								<Button
									href={projectData.link}
									ariaLabel={`External link for project ${projectData.name}`}
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
