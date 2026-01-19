import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LoadingScreen() {
	const [imgError, setImgError] = useState(false);
	const loadingRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.body.classList.add("overflow-hidden");

		const removeLoading = () => {
			document.body.classList.remove("overflow-hidden");
			loadingRef.current?.remove();
		};

		if (document.readyState === "complete") {
			console.log("okay")
			removeLoading();
		} else {
			window.addEventListener("load", removeLoading);
			return () => window.removeEventListener("load", removeLoading);
		}
	}, []);

	return (
		<div
			ref={loadingRef}
			className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900"
		>
			<div className="flex flex-col items-center text-black dark:text-white">
				{imgError ? (
					<LoaderCircle size={100} className="animate-spin mb-4" />
				) : (
					<img
						width={200}
						height={200}
						src="/animations/loading.avifs"
						loading="eager"
						decoding="async"
						fetchPriority="high"
						onError={() => setImgError(true)}
					/>
				)}
				<p className="text-2xl font-bold">Loading...</p>
			</div>
		</div>
	);
}
