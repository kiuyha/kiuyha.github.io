import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { Expand, RefreshCcw, ZoomIn, ZoomOut } from "lucide-react";

export function IframeMedia({ link }: { link: string }) {
	const [scale, setScale] = useState(1);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [errorIframe, setErrorIframe] = useState(false);
	const [limitScale, setLimitScale] = useState({
		min: window.innerWidth >= 768 ? 0.5 : 0.2,
		max: window.innerWidth >= 768 ? 1.5 : 0.8,
	});

	useEffect(() => {
		// adjust according to screen size since mobile screen is smaller, so the limit will be smaller
		const handleResize = () => {
			setLimitScale({
				min: window.innerWidth >= 768 ? 0.5 : 0.2,
				max: window.innerWidth >= 768 ? 1.5 : 0.8,
			});
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleReset = () => {
		setScale(1);
		if (iframeRef.current) {
			// refresh iframe
			iframeRef.current.src = link;
		}
	};

	const handleFullscreen = () => {
		if (iframeRef.current) {
			iframeRef.current.requestFullscreen();
		}
	};

	const handleZoomIn = () => {
		setScale((prev) => Math.min(limitScale.max, prev + 0.1));
	};

	const handleZoomOut = () => {
		setScale((prev) => Math.max(limitScale.min, prev - 0.1));
	};

	return (
		<>
			<div className="h-[600px] relative">
				{errorIframe ? (
					<div className="flex items-center justify-center w-full h-full">
						<h2 className="text-2xl font-bold">
							{
								"Error load the website, try to refresh using the refresh button"
							}
						</h2>
					</div>
				) : (
					<iframe
						ref={iframeRef}
						src={link}
						loading="lazy"
						width="100%"
						height="100%"
						className="absolute top-0 left-0 w-full h-full"
						style={{ zoom: `${scale}` }}
						onError={() => setErrorIframe(true)}
					/>
				)}
			</div>

			<div className="flex items-center justify-between gap-2 px-4 py-2 border-t-4 dark:border-zinc-600">
				<div className="flex items-center gap-2">
					<Button
						type="button"
						aria-label="Refresh the website"
						onClick={handleReset}
					>
						<RefreshCcw size={15} />
					</Button>
					<Button
						type="button"
						aria-label="Make the website fullscreen"
						onClick={handleFullscreen}
					>
						<Expand size={15} />
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<Button
						type="button"
						aria-label="Zoom out the website"
						onClick={() => handleZoomOut()}
					>
						<ZoomOut size={15} />
					</Button>

					<Button
						type="button"
						aria-label="Zoom in the website"
						onClick={handleZoomIn}
					>
						<ZoomIn size={15} />
					</Button>
				</div>
			</div>
		</>
	);
}