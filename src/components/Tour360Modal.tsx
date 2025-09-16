import { X, ArrowLeft, Maximize2, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import roomInterior from '@/assets/room-interior.jpg';

function PanoramaSphere({ roomImage, hotspots, onHotspotClick }: { 
  roomImage: string;
  hotspots?: Array<{id: number, x: number, y: number, destination: string}>;
  onHotspotClick?: (destination: string) => void;
}) {
  const texture = useLoader(THREE.TextureLoader, roomImage);
  
  // Convert 2D coordinates to 3D sphere positions
  const convertTo3D = (x: number, y: number, radius = 25) => {
    const phi = (x / 100) * Math.PI * 2;
    const theta = (y / 100) * Math.PI;
    return [
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    ];
  };
  
  return (
    <group>
      <mesh scale={[-50, 50, 50]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* Hotspots */}
      {hotspots && hotspots.map((hotspot) => {
        const [x, y, z] = convertTo3D(hotspot.x, hotspot.y);
        return (
          <mesh
            key={hotspot.id}
            position={[x, y, z]}
            onClick={() => onHotspotClick && onHotspotClick(hotspot.destination)}
          >
            <sphereGeometry args={[1]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

interface Tour360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTower: string;
  selectedArea: string;
  onBackToGallery: () => void;
}

export const Tour360Modal = ({ isOpen, onClose, selectedTower, selectedArea, onBackToGallery }: Tour360ModalProps) => {
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [is360Mode, setIs360Mode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto fullscreen when modal opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const enterFullscreen = async () => {
        try {
          await containerRef.current?.requestFullscreen();
        } catch (error) {
          console.log('Fullscreen not supported');
        }
      };
      
      // Delay to ensure DOM is ready
      setTimeout(enterFullscreen, 100);
    }
    
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedTower) return;

    const loadPhotos = async () => {
      try {
        // Get unit ID by tower name (simplified - you might need proper mapping)
        const unitId = selectedTower === 'Tower Kanaya' ? 2 : 1;
        const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/public/panoramas/${unitId}`);
        const result = await response.json();
        
        if (result.success && result.photos.length > 0) {
          const defaultPhoto = result.photos.find(photo => photo.isDefault);
          const firstPhoto = defaultPhoto || result.photos[0];
          setCurrentPhoto(firstPhoto);
          setPhotos(result.photos);
          
          // Load hotspots for first photo
          if (firstPhoto) {
            loadHotspots(firstPhoto.id);
          }
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    };

    loadPhotos();
  }, [isOpen, selectedTower]);
  
  // Load hotspots for current photo
  const loadHotspots = async (photoId) => {
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/hotspots/${photoId}`);
      const result = await response.json();
      if (result.success) {
        setHotspots(result.hotspots || []);
      }
    } catch (error) {
      console.error('Error loading hotspots:', error);
      setHotspots([]);
    }
  };
  
  // Handle photo change
  const handlePhotoChange = (photo) => {
    setCurrentPhoto(photo);
    loadHotspots(photo.id);
  };
  
  // Handle hotspot click
  const handleHotspotClick = (destination) => {
    const targetPhoto = photos.find(photo => 
      photo.roomCategory === destination || 
      photo.id.toString() === destination
    );
    if (targetPhoto) {
      handlePhotoChange(targetPhoto);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black flex items-center justify-center z-60">
      <div className="w-full h-full overflow-hidden relative">
        {/* Floating Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToGallery}
              className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-lg transition-colors backdrop-blur"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Galeri</span>
            </button>
            <button
              onClick={() => setIs360Mode(!is360Mode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors backdrop-blur ${
                is360Mode 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">{is360Mode ? '360° ON' : '360° OFF'}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur">
              <h2 className="text-sm font-medium">{selectedTower}</h2>
              <p className="text-xs text-white/80">Unit {selectedArea}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors backdrop-blur"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 360 Photo Display */}
        <div className="relative h-full bg-black">
          {currentPhoto ? (
            is360Mode ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60">Loading 360° view...</div>
                </div>
              }>
                <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
                  <PanoramaSphere 
                    roomImage={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${currentPhoto.filename}`}
                    hotspots={hotspots}
                    onHotspotClick={handleHotspotClick}
                  />
                  <OrbitControls 
                    enableZoom={true}
                    enablePan={false}
                    enableRotate={true}
                    enableDamping={true}
                    dampingFactor={0.05}
                    minDistance={0.1}
                    maxDistance={1}
                    autoRotate={false}
                  />
                </Canvas>
              </Suspense>
            ) : (
              <img 
                src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${currentPhoto.filename}`}
                alt={currentPhoto.originalName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = roomInterior;
                }}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading panorama...</div>
            </div>
          )}

          {/* Photo Info Overlay */}
          {currentPhoto && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur">
              <h4 className="font-medium">{String(currentPhoto.roomCategory || 'Room').replace('_', ' ')}</h4>
              <p className="text-sm text-white/80">{is360Mode ? '360° Interactive View' : 'Static View'}</p>
            </div>
          )}

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2 bg-black/50 p-2 rounded-lg backdrop-blur">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => handlePhotoChange(photo)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPhoto?.id === photo.id 
                      ? 'bg-white' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  title={String(photo.roomCategory || 'Room').replace('_', ' ')}
                />
              ))}
            </div>
          )}
          
          {/* Instructions */}
          {is360Mode && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur text-center">
              <p className="text-xs text-white/80">
                🖱️ Drag to look around • 🔍 Scroll to zoom
                {hotspots.length > 0 && ' • 🟢 Click green dots to navigate'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};