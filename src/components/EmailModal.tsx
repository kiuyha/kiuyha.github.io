import { AtSign, Ghost, Mail, Send, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

interface EmailModalProps {
	close: () => void;
	translations?: Record<string, string>;
}

export default function EmailModal({ close, translations }: EmailModalProps) {
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [loading, setLoading] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formRef.current) return;
		setLoading(true);

		emailjs.init({
			publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY,
			blockHeadless: true,
			limitRate: {
				throttle: 1000,
			},
		});

		try {
			await emailjs.sendForm(
				import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
				import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
				formRef.current,
			);
			alert(
				translations?.["alert-success"] ||
					"Message sent successfully!",
			);
			close();
		} catch (error) {
			console.error(error);
			alert(
				translations?.["alert-failed"] || "Failed to send message.",
			);
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
	}, [close]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="inset-0 z-[300] fixed flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
		>
			<motion.div
				ref={modalRef}
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 20 }}
				transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
				className="w-full max-w-xl bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-auto"
			>
				{/* Header */}
				<div className="p-4 flex items-center justify-between bg-white dark:bg-zinc-900 border-b-4 border-zinc-900 dark:border-zinc-600">
					<span className="font-bold text-lg uppercase flex items-center gap-2">
						<Mail className="stroke-[3px]" size={20} />
						{translations?.["title"] || "Drop a Message"}
					</span>
					<button
						type="button"
						aria-label="Close modal"
						className="cursor-pointer p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
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
							transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none
							${isAnonymous ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-800"}
						`}
					>
						<Ghost size={20} />
						<span className="font-bold uppercase text-sm select-none">
							{isAnonymous
								? translations?.["anonymous-on"] ||
									"Sending Anonymously"
								: translations?.["anonymous-off"] ||
									"Identify Yourself"}
						</span>
						<div
							className={`ml-auto w-4 h-4 border-2 ${isAnonymous ? "border-white bg-white" : "border-zinc-900 dark:border-zinc-400"}`}
						/>
					</div>

					{/* Email Field */}
					{isAnonymous ? (
						<div className="hidden">
							<input
								type="text"
								name="name"
								value="Anonymous"
								readOnly
								hidden
							/>
							<input
								type="text"
								name="email"
								value="no-reply@anonymous.com"
								readOnly
								hidden
							/>
						</div>
					) : (
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex flex-col gap-1 flex-1">
								<label
									htmlFor="modal-name"
									className="font-bold text-xs uppercase dark:text-zinc-300"
								>
									{translations?.["name-label"] || "Your Name"}
								</label>
								<div className="flex items-center border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800">
									<div className="p-3 bg-zinc-100 dark:bg-zinc-700">
										<User size={20} />
									</div>
									<input
										id="modal-name"
										name="name"
										type="text"
										required={!isAnonymous}
										placeholder={
											translations?.["name-placeholder"] ||
											"Your Name"
										}
										className="p-2.5 outline-none bg-transparent w-full placeholder:text-zinc-400 text-sm"
									/>
								</div>
							</div>
							<div className="flex flex-col gap-1 flex-1">
								<label
									htmlFor="modal-email"
									className="font-bold text-xs uppercase dark:text-zinc-300"
								>
									{translations?.["email-label"] || "Your Email"}
								</label>
								<div className="flex items-center border-2 border-zinc-900 dark:border-zinc-600 bg-white dark:bg-zinc-800">
									<div className="p-3 bg-zinc-100 dark:bg-zinc-700">
										<AtSign size={20} />
									</div>
									<input
										id="modal-email"
										name="email"
										type="email"
										required={!isAnonymous}
										placeholder={
											translations?.["email-placeholder"] ||
											"you@example.com"
										}
										className="p-2.5 outline-none bg-transparent w-full placeholder:text-zinc-400 text-sm"
									/>
								</div>
							</div>
						</div>
					)}

					{/* Subject Field */}
					<div className="flex flex-col gap-1">
						<label
							htmlFor="modal-subject"
							className="font-bold text-xs uppercase dark:text-zinc-300"
						>
							{translations?.["subject-label"] || "Subject"}
						</label>
						<input
							id="modal-subject"
							name="subject"
							type="text"
							placeholder={
								translations?.["subject-placeholder"] ||
								"Your Subject"
							}
							className="p-2.5 outline-none bg-transparent placeholder:text-zinc-400 border-2 border-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 text-sm"
						/>
					</div>

					{/* Message Field */}
					<div className="flex flex-col gap-1">
						<label
							htmlFor="modal-message"
							className="font-bold text-xs uppercase dark:text-zinc-300"
						>
							{translations?.["message-label"] || "Message"}
						</label>
						<textarea
							id="modal-message"
							name="message"
							required
							rows={5}
							placeholder={
								translations?.["message-placeholder"] ||
								"Type something..."
							}
							className="p-3 border-2 border-zinc-900 dark:border-zinc-600 outline-none bg-white dark:bg-zinc-800 dark:text-white text-sm"
						/>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading}
						className="cursor-pointer
							group flex items-center justify-center gap-2 py-3 mt-2
							bg-zinc-900 text-white dark:bg-white dark:text-black 
							font-black text-base border-2 border-zinc-900 dark:border-zinc-600
							shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
							hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none
							disabled:opacity-50 disabled:cursor-not-allowed
							transition-all
						"
					>
						{loading
							? translations?.["sending"] || "SENDING..."
							: translations?.["send"] || "SEND IT"}
						{!loading && (
							<Send
								size={20}
								className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"
							/>
						)}
					</button>
				</form>
			</motion.div>
		</motion.div>
	);
}
