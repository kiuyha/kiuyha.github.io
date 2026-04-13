import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	ExternalLink,
	X,
} from "lucide-react";
import Button from "./Button";

interface DetailsModalProps<TData extends Record<string, unknown>> {
	close: () => void;
	data: TData;
	translations: Record<string, string>;
	titleField: keyof TData;
	descriptionField: string;
	tagsField?: keyof TData; // For tech_stack or skills
    externalLinkField?: keyof TData;
    mediaPanel: React.ReactNode;
}

export default function DetailsModal<TData extends Record<string, unknown>>({
	close,
	data,
	translations,
	titleField,
	descriptionField,
	tagsField,
	externalLinkField,
    mediaPanel,
}: DetailsModalProps<TData>) {
	const { currentLang } = useData();
	const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
	const tags =
		tagsField && data[tagsField] && Array.isArray(data[tagsField])
			? (data[tagsField] as string[])
			: [];
	const description = data[`${descriptionField}_${currentLang}`] as string;
	const externalLink = externalLinkField
		? (data[externalLinkField] as string)
		: undefined;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			className="inset-0 z-200 fixed flex items-center justify-center bg-black/50 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="h-full w-full bg-white dark:bg-zinc-900 overflow-auto"
			>
				{/* Header */}
				<div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-900 border-b-4 dark:border-zinc-600">
					<span className="font-bold text-lg uppercase">
						{data?.[titleField] as string}
					</span>
					<button
						type="button"
						aria-label="Close details"
						className="cursor-pointer"
						onClick={close}
					>
						<X size={26} />
					</button>
				</div>

				{/* Main Content Grid */}
				<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Left Panel (Details) */}
					<div className="flex flex-col border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
						{tags.length > 0 && (
							<div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b-2 dark:border-zinc-600">
								{tags.map((tag: string) => (
									<span
										key={tag}
										className="text-sm font-semibold px-3 py-1 rounded-full border-2 border-dashed dark:border-white bg-zinc-100 dark:bg-zinc-800"
									>
										{tag.trim()}
									</span>
								))}
							</div>
						)}

						{description && (
							<div className="flex flex-col flex-1">
								<button
									type="button"
									aria-label="Toggle collapsed content"
									onClick={() =>
										setIsDescriptionOpen((prev) => !prev)
									}
									className="px-4 py-2 cursor-pointer rounded-full flex items-center justify-between gap-2 w-full"
								>
									<h2 className="text-2xl font-bold">
										{translations?.["description"] ||
											"Description"}
									</h2>
									<ChevronDown
										size={20}
										className={`${isDescriptionOpen ? "rotate-180" : ""} transition-transform duration-300 ease-in-out`}
									/>
								</button>
								<AnimatePresence>
									{isDescriptionOpen && (
										<motion.span
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.2 }}
											className="text-justify px-4 py-2 border-t-2 md:border-none dark:border-zinc-600 pt-4"
										>
											{description}
										</motion.span>
									)}
								</AnimatePresence>
							</div>
						)}
					</div>

					{/* Right Panel (Media) */}
					<div className="p-4 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
						<div className="border-2 dark:border-zinc-600">
							{/* Browser Header */}
							<div className="flex items-center justify-between px-4 py-2 border-b-4 dark:border-zinc-600">
								<div className="flex items-center gap-2">
									<div className="rounded-full w-4 h-4 bg-red-500" />
									<div className="rounded-full w-4 h-4 bg-yellow-500" />
									<div className="rounded-full w-4 h-4 bg-green-500" />
								</div>
								{externalLink && (
									<Button
										isLink
										href={externalLink}
										aria-label="Open in a new tab"
									>
										<ExternalLink size={15} />
									</Button>
								)}
							</div>

							{mediaPanel}
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
