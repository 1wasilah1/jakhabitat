import React, { useState, useEffect } from 'react';
import Object360Viewer from './Object360Viewer';
import PanoramaLayer from './PanoramaLayer';

const LayerViewer: React.FC = () => {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [availableLayers, setAvailableLayers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Layer1, layer2, layer3 and layer4 are available
    setAvailableLayers([1, 2, 3, 4]);
  }, []);

  const getLayerData = (layer: number) => {
    const frameCount = layer === 1 ? 1176 : layer === 2 ? 1176 : layer === 3 ? 1176 : layer === 4 ? 0 : 0;
    
    return {
      images: Array.from({length: frameCount}, (_, i) => 
        `/jakhabitat/layer/layer${layer}/frame_${String(i + 1).padStart(3, '0')}.jpg`
      ),
      hotspots: getHotspotsForLayer(layer)
    };
  };

  const switchToLayer = async (targetLayer: number) => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Simulate loading progress
    for (let i = 0; i <= 100; i += 10) {
      setLoadingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setCurrentLayer(targetLayer);
    setIsLoading(false);
    setLoadingProgress(0);
  };

  const getHotspotsForLayer = (layer: number) => {
    const hotspots = [];
    
    // Specific hotspots for layer1
    if (layer === 1) {
      hotspots.push({
        x: '41.7%',
        y: '46.2%',
        label: 'Layer 2',
        frame: 80,
        onClick: () => switchToLayer(2)
      });
    }
    
    // Specific hotspots for layer2
    if (layer === 2) {
      hotspots.push({
        x: '42.1%',
        y: '48.0%',
        label: 'Layer 3',
        frame: 59,
        onClick: () => switchToLayer(3)
      });
    }
    
    // Specific hotspots for layer3
    if (layer === 3) {
      hotspots.push({
        x: '71.2%',
        y: '42.1%',
        label: 'Layer 4',
        frame: 65,
        onClick: () => switchToLayer(4)
      });
    }
    

    
    // Add back navigation if not on first layer
    if (layer > 1) {
      const prevLayer = availableLayers.filter(l => l < layer).pop();
      if (prevLayer) {
        hotspots.push({
          x: '3%',
          y: '90%',
          label: `← Layer ${prevLayer}`,
          frame: 1,
          onClick: () => switchToLayer(prevLayer)
        });
      }
    }
    
    return hotspots;
  };

  const currentData = getLayerData(currentLayer);



  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-2xl font-bold mb-4">Loading Layer {currentLayer}...</div>
          <div className="w-64 bg-gray-700 rounded-full h-4 mb-2">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-lg">{loadingProgress}%</div>
        </div>
      </div>
    );
  }

  // Show panorama for layer 4
  if (currentLayer === 4) {
    return (
      <PanoramaLayer 
        onBack={() => switchToLayer(3)}
      />
    );
  }

  return (
    <Object360Viewer 
      images={currentData.images}
      className="w-full h-screen"
      hotspots={currentData.hotspots}
    />
  );
};

export default LayerViewer;