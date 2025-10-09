import React, { useState } from 'react';

interface PanoramaLayerProps {
  imageUrl?: string;
  onBack: () => void;
}

const PanoramaLayer: React.FC<PanoramaLayerProps> = ({ 
  imageUrl = '/jakhabitat/layer/layer4/samawa-mg.jpg',
  onBack 
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX;
    setRotation(prev => (prev + deltaX * 0.3) % 360);
    setLastX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="w-full h-full transition-transform duration-75"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: '400% 100%',
            backgroundPosition: `${(rotation % 360) * 1.11}% center`,
            backgroundRepeat: 'repeat-x'
          }}
        />
      </div>
      
      <button
        onClick={onBack}
        className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2 z-10"
      >
        ← Back
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-10">
        🖱️ Drag to look around • Simple panorama view
      </div>
    </div>
  );
};

export default PanoramaLayer;