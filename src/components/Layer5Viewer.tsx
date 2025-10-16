import React, { useState, useEffect } from 'react';
import PanoramaLayer from './PanoramaLayer';

interface Layer5ViewerProps {
  onBack: () => void;
  selectedUnit: string;
}

const Layer5Viewer: React.FC<Layer5ViewerProps> = ({ onBack, selectedUnit }) => {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [currentMediaId, setCurrentMediaId] = useState<number | null>(null);
  const [currentPanorama, setCurrentPanorama] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load media files
      const mediaResponse = await fetch('http://localhost:3001/api/data/media');
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        const layer5Media = mediaData.media.filter((m: any) => 
          m.type === 'panorama360' && m.layerId === 5 && 
          (!selectedUnit || m.unitName === selectedUnit)
        );
        setMediaFiles(layer5Media);
        
        // Set default panorama (lorong first)
        const defaultPanorama = layer5Media.find((m: any) => m.roomType === 'lorong') || layer5Media[0];
        if (defaultPanorama) {
          setCurrentMediaId(defaultPanorama.id);
          setCurrentPanorama(defaultPanorama);
        }
      }

      // Load hotspots
      const hotspotsResponse = await fetch('http://localhost:3001/api/data/hotspots');
      if (hotspotsResponse.ok) {
        const hotspotsData = await hotspotsResponse.json();
        setHotspots(hotspotsData.hotspots || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const getCurrentHotspots = () => {
    if (!currentMediaId) return [];
    
    const mediaHotspots = hotspots.filter((h: any) => h.mediaId === currentMediaId);
    
    return mediaHotspots.map((hotspot: any) => ({
      x: `${hotspot.x}%`,
      y: `${hotspot.y}%`,
      label: hotspot.title,
      frame: 1,
      onClick: () => {
        console.log('Layer 5 hotspot clicked:', hotspot);
        
        if (hotspot.type === 'link' && hotspot.targetMediaId) {
          const targetMedia = mediaFiles.find(m => m.id === hotspot.targetMediaId);
          if (targetMedia) {
            console.log('Switching to panorama:', targetMedia.name);
            // Add small delay to prevent race condition
            setTimeout(() => {
              setCurrentMediaId(targetMedia.id);
              setCurrentPanorama(targetMedia);
            }, 100);
          } else {
            alert(`Target panorama not found (ID: ${hotspot.targetMediaId})`);
          }
        } else {
          alert(hotspot.description || hotspot.title);
        }
      }
    }));
  };

  if (!currentPanorama) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-2xl font-bold">Loading Layer 5...</div>
        </div>
      </div>
    );
  }

  return (
    <PanoramaLayer
      key={currentMediaId} // Force re-render when media changes
      imageUrl={currentPanorama.url}
      hotspots={getCurrentHotspots()}
      onBack={onBack}
    />
  );
};

export default Layer5Viewer;