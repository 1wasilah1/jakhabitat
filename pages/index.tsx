import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface LandingIcon {
  id: string;
  name: string;
  src: string;
  x: number;
  y: number;
  link: string;
  width: number;
  height: number;
}

const Landing: React.FC = () => {
  const [icons, setIcons] = useState<LandingIcon[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const res = await fetch('/api/landing-icons');
        const data = await res.json();
        setIcons(data.icons || []);
      } catch (error) {
        console.error('Failed to load icons:', error);
      }
    };
    loadIcons();
  }, []);

  useEffect(() => {
    if (isPaused || icons.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % icons.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isPaused, icons.length]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Landing Image */}
      <div className="w-full h-full relative">
        <img 
          src="/landing/Screen 2.jpg" 
          alt="Landing" 
          className="w-full h-full object-cover"
        />
        

        
        {/* Logos */}
        <div className="absolute top-4 left-4 flex gap-2 items-center z-10">
          <img 
            src="/logo-dprkp.png" 
            alt="DPRKP" 
            className="w-16 h-16"
          />
          <img 
            src="/jaya-raya.png" 
            alt="Jaya Raya" 
            className="w-16 h-16"
          />
          <img 
            src="/logo-updp.png" 
            alt="UPDP" 
            className="h-16 w-auto"
          />
        </div>
        
        {/* Dynamic Icon Overlays */}
        <div className="absolute inset-0">
          {icons.map((icon) => {
            const getTransform = () => {
              if (icon.x === 0) return 'translateX(-50%)';
              if (icon.x === 100) return 'translateX(50%)';
              if (icon.y === 0) return 'translate(-50%, -50%)';
              if (icon.y === 100) return 'translate(-50%, 50%)';
              return 'translate(-50%, -50%)';
            };

            const getPosition = () => {
              const style: React.CSSProperties = {
                transform: getTransform()
              };
              
              if (icon.x === 0) {
                style.left = '0%';
                style.top = `${icon.y}%`;
              } else if (icon.x === 100) {
                style.right = '0%';
                style.top = `${icon.y}%`;
              } else if (icon.y === 0) {
                style.top = '0%';
                style.left = `${icon.x}%`;
              } else if (icon.y === 100) {
                style.bottom = '0%';
                style.left = `${icon.x}%`;
              } else {
                style.left = `${icon.x}%`;
                style.top = `${icon.y}%`;
              }
              
              return style;
            };

            const iconIndex = icons.indexOf(icon);
            const isActive = hoveredIndex !== null ? hoveredIndex === iconIndex : iconIndex === activeIndex;
            
            return (
              <img 
                key={icon.id}
                src={icon.src} 
                alt={icon.name} 
                className={`absolute cursor-pointer hover:scale-110 transition-all duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  ...getPosition(),
                  width: `${icon.width * 4}px`,
                  height: `${icon.height * 4}px`
                }}
                onMouseEnter={() => {
                  setIsPaused(true);
                  setHoveredIndex(iconIndex);
                }}
                onMouseLeave={() => {
                  setIsPaused(false);
                  setHoveredIndex(null);
                }}
                onClick={() => {
                  if (icon.link) {
                    window.location.href = icon.link;
                  }
                }}
              />
            );
          })}
        </div>
        

      </div>
    </div>
  );
};

export default Landing;