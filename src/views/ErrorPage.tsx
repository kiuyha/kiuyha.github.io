import { motion } from "framer-motion";
import Background from "../components/Background";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function ErrorPage({
	error,
	errorCode,
}: {
	error: Error;
	errorCode?: string;
}) {
	return (
		<ThemeProvider>
			<div className="flex items-center justify-center min-h-screen">
				<Background />
				<div className="flex flex-col relative w-full h-screen text-black dark:text-white">
					<div className="flex flex-col justify-center items-center flex-grow text-center p-8">
						<h1 className="text-6xl font-bold">Oops!</h1>
						<p className="text-lg mt-4">{error.message}</p>
						{errorCode && (
							<div className="mt-2 flex items-center gap-2">
								<span>Error Code:</span>
								<span className="font-semibold">{errorCode}</span>
							</div>
						)}
						<div className="mt-6">
							<a href="/">
								<motion.span
									className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-black text-lg md:text-xl py-3 md:py-5 px-4 md:px-6 border-4 md:border-8
								border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]  transition-all disabled:opacity-70 flex items-center justify-center gap-2 md:gap-3"
									whileHover={{
										x: -2,
										y: -2,
										boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
									}}
									whileTap={{
										x: 0,
										y: 0,
										boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
									}}
								>
									Back to homepage
								</motion.span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
