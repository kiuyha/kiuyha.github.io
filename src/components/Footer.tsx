import { Mail } from "lucide-react";
import Button from "./Button";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import EmailModal from "./EmailModal";

import type { Translations } from "../lib/schemas";

interface FooterProps {
	translations?: Translations;
}

export default function Footer({ translations }: FooterProps) {
	const [showEmailModal, setShowEmailModal] = useState(false);
	return (
		<footer className="flex flex-col gap-6 items-center justify-center py-10 border-t-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-xl pb-25 md:pb-40">
			<div className="flex items-center gap-2">
				<Button
					href={
						import.meta.env.PUBLIC_GITHUB_LINK ||
						"https://github.com/kiuyha"
					}
					aria-label="see my github profile"
				>
					<img
						src="/icons/github.svg"
						alt="github"
						width={25}
						height={25}
						className="dark:invert"
					/>
				</Button>

				<Button
					href={
						import.meta.env.PUBLIC_LINKEDIN_LINK ||
						"https://www.linkedin.com/in/ketut-shridhara-46bb792a5"
					}
					aria-label="see my linkedin profile"
				>
					<img
						src="/icons//linkedin.svg"
						alt="linkedin"
						width={25}
						height={25}
						className="dark:invert"
					/>
				</Button>

				<Button
					href={
						import.meta.env.PUBLIC_MEDIUM_LINK ||
						"https://medium.com/@kiuyha"
					}
					aria-label="see my medium articles"
				>
					<img
						src="/icons/medium.svg"
						alt="medium"
						width={25}
						height={25}
						className="dark:invert"
					/>
				</Button>

				<Button
					aria-label="send me an email"
					onClick={() => setShowEmailModal(true)}
				>
					<Mail size={25} />
				</Button>

				<AnimatePresence>
					{showEmailModal && (
						<EmailModal
							translations={translations?.email}
							close={() => setShowEmailModal(false)}
						/>
					)}
				</AnimatePresence>
			</div>

			<div className="flex flex-col items-center">
				<span className="font-semibold">
					&copy; {new Date().getFullYear()}{" "}
					{import.meta.env.PUBLIC_FULL_NAME || "Ketut Shridhara"}
				</span>
				<span className="text-sm">
					{translations?.common?.["all-rights-reserved"] ||
						"All rights reserved"}
				</span>
			</div>
		</footer>
	);
}

