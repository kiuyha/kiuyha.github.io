import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, File, RefreshCcw, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface CardConfig<TData extends Record<string, unknown>> {
	titleField?: keyof TData;
	imageField: keyof TData;
	placeholderImage: string;
	buttons: {
		leftButton?: (
			data: TData,
			setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
		) => React.ReactNode;
		rightButton?: (
			data: TData,
			setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
		) => React.ReactNode;
	};
}

export interface SelectFieldConfig<TData extends Record<string, unknown>> {
	name: string;
	label: string;
	ariaLabel?: string;
	options: {
		label: string;
		value: string;
		sortingMethod?: (a: TData, b: TData) => number;
	}[];
	setValue: React.Dispatch<React.SetStateAction<string>>;
	value: string;
}

interface ListCardsProps<TData extends Record<string, unknown>> {
	title: string;
	dataSet: TData[];
	searchConfig?: {
		placeholder: string;
		fieldSearch: keyof TData | (keyof TData)[];
	};
	filterConfig: {
		canReset?: boolean;
		selectField: SelectFieldConfig<TData>[];
	};
	cardConfig?: CardConfig<TData>;
	CustomCard?: (
		data: TData,
		index: number,
		search: string,
		modal?: (
			data: TData,
			setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
		) => React.ReactNode,
	) => React.ReactNode;
	modal?: (
		data: TData,
		setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
	) => React.ReactNode;
}

function getValueByPath(
	obj: unknown,
	path: string | string[],
): unknown {
	const parts = Array.isArray(path) ? path : path.split(".");
	const [currentPart, ...remainingParts] = parts;

	if (obj == null || currentPart === undefined) {
		return obj;
	}

	if (currentPart === "*") {
		if (!Array.isArray(obj)) {
			return undefined;
		}
		return obj.map((item) => getValueByPath(item, remainingParts));
	}

	if (
		typeof obj === "object" &&
		currentPart in (obj as Record<string, unknown>)
	) {
		return getValueByPath(
			(obj as Record<string, unknown>)[currentPart],
			remainingParts,
		);
	}

	return undefined;
}

