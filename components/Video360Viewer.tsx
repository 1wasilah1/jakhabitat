import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Hotspot {
  id: string;
  x: string;
  y: string;
  label: string;
  timeStart: number;
  timeEnd: number;
  type?: string;
  targetType?: string;
  targetLayer?: number;
  targetUrl?: string;
  targetAsset?: string;
  targetScene?: string;
}

interface Video360ViewerProps {
  videoSrc: string;
  onBack?: () => void;
  showControls?: boolean;
  onHotspotClick?: (hotspot: Hotspot) => void;
}

const Video360Viewer: React.FC<Video360ViewerProps> = ({ 
  videoSrc, 
  onBack, 
  showControls = true,
  onHotspotClick 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => {
    setZoom(1);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Load hotspots for layer1 and layer3
  useEffect(() => {
    if (videoSrc.includes('layer1')) {
      fetch('/api/layers/layer1')
        .then(res => res.json())
        .then(data => setHotspots(data.hotspots || []))
        .catch(err => console.error('Failed to load hotspots:', err));
    } else if (videoSrc.includes('layer3')) {
      fetch('/api/layers/layer3')
        .then(res => res.json())
        .then(data => setHotspots(data.hotspots || []))
        .catch(err => console.error('Failed to load hotspots:', err));
    }
  }, [videoSrc]);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  // Get visible hotspots based on current time
  const visibleHotspots = hotspots.filter(hotspot => 
    currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd
  );

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
  }, []);

  const handleTouchMoveGlobal = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isDragging) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (dragStart.x !== 0) {
        const delta = (distance - dragStart.x) * 0.01;
        handleZoom(delta);
      }
      setDragStart({ x: distance, y: 0 });
    }
  }, [dragStart.x, handleZoom, isDragging]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !videoRef.current) return;
      const deltaX = e.clientX - dragStart.x;
      const video = videoRef.current;
      
      // Calculate new time based on drag distance (right = forward, left = backward)
      const timeChange = (-deltaX / window.innerWidth) * video.duration;
      const newTime = Math.max(0, Math.min(video.duration, video.currentTime + timeChange));
      
      video.currentTime = newTime;
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isDragging || e.target === videoRef.current) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel);
      container.addEventListener('touchmove', handleTouchMoveGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchmove', handleTouchMoveGlobal);
      }
    };
  }, [isDragging, dragStart, handleZoom, handleTouchMoveGlobal]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0 || !videoRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const video = videoRef.current;
    
    // Calculate new time based on drag distance (right = forward, left = backward)
    const timeChange = (-deltaX / window.innerWidth) * video.duration;
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + timeChange));
    
    video.currentTime = newTime;
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };



  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen relative bg-black overflow-hidden select-none video-360-container"
      style={{ perspective: '1000px' }}
    >
      <div
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
        style={{
          transform: `scale(${zoom})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video 
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          muted
          autoPlay={isPlaying}
          loop
          playsInline
          draggable={false}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        
        {/* Hotspots */}
        {visibleHotspots.map(hotspot => (
          <div
            key={hotspot.id}
            className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onHotspotClick?.(hotspot);
            }}
          >
            <div className="relative group">
              {hotspot.targetAsset ? (
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform overflow-hidden">
                  <img 
                    src={hotspot.targetAsset} 
                    alt={hotspot.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {hotspot.label || hotspot.title}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showControls && (
        <>
          {/* Control Instructions */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-3 rounded-lg text-sm max-w-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span className="hidden sm:inline">Drag kanan maju, kiri mundur</span>
                <span className="sm:hidden">Geser kanan/kiri</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Scroll/Pinch untuk zoom</span>
                <span className="sm:hidden">Pinch untuk zoom</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="absolute bottom-20 left-4 flex flex-col gap-2">
            <button
              className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors shadow-lg"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1" />
                </svg>
              )}
            </button>
            <button
              className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors shadow-lg"
              onClick={resetView}
              title="Reset View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Back Button */}
          {onBack && (
            <button
              className="absolute bottom-4 left-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-colors z-10"
              onClick={onBack}
            >
              ← Kembali
            </button>
          )}
        </>
      )}
      

      
      {/* Zoom Indicator */}
      {zoom !== 1 && (
        <div className="absolute top-16 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {Math.round(zoom * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default Video360Viewer;