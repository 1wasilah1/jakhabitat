import React, { useRef, useState, useEffect } from 'react';

interface VideoTo360ViewerProps {
  videoUrl: string;
  className?: string;
  totalFrames?: number;
}

const VideoTo360Viewer: React.FC<VideoTo360ViewerProps> = ({ 
  videoUrl,
  className = 'w-full h-96',
  totalFrames = 360
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<number[]>([]);
  const [isFrameReady, setIsFrameReady] = useState(true);
  const [preloadedFrames, setPreloadedFrames] = useState<Set<number>>(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  // Auto rotation - only when video and current frame are ready
  useEffect(() => {
    if (!isAutoRotating || !isVideoReady || !isFrameReady) return;
    
    const interval = setInterval(() => {
      if (isFrameReady) {
        setCurrentFrame(prev => (prev + 1) % totalFrames);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isAutoRotating, totalFrames, isVideoReady, isFrameReady]);

  // Update video time based on frame - wait for seek to complete
  useEffect(() => {
    if (!videoRef.current || !isVideoReady) return;
    
    const video = videoRef.current;
    const duration = video.duration || 1;
    const timePerFrame = duration / totalFrames;
    const targetTime = currentFrame * timePerFrame;
    
    setIsFrameReady(false);
    
    const handleSeeked = () => {
      setIsFrameReady(true);
    };
    
    video.addEventListener('seeked', handleSeeked, { once: true });
    video.currentTime = targetTime;
    
    // Fallback timeout in case seeked event doesn't fire
    const timeout = setTimeout(() => {
      setIsFrameReady(true);
      video.removeEventListener('seeked', handleSeeked);
    }, 200);
    
    return () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [currentFrame, totalFrames, isVideoReady]);

  // Preload all frames
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    const handleCanPlayThrough = async () => {
      setIsPreloading(true);
      const duration = video.duration;
      const timePerFrame = duration / totalFrames;
      const preloaded = new Set<number>();
      
      // Preload every 10th frame first for faster initial load
      for (let i = 0; i < totalFrames; i += 10) {
        video.currentTime = i * timePerFrame;
        await new Promise(resolve => {
          const onSeeked = () => {
            preloaded.add(i);
            video.removeEventListener('seeked', onSeeked);
            resolve(void 0);
          };
          video.addEventListener('seeked', onSeeked);
        });
      }
      
      setPreloadedFrames(preloaded);
      setIsVideoReady(true);
      setIsPreloading(false);
      console.log('Key frames preloaded');
    };
    
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.preload = 'auto';
    video.load();
    
    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [totalFrames]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setLastX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastX;
    const sensitivity = 2;
    const frameChange = Math.round(deltaX / sensitivity);
    
    if (frameChange !== 0) {
      setCurrentFrame(prev => {
        let newFrame = prev + frameChange;
        if (newFrame < 0) newFrame = totalFrames + newFrame;
        if (newFrame >= totalFrames) newFrame = newFrame - totalFrames;
        return newFrame;
      });
      setLastX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={className}>
      <div 
        className="relative w-full h-full bg-black rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <video 
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />
        
        {/* Controls */}
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
            <div className="text-center text-white">
              <div className="text-4xl mb-4">🔄</div>
              <div className="text-2xl font-bold mb-2">Loading 360° View</div>
              <div className="text-sm opacity-70">
                {isPreloading ? `Preloading frames... ${preloadedFrames.size}/${Math.ceil(totalFrames/10)}` : 'Preparing video...'}
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
🔄 Drag to rotate • Frame: {currentFrame + 1}/{totalFrames} {!isVideoReady ? '• Loading...' : !isFrameReady ? '• Seeking...' : ''}
          </div>
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            {isAutoRotating ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoTo360Viewer;