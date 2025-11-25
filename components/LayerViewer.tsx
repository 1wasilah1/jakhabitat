import React, { useState, useEffect } from 'react';
import Video360Viewer from './Video360Viewer';
import PanoramaViewer from './PanoramaViewer';

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
  targetLinkId?: string;
  targetScene?: string;
}

interface LayerViewerProps {
  onModeChange?: (isPanoramaMode: boolean) => void;
  targetPanoramaId?: string | null;
}

const LayerViewer: React.FC<LayerViewerProps> = ({ onModeChange, targetPanoramaId }) => {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [layer2Links, setLayer2Links] = useState<any[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);


  useEffect(() => {
    if (currentLayer === 2) {
      fetch('/api/layers/layer2')
        .then(res => res.json())
        .then(data => {
          console.log('Layer2 data:', data);
          setLayer2Links(data.links || []);
        })
        .catch(err => console.error('Failed to load layer2 links:', err));
    } else if (currentLayer === 8) {
      fetch('/api/layers/game')
        .then(res => res.json())
        .then(data => {
          console.log('Game data:', data);
          setGameData(data);
        })
        .catch(err => console.error('Failed to load game data:', err));
    }
  }, [currentLayer]);

  useEffect(() => {
    if (targetPanoramaId) {
      setSelectedProjectId(targetPanoramaId);
      switchToLayer(4);
    }
  }, [targetPanoramaId]);

  const switchToLayer = (layer: number) => {
    setCurrentLayer(layer);
    onModeChange?.(layer >= 4);
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.targetLayer === 2 && hotspot.targetLinkId) {
      setSelectedLinkId(hotspot.targetLinkId);
      switchToLayer(2);
    } else if (hotspot.targetLayer === 4 && hotspot.targetScene) {
      // Navigate to specific panorama project
      setSelectedProjectId(hotspot.targetScene);
      switchToLayer(4);
    } else if (hotspot.targetLayer) {
      switchToLayer(hotspot.targetLayer);
    } else if (hotspot.targetUrl) {
      window.open(hotspot.targetUrl, '_blank');
    }
  };

  if (currentLayer === 4) {
    return (
      <div className="w-full h-screen relative">
        <PanoramaViewer 
          projectId={selectedProjectId || undefined}
          onNavigate={(layer) => {
            if (layer) {
              switchToLayer(layer);
            }
          }}
        />
        
        <button
          className="absolute bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors z-10"
          style={{ left: '8%', top: '90%', transform: 'translate(-50%, -50%)' }}
          onClick={() => switchToLayer(1)}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  if (currentLayer === 5) {
    return (
      <div className="w-full h-screen relative">
        <iframe 
          src="/panorama/tes-1761226329843/app-files/index.html" 
          className="w-full h-full border-0"
          title="Panorama Viewer"
        />
        
        <button
          className="absolute bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors z-10"
          style={{ left: '8%', top: '90%', transform: 'translate(-50%, -50%)' }}
          onClick={() => switchToLayer(1)}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  if (currentLayer === 8) {
    return (
      <div className="w-full h-screen relative">
        <iframe 
          src="/game/game-selector.html"
          className="w-full h-full border-0"
          title="Game Center"
          allow="fullscreen; gamepad; microphone; camera"
        />
        
        <button
          className="absolute bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors z-10"
          style={{ left: '8%', top: '90%', transform: 'translate(-50%, -50%)' }}
          onClick={() => switchToLayer(1)}
        >
          ← Kembali
        </button>
      </div>
    );
  }



  if (currentLayer === 1) {
    return (
      <div className="relative">
        <Video360Viewer 
          videoSrc="/layer/layer1/dprkp.mp4"
          showControls={true}
          onHotspotClick={handleHotspotClick}
        />

      </div>
    );
  }

  if (currentLayer === 3) {
    return (
      <Video360Viewer 
        videoSrc="/layer/layer3/layer3.mp4"
        onBack={() => switchToLayer(1)}
        showControls={true}
        onHotspotClick={handleHotspotClick}
      />
    );
  }

  if (currentLayer === 2) {
    const firstLink = layer2Links[0];
    const iframeUrl = firstLink?.url;
    
    console.log('Layer2 data:', { layer2Links, firstLink, iframeUrl });
    
    return (
      <div className="w-full h-screen relative bg-gray-100">
        {layer2Links.length > 0 ? (
          <iframe 
            src={iframeUrl}
            className="w-full h-full border-0"
            title="Layer 2 Content"
            allow="fullscreen"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Loading...</h3>
            </div>
          </div>
        )}
        
        <button
          className="absolute bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors z-10"
          style={{ left: '8%', top: '90%', transform: 'translate(-50%, -50%)' }}
          onClick={() => switchToLayer(1)}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Layer {currentLayer}</h2>
        <button
          onClick={() => switchToLayer(1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Layer 1
        </button>
      </div>
    </div>
  );
};

export default LayerViewer;