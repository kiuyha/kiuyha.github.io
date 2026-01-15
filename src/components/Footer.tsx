import { AtSign, Ghost, Mail, Send, User, X } from "lucide-react";
import Button from "./Button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function Footer() {
	const [showEmailModal, setShowEmailModal] = useState(false);

	return (
		<footer className="flex flex-col gap-6 items-center justify-center py-10 border-t-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-xl pb-25 md:pb-40">
			<div className="flex items-center gap-2">
				<Button
					href={
						import.meta.env.VITE_GITHUB_LINK ||
						"https://github.com/kiuyha"
					}
					aria-label="see my github profile"
				>
					<img
						src="/github.svg"
						alt="github"
						width={25}
						height={25}
						className="dark:invert"
					/>
				</Button>

				<Button
					href={
						import.meta.env.VITE_LINKEDIN_LINK ||
						"https://www.linkedin.com/in/ketut-shridhara-46bb792a5"
					}
					aria-label="see my linkedin profile"
				>
					<img
						src="/linkedin.svg"
						alt="linkedin"
						width={25}
						height={25}
						className="dark:invert"
					/>
				</Button>

				<Button
					href={
						import.meta.env.VITE_MEDIUM_LINK ||
						"https://medium.com/@kiuyha"
					}
					aria-label="see my medium articles"
				>
					<img
						src="/medium.svg"
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
							close={() => setShowEmailModal(false)}
							// email={
							// 	details?.["personal-info-email-value"] ||
							// 	"ketutshridhara@gmail.com"
							// }
						/>
					)}
				</AnimatePresence>
			</div>

			<div className="flex flex-col items-center">
				<span className="font-semibold">
					&copy; {new Date().getFullYear()}{" "}
					{import.meta.env.VITE_FULL_NAME || "Ketut Shridhara"}
				</span>
				<span className="text-sm">All rights reserved</span>
			</div>
		</footer>
	);
}

function EmailModal({ close }: { close: () => void }) {
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [loading, setLoading] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formRef.current) return;
		setLoading(true);

		emailjs.init({
			publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
			blockHeadless: true,
			limitRate: {
				throttle: 1000,
			}
		});

		try {
			await emailjs.sendForm(
				import.meta.env.VITE_EMAILJS_SERVICE_ID,
				import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
				formRef.current,
			);
			alert("Message sent successfully!");
			close();
		} catch (error) {
			console.error(error);
			alert("Failed to send message.");
		}
		setLoading(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				close();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [modalRef]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="inset-0 z-100 fixed flex items-center justify-center bg-black/50 backdrop-blur-sm"
		>
			<motion.div
				ref={modalRef}
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
				className="w-full md:w-1/2 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
			>
				{/* Header */}
				<div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-900 border-b-4 border-zinc-900 dark:border-zinc-600">
					<h1 className="font-bold text-lg uppercase flex items-center gap-2">
						<Mail className="stroke-[3px]" size={20} />
						Drop a Message
					</h1>
					<button
						type="button"
						aria-label="Close modal"
						className="cursor-pointer"
						onClick={close}
					>
						<X size={26} strokeWidth={3} />
					</button>
				</div>

				{/* Form Content */}
				<form
					ref={formRef}
					onSubmit={handleSubmit}
					className="p-6 flex flex-col gap-4"
				>
					{/* Anonymous Toggle */}
					<div
						onClick={() => setIsAnonymous(!isAnonymous)}
						className={`
                            cursor-pointer flex items-center gap-3 p-3 border-2 border-zinc-900 dark:border-zinc-600 
                            transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                            ${isAnonymous ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-800"}
                        `}
					>
						<Ghost size={20} />
						<span className="font-bold uppercase text-sm select-none">
							{isAnonymous
								? "Sending Anonymously"
								: "Identify Yourself"}
						</span>
						<div
							className={`ml-auto w-4 h-4 border-2 ${isAnonymous ? "border-white bg-white" : "border-zinc-900 dark:border-zinc-400"}`}
						/>
					</div>

					{/* Email Field */}
					<AnimatePresence mode="popLayout">
						{isAnonymous ? (
							<div className="hidden">
								<input type="text" name="name" value="Anonymous" readOnly hidden />
								<input type="text" name="email" value="no-reply@anonymous.com" readOnly hidden />
							</div>
						) : (
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex flex-col gap-1 flex-1">
									<label htmlFor="name" className="font-bold text-xs uppercase dark:text-zinc-300">
										Your Name
									</label>
									<div className="flex items-center border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800">
										<div className="p-3 bg-zinc-100 dark:bg-zinc-700">
											<User size={24} />
										</div>
										<input
											id="name"
											name="name"
											type="text"
											required={!isAnonymous}
											placeholder="Your Name"
											className="p-3 outline-none bg-transparent placeholder:text-zinc-400"
										/>
									</div>
								</div>
								<div className="flex flex-col gap-1 flex-1">
									<label htmlFor="email" className="font-bold text-xs uppercase dark:text-zinc-300">
										Your Email
									</label>
									<div className="flex items-center border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800">
										<div className="p-3 bg-zinc-100 dark:bg-zinc-700">
											<AtSign size={24} />
										</div>
										<input
											id="email"
											name="email"
											type="email"
											required={!isAnonymous}
											placeholder="you@example.com"
											className="p-3 outline-none bg-transparent placeholder:text-zinc-400"
										/>
									</div>
								</div>
							</div>
						)}
					</AnimatePresence>

					{/* Subject Field */}
					<div className="flex flex-col gap-1">
						<label htmlFor="subject" className="font-bold text-xs uppercase dark:text-zinc-300">
							Subject
						</label>
						<input
							id="subject"
							name="subject"
							type="text"
							placeholder="Your Subject"
							className="p-3 outline-none bg-transparent placeholder:text-zinc-400 border-2 border-zinc-900 dark:border-zinc-600 dark:bg-zinc-800"
						/>
					</div>

					{/* Message Field */}
					<div className="flex flex-col gap-1">
						<label htmlFor="message" className="font-bold text-xs uppercase dark:text-zinc-300">
							Message
						</label>
						<textarea
							id="message"
							name="message"
							required
							rows={10}
							placeholder="Type something..."
							className="p-3 border-2 border-zinc-900 dark:border-zinc-600 outline-none bg-white dark:bg-zinc-800 dark:text-white"
						/>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading}
						className="cursor-pointer
                            group flex items-center justify-center gap-2 py-3 mt-2
                            bg-zinc-900 text-white dark:bg-white dark:text-black 
                            font-black text-lg border-2 border-zinc-900 dark:border-zinc-600
                            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all
                        "
					>
						{loading ? "SENDING..." : "SEND IT"}
						{!loading && (
							<Send
								size={24}
								className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"
							/>
						)}
					</button>
				</form>
			</motion.div>
		</motion.div>
	);
}
