import React, { useEffect, useRef, useState } from 'react';

interface Object360ViewerProps {
  images: string[];
  className?: string;
  hotspots?: Array<{
    x: string;
    y: string;
    label: string;
    frame: number;
    onClick?: () => void;
  }>;
}

const Object360Viewer: React.FC<Object360ViewerProps> = ({ 
  images,
  className = 'w-full h-96',
  hotspots = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Auto rotation
  useEffect(() => {
    if (!isAutoRotating) return;
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % images.length);
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoRotating, images.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    const frameChange = Math.floor(deltaX / sensitivity);
    
    if (Math.abs(frameChange) > 0) {
      setCurrentFrame(prev => {
        let newFrame = prev - frameChange;
        if (newFrame < 0) newFrame = images.length - 1;
        if (newFrame >= images.length) newFrame = 0;
        return newFrame;
      });
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    
    console.log(`Hotspot coordinates: x: '${x}%', y: '${y}%', frame: ${currentFrame + 1}`);
  };

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-black rounded-lg overflow-hidden cursor-grab"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      >
        <img 
          src={images[currentFrame]}
          alt={`Object view ${currentFrame + 1}`}
          className="w-full h-full object-cover transition-opacity duration-75"
          draggable={false}
        />
        


        {/* Frame indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
          {currentFrame + 1} / {images.length}
        </div>

        {/* Hotspots */}
        {hotspots
          .filter(hotspot => {
            // Always show carousel arrows (frame 1) and other hotspots within range
            return hotspot.frame === 1 || Math.abs((currentFrame + 1) - hotspot.frame) <= 50;
          })
          .map((hotspot, index) => (
            <div
              key={index}
              className="absolute bg-black/70 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-black/90 transition-colors border border-white/50 whitespace-nowrap"
              style={{ left: hotspot.x, top: hotspot.y, transform: 'translate(-50%, -50%)' }}
              onClick={hotspot.onClick}
            >
              {hotspot.label}
            </div>
          ))
        }

        {/* Controls & Instructions */}
        <div className="absolute bottom-4 left-12 flex flex-col gap-2">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`w-6 h-6 rounded-full text-xs transition-colors flex items-center justify-center ${
              isAutoRotating 
                ? 'bg-blue-600 text-white' 
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            {isAutoRotating ? '⏸️' : '▶️'}
          </button>
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            🖱️ Drag to rotate • 🔄 Auto rotation
          </div>
        </div>
      </div>
    </div>
  );
};

export default Object360Viewer;