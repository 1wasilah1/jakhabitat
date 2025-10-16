import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

// Load A-Frame dynamically
if (typeof window !== 'undefined' && !window.AFRAME) {
  const script = document.createElement('script');
  script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
  document.head.appendChild(script);
}

interface PanoramaLayerProps {
  imageUrl?: string;
  hotspots?: Array<{
    x: string;
    y: string;
    label: string;
    frame: number;
    onClick?: () => void;
  }>;
  onBack: () => void;
}

const PanoramaLayer: React.FC<PanoramaLayerProps> = ({ 
  imageUrl = '/jakhabitat/layer/layer4/samawa-mg.jpg',
  hotspots = [],
  onBack 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [panoramaReady, setPanoramaReady] = useState(false);
  const [htmlHotspots, setHtmlHotspots] = useState<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Creating Photo Sphere Viewer with:', imageUrl);
    
    // Clear container first
    containerRef.current.innerHTML = '';
    setPanoramaReady(false);
    
    // Filter valid hotspots
    const validHotspots = hotspots.filter(hotspot => {
      const x = parseFloat(hotspot.x.replace('%', ''));
      const y = parseFloat(hotspot.y.replace('%', ''));
      return !isNaN(x) && !isNaN(y) && !hotspot.label.includes('←');
    });
    
    // Create new Photo Sphere Viewer each time
    const viewer = new Viewer({
      container: containerRef.current,
      panorama: imageUrl,
      plugins: [
        [MarkersPlugin, {
          markers: validHotspots.map((hotspot, index) => {
            // Convert percentage to spherical coordinates
            const yaw = (parseFloat(hotspot.x.replace('%', '')) / 100) * 2 * Math.PI - Math.PI;
            const pitch = (0.5 - parseFloat(hotspot.y.replace('%', '')) / 100) * Math.PI;
            
            return {
              id: `hotspot-${index}`,
              position: { yaw, pitch },
              html: `<div style="background: red; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">${hotspot.label}</div>`,
              anchor: 'center center',
              data: { hotspot }
            };
          })
        }]
      ],
      navbar: [
        'zoom',
        'move',
        'fullscreen'
      ]
    });
    
    // Add marker click handler
    const markersPlugin = viewer.getPlugin(MarkersPlugin);
    markersPlugin.addEventListener('select-marker', (e) => {
      const hotspot = e.marker.data.hotspot;
      console.log('Photo Sphere hotspot clicked:', hotspot.label);
      if (hotspot.onClick) {
        hotspot.onClick();
      }
    });
    
    viewer.addEventListener('ready', () => {
      console.log('Photo Sphere Viewer ready');
      setPanoramaReady(true);
    });
    
    viewerRef.current = viewer;
    
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (error) {
          console.warn('Error destroying viewer:', error);
        }
      }
    };
  }, [imageUrl, hotspots]);
  


  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {!panoramaReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-50">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <div className="text-xl font-bold">Loading Panorama...</div>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full relative" />
      

      

      

      
      <button
        onClick={onBack}
        className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2 z-10"
      >
        ← Back
      </button>
      
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-10">
        {(() => {
          const fileName = imageUrl?.split('/').pop()?.split('.')[0] || 'Unknown';
          return `${fileName} - 360° View`;
        })()} 
      </div>
      

      
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm z-10">
        🖱️ Drag to look around
      </div>
    </div>
  );
};

export default PanoramaLayer;