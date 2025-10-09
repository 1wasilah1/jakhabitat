import React, { useEffect, useRef } from 'react';
import * as PANOLENS from 'panolens';

interface PanoramaViewerProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  className?: string;
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ 
  frontImageUrl = '/jakhabitat/gedung/depan.png',
  backImageUrl = '/jakhabitat/gedung/belakang.png',
  className = 'w-full h-96'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frontImg = new Image();
    const backImg = new Image();
    let loadedImages = 0;
    
    const createPanorama = () => {
      if (loadedImages !== 2) return;
      
      canvas.width = frontImg.width * 2;
      canvas.height = frontImg.height;
      
      // Draw back image (0° - 180°)
      ctx.drawImage(backImg, 0, 0);
      
      // Draw front image (180° - 360°)
      ctx.drawImage(frontImg, backImg.width, 0);
      
      // Create panorama from combined canvas
      const panorama = new PANOLENS.ImagePanorama(canvas.toDataURL());
      
      // Create viewer
      const viewer = new PANOLENS.Viewer({
        container: containerRef.current,
        autoRotate: true,
        autoRotateSpeed: 0.3,
        controlBar: false,
        cameraFov: 90,
      });
      
      // Adjust camera distance
      viewer.camera.position.set(0, 0, 50);

      viewer.add(panorama);
      viewerRef.current = viewer;
    };
    
    frontImg.onload = () => {
      loadedImages++;
      createPanorama();
    };
    
    backImg.onload = () => {
      loadedImages++;
      createPanorama();
    };
    
    frontImg.src = frontImageUrl;
    backImg.src = backImageUrl;

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
    };
  }, [frontImageUrl, backImageUrl]);

  return <div ref={containerRef} className={className} />;
};

export default PanoramaViewer;