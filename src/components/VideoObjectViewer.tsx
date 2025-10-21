import React, { useRef, useState, useEffect } from 'react';

interface VideoObjectViewerProps {
  videoUrl: string;
  className?: string;
  hotspots?: Array<{
    x: string;
    y: string;
    label: string;
    frame?: number;
    timeStart?: number;
    timeEnd?: number;
    onClick?: () => void;
  }>;
}

const VideoObjectViewer: React.FC<VideoObjectViewerProps> = ({ 
  videoUrl,
  className = 'w-full h-96',
  hotspots = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const animationRef = useRef<number>();
  const momentumRef = useRef<number>();

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);
    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  // Filter visible hotspots based on current time
  const visibleHotspots = hotspots.filter(hotspot =>
    (hotspot.timeStart !== undefined && hotspot.timeEnd !== undefined)
      ? (currentTime >= hotspot.timeStart && currentTime <= hotspot.timeEnd)
      : true // Show always if no time defined
  );

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(e.clientX);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !videoRef.current) return;
    
    const deltaX = lastX - e.clientX;
    const newVelocity = deltaX * 0.2;
    setVelocity(newVelocity);
    
    const sensitivity = 800;
    const duration = videoRef.current.duration || 1;
    const timeChange = (deltaX * duration) / sensitivity;
    
    let newTime = videoRef.current.currentTime + timeChange;
    
    // Seamless looping for 360 effect
    if (newTime < 0) {
      newTime = duration + newTime;
    } else if (newTime >= duration) {
      newTime = newTime - duration;
    }
    
    videoRef.current.currentTime = newTime;
    setLastX(e.clientX);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    const currentTime = videoRef.current?.currentTime || 0;
    
    console.log(`Video clicked at: x: '${x}%', y: '${y}%', time: ${currentTime.toFixed(2)}s`);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Smooth momentum for 360 effect
    if (Math.abs(velocity) > 0.3) {
      let currentVelocity = velocity;
      const applyMomentum = () => {
        if (!videoRef.current || Math.abs(currentVelocity) < 0.05) return;
        
        const sensitivity = 800;
        const duration = videoRef.current.duration || 1;
        const timeChange = (currentVelocity * duration) / sensitivity;
        
        let newTime = videoRef.current.currentTime + timeChange;
        
        // Seamless looping
        if (newTime < 0) {
          newTime = duration + newTime;
        } else if (newTime >= duration) {
          newTime = newTime - duration;
        }
        
        videoRef.current.currentTime = newTime;
        currentVelocity *= 0.98; // Smoother friction
        momentumRef.current = requestAnimationFrame(applyMomentum);
      };
      
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
      }
      momentumRef.current = requestAnimationFrame(applyMomentum);
    }
    
    setVelocity(0);
  };

  return (
    <div className={className}>
      <div 
        className="relative w-full h-full bg-black rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleVideoClick}
      >
        {videoUrl.includes('youtube.com') ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1]}`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <video 
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover pointer-events-none"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        
        {/* Hotspots */}
        {visibleHotspots.map((hotspot, index) => (
          <div key={index}>
            <div
              className="absolute bg-black/70 text-white text-lg px-4 py-2 rounded cursor-pointer hover:bg-black/90 transition-colors border border-white/50 whitespace-nowrap font-bold"
              style={{ left: hotspot.x, top: hotspot.y, transform: 'translate(-50%, -50%)' }}
              onClick={hotspot.onClick}
            >
              {hotspot.label}
            </div>
            {!hotspot.isBackButton && (
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Jakarta.svg"
                alt="Jakarta Logo"
                className="absolute w-12 h-12"
                style={{ left: hotspot.x, top: hotspot.y, transform: 'translate(-50%, 20px)' }}
              />
            )}
          </div>
        ))}

        {/* Instructions & Controls */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            🖱️ Drag to rotate • 🔵 Click hotspots • 🎥 360° Object Video
          </div>
          <button
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoObjectViewer;