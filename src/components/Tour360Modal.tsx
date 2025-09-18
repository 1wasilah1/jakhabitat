import { X, ArrowLeft, Maximize2, RotateCcw, ArrowUp } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import roomInterior from '@/assets/room-interior.jpg';

function PanoramaSphere({ roomImage, hotspots, onHotspotClick, onHotspotHover }: { 
  roomImage: string;
  hotspots?: Array<{id: number, x: number, y: number, destination: string}>;
  onHotspotClick?: (destination: string) => void;
  onHotspotHover?: (hotspotId: number | null, screenPosition?: {x: number, y: number}) => void;
}) {
  console.log('Loading texture for:', roomImage);
  const texture = useLoader(THREE.TextureLoader, roomImage);
  const { camera, size, gl } = useThree();
  
  // Optimize renderer settings
  gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  gl.antialias = false;
  
  // Convert 2D coordinates to 3D sphere positions
  const convertTo3D = (x: number, y: number, radius = 25) => {
    // Parse percentage values
    const xPercent = parseFloat(x.toString().replace('%', '')) / 100;
    const yPercent = parseFloat(y.toString().replace('%', '')) / 100;
    
    // Convert to spherical coordinates
    // X: 0-100% maps to 0-2π (longitude)
    // Y: 0-100% maps to 0-π (latitude, inverted)
    const phi = xPercent * Math.PI * 2; // 0 to 2π
    const theta = (1 - yPercent) * Math.PI; // π to 0 (inverted Y)
    
    return [
      -radius * Math.sin(theta) * Math.cos(phi), // Negative X for correct orientation
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    ];
  };
  
  return (
    <group>
      <mesh scale={[-50, 50, 50]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* Invisible Hotspots */}
      {hotspots && hotspots.map((hotspot) => {
        const [x, y, z] = convertTo3D(hotspot.x, hotspot.y);
        return (
          <mesh
            key={hotspot.id}
            position={[x, y, z]}
            onClick={() => onHotspotClick && onHotspotClick(hotspot.destination)}
            onPointerEnter={() => {
              if (onHotspotHover) {
                // Convert 3D position to screen coordinates
                const vector = new THREE.Vector3(x, y, z);
                vector.project(camera);
                
                const screenX = (vector.x * 0.5 + 0.5) * size.width;
                const screenY = (vector.y * -0.5 + 0.5) * size.height;
                
                onHotspotHover(hotspot.id, { x: screenX, y: screenY });
              }
            }}
            onPointerLeave={() => onHotspotHover && onHotspotHover(null)}
          >
            <sphereGeometry args={[5, 8, 6]} />
            <meshBasicMaterial transparent opacity={0} />
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
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
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
        // Get proper unit ID by fetching units first
        const unitsResponse = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/public/master-harga');
        const unitsResult = await unitsResponse.json();
        console.log('Units result:', unitsResult);
        
        let unitId = 21; // default to the unit ID from your data
        if (unitsResult.success) {
          const unit = unitsResult.data.find(u => u.namaUnit === selectedTower);
          console.log('Found unit:', unit, 'for tower:', selectedTower);
          if (unit) {
            unitId = unit.unitId;
          }
        }
        
        console.log('Loading panoramas for unit ID:', unitId, 'Tower:', selectedTower);
        const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/public/panoramas/${unitId}`);
        const result = await response.json();
        console.log('Panoramas result:', result);
        
        if (result.success && result.photos.length > 0) {
          const defaultPhoto = result.photos.find(photo => photo.isDefault);
          const firstPhoto = defaultPhoto || result.photos[0];
          console.log('Setting current photo:', firstPhoto);
          setCurrentPhoto(firstPhoto);
          setPhotos(result.photos);
          
          // Load hotspots for first photo
          if (firstPhoto) {
            loadHotspots(firstPhoto.id);
          }
        } else {
          console.log('No photos found or API error');
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
      setHoveredHotspot(null); // Clear hover state before loading
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
    setHoveredHotspot(null); // Clear hover state
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
  
  // Handle hotspot hover
  const handleHotspotHover = (hotspotId, screenPosition) => {
    if (hotspotId) {
      // Find target photo info
      const targetPhoto = photos.find(photo => 
        photo.roomCategory === hotspots.find(h => h.id === hotspotId)?.destination ||
        photo.id.toString() === hotspots.find(h => h.id === hotspotId)?.destination
      );
      
      setHoveredHotspot({ 
        id: hotspotId, 
        screenPosition,
        targetInfo: targetPhoto ? {
          roomName: String(targetPhoto.roomCategory || 'Room').replace('_', ' '),
          unitName: targetPhoto.unitName || selectedTower
        } : null
      });
    } else {
      setHoveredHotspot(null);
    }
    
    // Change cursor style
    if (containerRef.current) {
      containerRef.current.style.cursor = hotspotId ? 'pointer' : 'grab';
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
                <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
                  <PanoramaSphere 
                    roomImage={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${currentPhoto.filename}`}
                    hotspots={hotspots}
                    onHotspotClick={handleHotspotClick}
                    onHotspotHover={handleHotspotHover}
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
                    target={[0, 0, -1]}
                    minPolarAngle={Math.PI * 0.1}
                    maxPolarAngle={Math.PI * 0.9}
                    rotateSpeed={1}
                    zoomSpeed={1}
                  />
                </Canvas>
              </Suspense>
            ) : (
              <img 
                src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${currentPhoto.filename}`}
                alt={currentPhoto.originalName}
                className="w-full h-full object-contain"
                onLoad={() => console.log('Image loaded successfully:', currentPhoto.filename)}
                onError={(e) => {
                  console.log('Image load error for:', currentPhoto.filename);
                  e.target.src = roomInterior;
                }}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading panorama...</div>
              <div className="text-white/40 text-xs mt-2">Debug: {photos.length} photos loaded</div>
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
          {/* Hover Arrow Icon - Google Maps Style */}
          {hoveredHotspot && is360Mode && hoveredHotspot.screenPosition && (
            <div 
              className="absolute pointer-events-none z-30 flex items-center gap-4"
              style={{
                left: `${hoveredHotspot.screenPosition.x}px`,
                top: `${hoveredHotspot.screenPosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Arrow */}
              <div className="relative animate-pulse">
                <svg 
                  width="120" 
                  height="120" 
                  viewBox="0 0 80 80" 
                  className="drop-shadow-2xl"
                >
                  <path 
                    d="M40 10 L50 30 L45 30 L45 50 L35 50 L35 30 L30 30 Z" 
                    fill="#4285F4" 
                    stroke="white" 
                    strokeWidth="2"
                  />
                  <circle 
                    cx="40" 
                    cy="60" 
                    r="12" 
                    fill="#4285F4" 
                    stroke="white" 
                    strokeWidth="2"
                  />
                  <circle 
                    cx="40" 
                    cy="60" 
                    r="4" 
                    fill="white"
                  />
                </svg>
              </div>
              
              {/* Unit Info Tooltip */}
              {hoveredHotspot.targetInfo && (
                <div className="bg-white/95 text-black px-4 py-2 rounded-lg shadow-xl border border-gray-200 backdrop-blur">
                  <div className="text-sm font-semibold text-blue-600">
                    {hoveredHotspot.targetInfo.roomName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {hoveredHotspot.targetInfo.unitName}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {is360Mode && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur text-center">
              <p className="text-xs text-white/80">
                🖱️ Drag to look around • 🔍 Scroll to zoom
                {hotspots.length > 0 && ' • ➡️ Hover invisible hotspots to navigate'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};