import { motion, type Variants } from "framer-motion";

const defaultTooltipVariants: Variants = {
	hidden: {
		opacity: 0,
		y: -10,
		transition: { duration: 0.2 },
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.2 },
	},
};

interface ButtonProps {
	href?: string;
	isLink?: boolean;
	ariaLabel?: string;
	parentVariance?: Variants;
	tooltipVariants?: Variants;
	tooltip?: string;
	children: React.ReactNode;
	className?: string;
	target?: string;
	rel?: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
	[key: string]: unknown;
}

const defaultParentVariance = {
	hidden: {
		scale: 1,
		transition: { duration: 0.2 },
	},
	visible: {
		scale: 0.9,
		transition: { duration: 0.2 },
	},
};

export default function Button(props: ButtonProps) {
	const {
		href,
		isLink,
		children,
		className = "",
		parentVariance,
		tooltipVariants,
		ariaLabel,
		tooltip,
		target,
		rel,
		...rest
	} = props;
	const Component = href || isLink ? motion.a : motion.button;

	return (
		<Component
			initial="hidden"
			aria-label={ariaLabel}
			whileHover="visible"
			variants={parentVariance || defaultParentVariance}
			className={`cursor-pointer px-3 py-2 flex items-center gap-2 bg-zinc-200 dark:bg-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}
			{...(href
				? {
						href,
						...(href.startsWith("mailto:")
							? {}
							: {
									target: target ?? "_blank",
									rel: rel ?? "noopener noreferrer",
								}),
					}
				: {})}
			{...rest}
		>
			{tooltip && (
				<motion.div
					variants={tooltipVariants || defaultTooltipVariants}
					className="px-1.5 py-1 absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 rounded-md border-2 border-zinc-900 dark:border-zinc-300
												after:content-[''] after:absolute after:-bottom-1/2 after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-zinc-900 dark:after:border-t-zinc-300"
				>
					<span className="text-sm font-bold text-nowrap uppercase">
						{tooltip}
					</span>
				</motion.div>
			)}

			{children}
		</Component>
	);
}
