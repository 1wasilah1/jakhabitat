import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSlideshowProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export const ImageSlideshow = ({ images, autoPlay = true, interval = 5000 }: ImageSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        
        {/* Search Bar Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
          <div className="flex bg-white rounded-full shadow-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search properties..."
              className="flex-1 px-6 py-4 text-gray-700 focus:outline-none"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 font-medium transition-colors">
              search
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Perspective Cards at Bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end space-x-4 pb-20">
        {/* Left Card */}
        <div className="w-32 h-20 bg-gradient-to-r from-orange-300 to-orange-400 rounded-lg shadow-lg transform rotate-12 -translate-y-2"></div>
        
        {/* Center Card */}
        <div className="w-40 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-xl z-10"></div>
        
        {/* Right Card */}
        <div className="w-32 h-20 bg-gradient-to-r from-orange-300 to-orange-400 rounded-lg shadow-lg transform -rotate-12 -translate-y-2"></div>
      </div>
    </div>
  );
};