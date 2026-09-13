import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
	translations?: Record<string, string>;
}

export default function LoadingScreen({ translations }: LoadingScreenProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [imgError, setImgError] = useState(false);

	useEffect(() => {
		const dismiss = () => {
			document.body.classList.remove("overflow-hidden");
			setIsVisible(false);
		};

		if (document.readyState === "complete") {
			dismiss();
			return;
		}

		document.body.classList.add("overflow-hidden");
		window.addEventListener("load", dismiss, { once: true });
		document.addEventListener("DOMContentLoaded", dismiss, { once: true });
		document.addEventListener("astro:page-load", dismiss, { once: true });

		const timer = setTimeout(dismiss, 200);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("load", dismiss);
			document.removeEventListener("DOMContentLoaded", dismiss);
			document.removeEventListener("astro:page-load", dismiss);
			document.body.classList.remove("overflow-hidden");
		};
	}, []);

	if (!isVisible) return null;

	return (
		<div className="inset-0 fixed z-999 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
			<div className="flex flex-col items-center text-black dark:text-white">
				{imgError ? (
					<LoaderCircle size={100} className="animate-spin mb-4" />
				) : (
					<img
						alt="Loading animation"
						width={200}
						height={200}
						src="/animations/loading.avifs"
						loading="eager"
						decoding="async"
						fetchPriority="high"
						onError={() => setImgError(true)}
					/>
				)}
				<p className="text-2xl font-bold">
					{translations?.["loading"] || "Loading..."}
				</p>
			</div>
		</div>
	);
}
