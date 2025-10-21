import React, { useState, useEffect } from 'react';
import Object360Viewer from './Object360Viewer';
import PanoramaLayer from './PanoramaLayer';
import Layer5Viewer from './Layer5Viewer';
import MarzipanoViewer from './MarzipanoViewer';
import VideoObjectViewer from './VideoObjectViewer';

interface LayerViewerProps {
  onModeChange?: (isPanoramaMode: boolean) => void;
}

const LayerViewer: React.FC<LayerViewerProps> = ({ onModeChange }) => {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [availableLayers, setAvailableLayers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [layersData, setLayersData] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [panoramaKey, setPanoramaKey] = useState(0);
  const [forceReload, setForceReload] = useState(false);
  const [targetMediaId, setTargetMediaId] = useState<number | null>(null);

  useEffect(() => {
    // Detect environment and set API base URL
    const getApiBaseUrl = () => {
      return window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api' 
        : 'https://dprkp.jakarta.go.id/jakhabitat/api';
    };
    
    // Load layers data from backend or fallback to static file
    const loadLayers = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/data/layers`);
        if (response.ok) {
          const data = await response.json();
          setLayersData(data.layers || []);
          setAvailableLayers((data.layers || []).map((layer: any) => layer.id));
        } else {
          throw new Error('Backend not available');
        }
      } catch (error) {
        console.error('Failed to load layers from backend, trying static file:', error);
        try {
          const staticResponse = await fetch('/data/layers.json');
          if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            setLayersData(staticData.layers || []);
            setAvailableLayers((staticData.layers || []).map((layer: any) => layer.id));
          }
        } catch (staticError) {
          console.error('Failed to load layers from static file:', staticError);
        }
      }
    };
    
    loadLayers();

    // Load hotspots from backend
    const loadHotspots = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/data/hotspots`);
        if (response.ok) {
          const data = await response.json();
          setHotspots(data.hotspots || []);
        }
      } catch (error) {
        console.error('Failed to load hotspots:', error);
      }
    };
    
    loadHotspots();

    // Load media files from backend
    const loadMedia = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/data/media`);
        if (response.ok) {
          const data = await response.json();
          setMediaFiles(data.media || []);
        }
      } catch (error) {
        console.error('Failed to load media:', error);
      }
    };
    
    loadMedia();
  }, []);

  const getLayerData = (layer: number) => {
    return {
      hotspots: getHotspotsForLayer(layer)
    };
  };

  const switchToLayer = async (targetLayer: number) => {
    const baseLayer = Math.floor(targetLayer);
    
    // Skip loading for panorama layers
    if (baseLayer === 4 || baseLayer === 5) {
      setCurrentLayer(targetLayer);
      return;
    }
    
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
    const layerHotspots = [];
    
    // For panorama layers (4,5), only use media hotspots
    if (layer === 4 || layer === 5) {
      let panoramaMedia;
      
      if (targetMediaId) {
        // Use specific media if selected via hotspot
        panoramaMedia = mediaFiles.find(m => m.id === targetMediaId);
        console.log('Using targetMediaId:', targetMediaId, 'found media:', panoramaMedia);
        setTargetMediaId(null); // Clear after use
      } else {
        // Default selection - prioritize 'lorong' room type
        panoramaMedia = mediaFiles.find(m => 
          m.type === 'panorama360' && m.layerId === layer && 
          (!selectedUnit || m.unitName === selectedUnit) &&
          m.roomType === 'lorong'
        );
        
        // If no lorong found, get any panorama for this layer/unit
        if (!panoramaMedia) {
          panoramaMedia = mediaFiles.find(m => 
            m.type === 'panorama360' && m.layerId === layer && 
            (!selectedUnit || m.unitName === selectedUnit)
          );
        }
        
        console.log('Using default media selection (lorong first):', panoramaMedia);
      }
      

      
      if (panoramaMedia) {
        // Use hotspots from state
        try {
          const mediaHotspots = hotspots.filter((h: any) => h.mediaId === panoramaMedia.id);
            
          console.log('=== HOTSPOT DEBUG ===');
          console.log('Current panorama media ID:', panoramaMedia.id);
          console.log('Current panorama media:', panoramaMedia);
          console.log('All hotspots from backend:', hotspots);
          console.log('Filtered hotspots for this media:', mediaHotspots);
          console.log('Number of hotspots found:', mediaHotspots.length);
          
          // Check each hotspot data
          mediaHotspots.forEach((h, i) => {
            console.log(`Raw hotspot ${i} from backend:`, h);
            console.log(`Hotspot ${i} parsed:`, {
              id: h.id,
              type: h.type,
              targetMediaId: h.targetMediaId,
              title: h.title,
              x: h.x,
              y: h.y,
              hasType: !!h.type,
              hasTargetMediaId: !!h.targetMediaId
            });
          });
          
          mediaHotspots.forEach((hotspot: any) => {
            console.log('Processing media hotspot:', hotspot);
            
            const hotspotData = {
              x: `${hotspot.x}%`,
              y: `${hotspot.y}%`,
              label: hotspot.title,
              frame: 1,
              onClick: () => {
                console.log('Media hotspot clicked:', hotspot);
                console.log('Hotspot type:', hotspot.type);
                console.log('Target media ID:', hotspot.targetMediaId);
                
                if (hotspot.type === 'link' && hotspot.targetMediaId) {
                  const targetMedia = mediaFiles.find(m => m.id === hotspot.targetMediaId);
                  console.log('Found target media:', targetMedia);
                  if (targetMedia) {
                    console.log('Navigating to media:', targetMedia.id, 'layer:', targetMedia.layerId);
                    console.log('=== HOTSPOT NAVIGATION ===');
                    console.log('Target media:', targetMedia);
                    console.log('Current layer:', layer);
                    console.log('Target layer:', targetMedia.layerId);
                    
                    // Always set target media and force reload
                    setTargetMediaId(targetMedia.id);
                    setSelectedUnit(targetMedia.unitName);
                    setPanoramaKey(Date.now());
                    
                    if (targetMedia.layerId === layer) {
                      // Same layer - force component reload
                      console.log('Same layer navigation - forcing reload');
                      setForceReload(true);
                      setTimeout(() => {
                        setForceReload(false);
                      }, 100);
                    } else {
                      // Different layer - switch layer
                      console.log('Different layer navigation');
                      switchToLayer(targetMedia.layerId);
                    }
                  } else {
                    alert(`Target panorama not found (ID: ${hotspot.targetMediaId})`);
                  }
                } else {
                  alert(hotspot.description || hotspot.title);
                }
              }
            };
            
            console.log('Created hotspot data:', hotspotData);
            layerHotspots.push(hotspotData);
          });
        } catch (error) {
          console.error('Failed to process media hotspots:', error);
        }
      }
    } else {
      // For layer 1, add hardcoded hotspot
      if (layer === 1) {
        layerHotspots.push({
          x: '50.6%',
          y: '56.4%',
          label: 'Cap & Cip',
          timeStart: 0,
          timeEnd: 10,
          onClick: () => {
            setSelectedUnit('Layer 2');
            switchToLayer(2);
          }
        });
        layerHotspots.push({
          x: '52.5%',
          y: '47.9%',
          label: 'KTV',
          timeStart: 13,
          timeEnd: 18,
          onClick: () => {
            setSelectedUnit('KTV');
            switchToLayer(3);
          }
        });
        layerHotspots.push({
          x: '68.2%',
          y: '48.3%',
          label: 'HTM',
          timeStart: 19,
          timeEnd: 33,
          onClick: () => {
            setSelectedUnit('HTM');
            switchToLayer(3);
          }
        });
        layerHotspots.push({
          x: '75.7%',
          y: '65.3%',
          label: 'Cap & Cip',
          timeStart: 44,
          timeEnd: 54,
          onClick: () => {
            setSelectedUnit('HTM');
            switchToLayer(3);
          }
        });
      } else {
        // For other layers, use layers data hotspots
        const layerData = layersData.find(l => l.id === layer);
        
        if (layerData?.hotspots) {
          layerData.hotspots.forEach((hotspot: any) => {
            layerHotspots.push({
              x: hotspot.x,
              y: hotspot.y,
              label: hotspot.label,
              frame: hotspot.frame,
              targetLayer: hotspot.targetLayer,
              onClick: () => {
                setSelectedUnit(hotspot.label);
                switchToLayer(hotspot.targetLayer);
              }
            });
          });
        }
      }
    }
    
    // Add back navigation if not on first layer (except for panorama layers)
    if (layer > 1 && !(layer === 4 || layer === 5)) {
      let backLayer = 1;
      if (layer === 2) backLayer = 1;
      if (layer === 3) backLayer = 1;
      
      layerHotspots.push({
        x: '8%',
        y: '90%',
        label: `← Kembali`,
        frame: 1,
        isBackButton: true,
        onClick: () => switchToLayer(backLayer)
      });
    }
    
    console.log('Total hotspots for layer', layer, ':', layerHotspots);
    return layerHotspots;
  };

  const currentData = getLayerData(currentLayer);

  // Notify parent about panorama mode and iframe mode
  useEffect(() => {
    const baseLayer = Math.floor(currentLayer);
    const currentLayerData = layersData.find(layer => layer.id === currentLayer);
    const isPanoramaMode = baseLayer === 4 || baseLayer === 5 || baseLayer === 7;
    const isIframeMode = currentLayerData?.type === 'iframe';
    onModeChange?.(isPanoramaMode || isIframeMode);
  }, [currentLayer, onModeChange, layersData]);

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

  // Show iframe for layers with type 'iframe'
  const currentLayerData = layersData.find(layer => layer.id === currentLayer);
  if (currentLayerData?.type === 'iframe' && currentLayerData?.iframeUrl) {
    return (
      <div className="w-full h-screen relative">
        <iframe 
          src={currentLayerData.iframeUrl}
          className="w-full h-full border-0"
          title={`${currentLayerData.name} Content`}
        />
        <button
          onClick={() => switchToLayer(1)}
          className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors z-10"
        >
          ← KEMBALI
        </button>
      </div>
    );
  }

  // Show video for layer 1, 3 (direct fallback) or layers with type 'video'
  if (currentLayer === 1 || currentLayer === 3 || (currentLayerData?.type === 'video' && currentLayerData?.videoUrl)) {
    const videoUrl = currentLayer === 1 ? '/jakhabitat/layer/layer1/dprkp.mp4' : 
                     currentLayer === 3 ? '/jakhabitat/layer/layer3/layer3.mp4' : 
                     currentLayerData.videoUrl;
    return (
      <VideoObjectViewer
        videoUrl={videoUrl}
        className="w-full h-screen"
        hotspots={currentData.hotspots}
      />
    );
  }

  // Show Marzipano for layer 4, 5, and 7
  const baseLayer = Math.floor(currentLayer);
  if (baseLayer === 4 || baseLayer === 5 || baseLayer === 7) {
    // Generate Marzipano path based on layer and selected unit
    let marzipanoPath = '/marzipano/tower-kanaya/'; // Default
    
    if (baseLayer === 7) {
      marzipanoPath = '/marzipano/tower-samawa/';
    } else if (selectedUnit) {
      const unitSlug = selectedUnit.toLowerCase().replace(/\s+/g, '-');
      marzipanoPath = `/marzipano/${unitSlug}/`;
    }
    
    console.log('Loading Marzipano for layer', baseLayer, 'with path:', marzipanoPath);
    console.log('Selected unit:', selectedUnit);
    
    return (
      <MarzipanoViewer
        marzipanoPath={marzipanoPath}
        unitName={selectedUnit}
        onBack={() => {
          if (baseLayer === 5) {
            switchToLayer(4);
          } else if (baseLayer === 7) {
            switchToLayer(3);
          } else {
            setSelectedUnit('');
            switchToLayer(3);
          }
        }}
      />
    );
  }

  // Fallback for object360 layers (layer 2, 3, etc.)
  if (baseLayer === 2 || baseLayer === 3) {
    const frameCount = 1176;
    const images = Array.from({length: frameCount}, (_, i) => 
      `/jakhabitat/layer/layer${baseLayer}/frame_${String(i + 1).padStart(3, '0')}.jpg`
    );
    
    return (
      <Object360Viewer 
        images={images}
        className="w-full h-screen"
        hotspots={currentData.hotspots}
      />
    );
  }
  
  // Default fallback
  return <div className="w-full h-screen bg-black flex items-center justify-center text-white">Layer {currentLayer} not configured</div>;
};

export default LayerViewer;