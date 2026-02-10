import { AnimatePresence, motion } from "framer-motion";
import { File, RefreshCcw, Search } from "lucide-react";
import React, { useMemo, useState } from "react";

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

interface ListCardsProps<TData extends Record<string, unknown>> {
	title: string;
	dataSet: TData[];
	searchConfig?: {
		placeholder: string;
		fieldSearch: keyof TData | (keyof TData)[];
	};
	filterConfig: {
		canReset?: boolean;
		selectField: {
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
		}[];
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
	const groupedSelectFields = useMemo(() => {
		const result = [];
		const chunkSize = 2;
		for (let i = 0; i < filterConfig.selectField.length; i += chunkSize) {
			result.push(filterConfig.selectField.slice(i, i + chunkSize));
		}
		return result;
	}, [filterConfig.selectField]);

	function getValueByPath(obj: any, path: string | string[]): any {
		// Convert path to an array if it's a string
		const parts = Array.isArray(path) ? path : path.split(".");

		// Destructure the first part and the rest of the path
		const [currentPart, ...remainingParts] = parts;

		// If the object is null/undefined or the path is exhausted, return the object
		if (obj == null || currentPart === undefined) {
			return obj;
		}

		if (currentPart === "*") {
			// If we hit a wildcard, the current value must be an array
			if (!Array.isArray(obj)) {
				return undefined;
			}
			// Map over the array and recursively call the function for each item
			// with the rest of the path. This will collect the results.
			return obj.map((item) => getValueByPath(item, remainingParts));
		}

		// If it's a normal key, just move to the next level of the object
		// and recurse with the rest of the path.
		return getValueByPath(obj[currentPart], remainingParts);
	}

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
		...filterConfig.selectField.map((select) => select.value),
	]);

	return (
		<div className="col-span-full flex flex-col gap-4">
			{/* Headline of the section */}
			<motion.div
				initial={{ rotateX: -90 }}
				animate={{ rotateX: 0 }}
				exit={{ rotateX: 90 }}
				transition={{ duration: 0.5 }}
				className="font-semibold  px-4 py-2 flex gap-2 items-center bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
						className={`flex gap-2 items-center bg-white dark:bg-zinc-900 border-2 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
							${searchConfig ? "lg:border-0 lg:shadow-none" : ""}`}
					>
						{group.map((field, index) => (
							<motion.select
								key={field.name + index}
								whileTap={{ scale: 0.95 }}
								value={field.value}
								onChange={(e) => {
									e.preventDefault();
									field.setValue(e.target.value);
								}}
								aria-label={field.ariaLabel}
								title={
									field.options.find(
										(opt) => opt.value === field.value,
									)?.label || field.label
								}
								className={`min-w-0 flex-1 text-sm lg:text-base truncate cursor-pointer px-2 py-2 font-semibold uppercase h-full dark:border-zinc-600 outline-none
									${searchConfig ? "lg:border-l-4" : ""} ${index === 1 ? "border-l-4" : ""}`}
							>
								{field.name !== "sort" && (
									<option
										value=""
										className="dark:bg-zinc-900"
									>
										{field.label
											.replace("_", " ")
											.toUpperCase()}
									</option>
								)}

								{field.options.map((option, index) => (
									<option
										key={index}
										value={option.value}
										className="dark:bg-zinc-900"
									>
										{option.label
											.replace("_", " ")
											.toUpperCase()}
									</option>
								))}
							</motion.select>
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
									}}
									whileHover={{ scale: 0.9 }}
									aria-label="reset filters"
									className="cursor-pointer border-l-4 px-4 py-2 dark:border-zinc-600"
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
							<h1 className="font-bold text-xl text-center uppercase">
								{data?.[titleCardKey] as string}
							</h1>
						</div>
					</>
				)}
			</div>

			{titleCardKey && (data?.[titleCardKey] as string) && (
				<div className="px-4 py-3 border-t-4 border-zinc-900 dark:border-zinc-600">
					<h1 className="font-bold text-xl text-center uppercase">
						<Highlight text={data?.[titleCardKey] as string} />
					</h1>
				</div>
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