export default function ListCards<TData extends Record<string, unknown>>({
	title,
	dataSet,
	searchConfig,
	filterConfig,
	cardConfig,
	CustomCard,
	modal,
}: ListCardsProps<TData>) {
	const titleCardKey =
		cardConfig && (cardConfig.titleField as string | undefined);
	const [search, setSearch] = useState("");
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const groupedSelectFields = useMemo(() => {
		const result = [];
		const chunkSize = 2;
		for (let i = 0; i < filterConfig.selectField.length; i += chunkSize) {
			result.push(filterConfig.selectField.slice(i, i + chunkSize));
		}
		return result;
	}, [filterConfig.selectField]);

	const processedData = useMemo(() => {
		const filtered = dataSet.filter((data) => {
			const inFilter = filterConfig.selectField.every((select) => {
				if (select.name === "sort") return true; // Skip the sort field
				const value = getValueByPath(data, select.name);
				const checkIfArray = Array.isArray(value);
				return (
					select.value === "" ||
					(checkIfArray
						? (value as string[]).includes(select.value)
						: value === select.value)
				);
			});

			const inSearch =
				search === "" ||
				(Array.isArray(searchConfig?.fieldSearch)
					? searchConfig.fieldSearch.some((field) =>
							(data[field] as string)
								?.toLowerCase()
								?.includes(search.toLowerCase()),
						)
					: (data[searchConfig?.fieldSearch || "name"] as string)
							?.toLowerCase()
							?.includes(search.toLowerCase()));

			return inFilter && inSearch;
		});

		// Find the select field that controls sorting
		const sortController = filterConfig.selectField.find(
			(field) => field.name === "sort",
		);
		const selectedValue = sortController?.value;
		const selectedOption = sortController?.options.find(
			(opt) => opt.value === selectedValue,
		);
		const activeSortMethod = selectedOption?.sortingMethod;

		if (activeSortMethod) {
			return [...filtered].sort(activeSortMethod);
		} else if (selectedValue === "oldest") {
			// If "Oldest" is selected, return the original filtered order.
			return filtered;
		} else {
			// For any other case (including the default 'newest-default'), reverse.
			return filtered.reverse();
		}
	}, [
		dataSet,
		search,
		filterConfig.selectField,
		searchConfig,
	]);

	return (
		<div className="col-span-full flex flex-col gap-4">
			{/* Headline of the section */}
			<motion.div
				initial={{ rotateX: -90 }}
				animate={{ rotateX: 0 }}
				exit={{ rotateX: 90 }}
				transition={{ duration: 0.5 }}
				className="font-semibold px-4 py-2 flex gap-2 items-center bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
			>
				<File size={25} />
				<h1 className="text-md">{title}</h1>
				<p>({processedData.length})</p>
			</motion.div>

			<div
				className={`flex flex-col gap-2 ${searchConfig ? "lg:flex-row lg:bg-white lg:dark:bg-zinc-900 lg:border-2 dark:border-zinc-600 lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : ""}`}
			>
				{/* Search bar */}
				{searchConfig && (
					<motion.div
						initial={{ rotateX: -90 }}
						animate={{ rotateX: 0 }}
						exit={{ rotateX: 90 }}
						transition={{ duration: 0.5 }}
						whileTap={{ scale: 0.95 }}
						aria-label="Search bar"
						className="px-4 py-2 flex-1 flex gap-2 items-center bg-white dark:bg-zinc-900 border-2 lg:border-0 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:shadow-none"
					>
						<Search size={25} />
						<input
							type="search"
							placeholder={searchConfig.placeholder}
							className="w-full bg-transparent outline-none font-semibold"
							value={search}
							onChange={(e) => {
								e.preventDefault();
								setSearch(e.target.value);
							}}
						/>
					</motion.div>
				)}

				{/* Filters */}
				{groupedSelectFields.map((group, groupIndex) => (
					<motion.div
						key={groupIndex}
						initial={{ rotateX: -90 }}
						animate={{ rotateX: 0 }}
						exit={{ rotateX: 90 }}
						transition={{ duration: 0.5 }}
						className={`flex items-center bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative ${
							group.some((f) => f.name === openDropdown)
								? "z-40"
								: "z-10"
						} ${searchConfig ? "lg:border-0 lg:shadow-none" : ""}`}
					>
						{group.map((field, index) => (
							<SearchableSelect
								key={field.name + index}
								field={field}
								index={index}
								searchConfig={Boolean(searchConfig)}
								isOpen={openDropdown === field.name}
								onToggle={() =>
									setOpenDropdown((prev) =>
										prev === field.name ? null : field.name,
									)
								}
								onClose={() => setOpenDropdown(null)}
							/>
						))}

						{/* Reset filters */}
						{filterConfig.canReset &&
							groupIndex === groupedSelectFields.length - 1 && (
								<motion.button
									onClick={(e) => {
										e.preventDefault();
										filterConfig.selectField.forEach(
											(field) => {
												field.setValue("");
											},
										);
										setSearch("");
										setOpenDropdown(null);
									}}
									whileHover={{ scale: 0.9 }}
									aria-label="reset filters"
									className="cursor-pointer border-l-4 px-4 py-2 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
								>
									<RefreshCcw size={25} />
								</motion.button>
							)}
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<AnimatePresence>
					{processedData.map((data, index) => {
						const key = titleCardKey
							? String(data?.[titleCardKey])
							: index;

						if (CustomCard) {
							return (
								<React.Fragment key={key}>
									{CustomCard(data, index, search, modal)}
								</React.Fragment>
							);
						}
						if (cardConfig) {
							return (
								<Card
									key={key}
									data={data}
									index={index}
									modal={modal}
									search={search}
									cardConfig={cardConfig}
									titleCardKey={titleCardKey}
								/>
							);
						}
						return null;
					})}
				</AnimatePresence>
			</div>
		</div>
	);
}

interface SearchableSelectProps<TData extends Record<string, unknown>> {
	field: SelectFieldConfig<TData>;
	index: number;
	searchConfig: boolean;
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}

function SearchableSelect<TData extends Record<string, unknown>>({
	field,
	index,
	searchConfig,
	isOpen,
	onToggle,
	onClose,
}: SearchableSelectProps<TData>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => {
				searchRef.current?.focus();
			}, 50);
			return () => clearTimeout(timer);
		} else {
			setSearchTerm("");
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	const filteredOptions = useMemo(() => {
		if (!searchTerm.trim()) return field.options;
		const term = searchTerm.trim().toLowerCase();
		return field.options.filter(
			(opt) =>
				opt.label.toLowerCase().includes(term) ||
				opt.value.toLowerCase().includes(term) ||
				opt.label.replace(/[-_]/g, " ").toLowerCase().includes(term),
		);
	}, [field.options, searchTerm]);

	const selectedOption = field.options.find(
		(opt) => opt.value === field.value,
	);

	const displayLabel = selectedOption
		? selectedOption.label.replace(/[-_]/g, " ")
		: field.name === "sort"
			? field.options[0]?.label.replace(/[-_]/g, " ") || field.label
			: field.label.replace(/[-_]/g, " ");

	return (
		<div
			ref={containerRef}
			className={`relative flex-1 min-w-0 h-full ${isOpen ? "z-50" : "z-10"}`}
		>
			<button
				type="button"
				onClick={onToggle}
				aria-label={field.ariaLabel || field.label}
				aria-expanded={isOpen}
				title={displayLabel}
				className={`w-full min-w-0 flex items-center justify-between gap-1.5 px-3 py-2 text-sm lg:text-base font-semibold uppercase cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition outline-none dark:border-zinc-600 ${
					searchConfig ? "lg:border-l-4" : ""
				} ${index === 1 ? "border-l-4" : ""}`}
			>
				<span className="truncate text-left">{displayLabel}</span>
				<div className="flex items-center gap-1 shrink-0 ml-1">
					{field.name !== "sort" && field.value !== "" && (
						<span
							role="button"
							tabIndex={0}
							onClick={(e) => {
								e.stopPropagation();
								field.setValue("");
								onClose();
							}}
							className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
							title="Clear filter"
						>
							<X size={14} />
						</span>
					)}
					<ChevronDown
						size={18}
						className={`transition-transform duration-200 text-zinc-500 dark:text-zinc-400 ${
							isOpen ? "rotate-180" : ""
						}`}
					/>
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15 }}
						className={`absolute top-full mt-1.5 w-full min-w-[220px] max-w-xs z-50 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col ${
							index === 1 ? "sm:right-0 sm:left-auto" : "left-0"
						}`}
					>
						{/* Search input if options count >= 3 */}
						{field.options.length >= 3 && (
							<div className="p-2 border-b-2 border-zinc-200 dark:border-zinc-700 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800">
								<Search size={14} className="text-zinc-400 shrink-0" />
								<input
									ref={searchRef}
									type="text"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder={`Search...`}
									className="w-full bg-transparent outline-none text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 uppercase"
								/>
								{searchTerm && (
									<button
										type="button"
										onClick={() => setSearchTerm("")}
										className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
									>
										<X size={14} />
									</button>
								)}
							</div>
						)}

						{/* Options list */}
						<div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
							{field.name !== "sort" && (
								<button
									type="button"
									onClick={() => {
										field.setValue("");
										onClose();
									}}
									className={`w-full text-left px-3 py-2 text-xs lg:text-sm font-semibold uppercase flex items-center justify-between transition cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
										field.value === ""
											? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold"
											: ""
									}`}
								>
									<span className="truncate mr-2">
										{`ALL ${field.label.replace(/[-_]/g, " ")}`}
									</span>
									{field.value === "" && (
										<Check
											size={14}
											className="shrink-0 text-blue-600 dark:text-blue-400"
										/>
									)}
								</button>
							)}

							{filteredOptions.length === 0 ? (
								<div className="px-3 py-3 text-xs text-center text-zinc-400 dark:text-zinc-500 font-medium uppercase">
									No matches found
								</div>
							) : (
								filteredOptions.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => {
											field.setValue(opt.value);
											onClose();
										}}
										className={`w-full text-left px-3 py-2 text-xs lg:text-sm font-semibold uppercase flex items-center justify-between transition cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
											field.value === opt.value
												? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold"
												: ""
										}`}
									>
										<span className="truncate mr-2">
											{opt.label.replace(/[-_]/g, " ")}
										</span>
										{field.value === opt.value && (
											<Check
												size={14}
												className="shrink-0 text-blue-600 dark:text-blue-400"
											/>
										)}
									</button>
								))
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

interface CardProps<T extends Record<string, unknown>> {
	data: ListCardsProps<T>["dataSet"][number];
	index: number;
	modal?: ListCardsProps<T>["modal"];
	search: string;
	cardConfig: CardConfig<T>;
	titleCardKey: string | undefined;
}

function Card<T extends Record<string, unknown>>({
	data,
	index,
	modal,
	search,
	cardConfig,
	titleCardKey,
}: CardProps<T>) {
	const [openModal, setOpenModal] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);
	function Highlight({ text }: { text: string }) {
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
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2, delay: index * 0.08 }}
			className="flex flex-col bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
		>
			<div
				className="group relative flex-1"
				onClick={() => setOpenModal(true)}
			>
				{/* skeleton image */}
				{imageLoading && (
					<div className="absolute inset-0 animate-pulse bg-zinc-600 dark:bg-zinc-800" />
				)}

				{/* image */}
				<img
					src={
						(data?.[cardConfig.imageField] as string) ||
						cardConfig.placeholderImage
					}
					alt="Card"
					width={400}
					height={250}
					loading="lazy"
					decoding="async"
					className={`w-full h-full object-cover transition-opacity duration-300
						${imageLoading ? "opacity-0" : "opacity-100"}`}
					onError={(e) => {
						setImageLoading(false);
						e.currentTarget.src = cardConfig.placeholderImage;
					}}
					onLoad={() => setImageLoading(false)}
				/>

				{/* Overlay on hover */}
				{titleCardKey && (data?.[titleCardKey] as string) && (
					<>
						<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
						<div className="absolute inset-0 flex items-center justify-center text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
							<span className="font-bold text-xl text-center uppercase">
								{data?.[titleCardKey] as string}
							</span>
						</div>
					</>
				)}
			</div>

			{titleCardKey && (data?.[titleCardKey] as string) && (
				<span className="px-4 py-3 border-t-4 border-zinc-900 dark:border-zinc-600 font-bold text-xl text-center uppercase">
					<Highlight text={data?.[titleCardKey] as string} />
				</span>
			)}

			{(cardConfig.buttons.leftButton ||
				cardConfig.buttons.rightButton) && (
				<div className="flex justify-between px-4 py-2 border-t-4 dark:border-zinc-600">
					<div className="flex items-center gap-2">
						{cardConfig.buttons.leftButton &&
							cardConfig.buttons.leftButton(data, setOpenModal)}
					</div>

					<div className="flex items-center gap-2">
						{cardConfig.buttons.rightButton &&
							cardConfig.buttons.rightButton(data, setOpenModal)}
					</div>
				</div>
			)}

			<AnimatePresence>
				{openModal && modal && modal(data, setOpenModal)}
			</AnimatePresence>
		</motion.div>
	);
}
