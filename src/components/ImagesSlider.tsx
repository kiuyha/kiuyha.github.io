import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ImagesSlider({
	images,
	placeholderImage,
}: {
	images: string[];
	placeholderImage: string;
}) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [imageLoading, setImageLoading] = useState(true);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const startInterval = () => {
        // Clear any existing timer
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        // Set a new timer
        intervalRef.current = setInterval(() => {
            // avoid dependency issues since if we call handleNext directly it will cause an infinite loop
            setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 10000);
    };

	const handlePrevious = () => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
		startInterval();
	};

	// Function to show the next image
	const handleNext = () => {
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
		startInterval();
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
		startInterval();
	}

	useEffect(() => {
		setImageLoading(true);
	}, [currentIndex]);

	useEffect(() => {
        if (images && images.length > 0) {
            setCurrentIndex(0);
            setImageLoading(true);
            startInterval();

            // Preload images for a smoother experience
            images.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [images]);

	if (!images || images.length === 0) {
		return null;
	}

	return (
		<div className="relative w-full">
			{/* skeleton image */}
			{imageLoading && (
				<div className="absolute inset-0 animate-pulse bg-zinc-600 dark:bg-zinc-800" />
			)}

			<img
				src={images[currentIndex] || placeholderImage}
				alt="project"
				width={400}
				height={250}
				loading="lazy"
				decoding="async"
				className={`w-full h-full object-contain transition-opacity duration-300
						${imageLoading ? "opacity-0" : "opacity-100"}`}
				onError={(e) => {
					setImageLoading(false);
					e.currentTarget.src = placeholderImage;
				}}
				onLoad={() => setImageLoading(false)}
			/>

			{images.length > 1 && (
				<>
					{/* Left/Previous Button */}
					{currentIndex > 0 && (
						<button
							onClick={handlePrevious}
							className="cursor-pointer absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
							aria-label="Previous Image"
						>
							<ChevronLeft size={20} />
						</button>
					)}

					{/* Right/Next Button */}
					{currentIndex < images.length - 1 && (
						<button
							onClick={handleNext}
							className="cursor-pointer absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
							aria-label="Next Image"
						>
							<ChevronRight size={20} />
						</button>
					)}

					{/* Dots */}
				</>
			)}
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
				{images.map((_, index) => (
					<button
						key={index}
						aria-label={`Go to slide ${index + 1}`}
						onClick={() => goToSlide(index)}
						className={`cursor-pointer w-3 h-3 hover:bg-white rounded-full transition-colors duration-300
							${index === currentIndex ? "bg-white" : "bg-white/70"}
						`}
					/>
				))}
			</div>
		</div>
	);
}
