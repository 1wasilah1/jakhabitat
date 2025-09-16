import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Play, Pause, Home, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import roomInterior from '@/assets/room-interior.jpg';
import buildingExterior from '@/assets/building-exterior.jpg';

function PanoramaSphere({ currentRoom, roomImage, doors, onDoorClick }: { 
  currentRoom: string; 
  roomImage: string;
  doors?: Array<{to: string, position: {x: string, y: string}, label: string}>;
  onDoorClick?: (roomId: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, roomImage);
  


  return (
    <group ref={meshRef}>
      <mesh scale={[-50, 50, 50]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* 3D Hotspots */}
      {doors && doors.map((door, index) => (
        <mesh
          key={`${door.to}-${index}`}
          position={[20, 0, 20]}
          onClick={() => onDoorClick && onDoorClick(door.to)}
        >
          <sphereGeometry args={[3]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
}

// Default fallback images
const FALLBACK_IMAGES = {
  lorong: `${import.meta.env.BASE_URL}panorama/lorong.png`,
  kamar: `${import.meta.env.BASE_URL}panorama/kamar.png`
};

export const Tour360 = ({ selectedTower, selectedArea }: { selectedTower?: string; selectedArea?: string } = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [showRoomSelector, setShowRoomSelector] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [clickCoordinates, setClickCoordinates] = useState<{x: string, y: string} | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { authState } = useAuth();
  
  const currentRoom = rooms[currentRoomIndex];



  // Load units from master unit (public access)
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/public/master-unit');
        const result = await response.json();
        if (result.success) {
          setUnits(result.data);
        }
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };
    
    loadUnits();
  }, []);
  
  // Load panoramas function
  const loadPanoramas = async (unitId) => {
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/public/panoramas/${unitId}`);
      const result = await response.json();
      if (result.success && result.photos.length > 0) {
        // Sort photos by createdAt descending (newest first)
        const sortedPhotos = result.photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const photosByCategory = sortedPhotos.reduce((acc, photo) => {
          if (!acc[photo.roomCategory]) {
            acc[photo.roomCategory] = photo; // Keep only the first (newest) photo per category
          }
          return acc;
        }, {});
        
        const dynamicRooms = [];
        
        // Show only lorong category first
        const lorongPhoto = photosByCategory['lorong'];
        if (lorongPhoto) {
          dynamicRooms.push({
            id: 'lorong',
            name: 'Lorong',
            description: `Lorong ${selectedUnit?.namaUnit || selectedTower || ''}`,
            features: ['360° View', 'High Resolution', 'Interactive'],
            image: `https://dprkp.jakarta.go.id/api/jakhabitat/image/${lorongPhoto.filename}`,
            type: 'lorong'
          });
        }
        
        setRooms(dynamicRooms);
      } else {
        setRooms([{
          id: 'hallway',
          name: 'Lorong',
          description: `Lorong ${selectedUnit?.namaUnit || selectedTower || ''}`,
          features: ['Pencahayaan LED', 'Lantai marmer'],
          image: FALLBACK_IMAGES.lorong,
          type: 'corridor'
        }]);
      }
    } catch (error) {
      console.error('Error loading panoramas:', error);
    }
  };
  
  // Initialize with selectedTower if provided (only once)
  useEffect(() => {
    if (selectedTower && units.length > 0 && !selectedUnit) {
      const unit = units.find(u => u.namaUnit === selectedTower);
      if (unit) {
        setSelectedUnit(unit);
        setShowRoomSelector(false);
        loadPanoramas(unit.id);
      }
    }
  }, [selectedTower]);

  // Show loading when no rooms available
  if (!rooms.length && selectedUnit) {
    return <div className="flex justify-center items-center h-96">Loading {selectedUnit.namaUnit} panoramas...</div>;
  }
  
  if (!rooms.length && !selectedTower) {
    return <div className="flex justify-center items-center h-96">Loading panoramas...</div>;
  }

  // Group rooms by type for better organization
  const roomTypes = {
    corridor: rooms.filter(room => room.type === 'corridor'),
    living: rooms.filter(room => room.type === 'living'),
    bedroom: rooms.filter(room => room.type === 'bedroom'),
    bathroom: rooms.filter(room => room.type === 'bathroom'),
    kitchen: rooms.filter(room => room.type === 'kitchen'),
    balcony: rooms.filter(room => room.type === 'balcony')
  };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  };

  // Auto play functionality
  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentRoomIndex((prev) => (prev + 1) % rooms.length);
      }, 4000); // Change room every 4 seconds
      setAutoPlayInterval(interval);
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
    }

    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [isAutoPlay]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const goToRoom = (roomId: string) => {
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    if (roomIndex !== -1) {
      setCurrentRoomIndex(roomIndex);
      // Stop auto play when user manually navigates
      if (isAutoPlay) {
        setIsAutoPlay(false);
      }
    }
  };

  const nextRoom = () => {
    setCurrentRoomIndex((prev) => (prev + 1) % rooms.length);
  };

  const prevRoom = () => {
    setCurrentRoomIndex((prev) => (prev - 1 + rooms.length) % rooms.length);
  };

  return (
    <div className="w-full space-y-6">
      {/* Room Selection Header */}
      {showRoomSelector && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg border">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">360° VIRTUAL TOUR</h2>
            <p className="text-muted-foreground">Jelajahi setiap ruangan dengan teknologi immersive 3D</p>
          </div>
          
          {!selectedUnit ? (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Pilih Tower</h3>
              <div className="max-w-md mx-auto">
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center bg-white"
                  onChange={async (e) => {
                    if (e.target.value) {
                      const unit = units.find(u => u.id == e.target.value);
                      setSelectedUnit(unit);
                      await loadPanoramas(unit.id);
                      setShowRoomSelector(false);
                      setCurrentRoomIndex(0);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Pilih Tower --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.namaUnit} ({unit.luas} m²)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-4">
                <button
                  onClick={() => {
                    setSelectedUnit(null);
                    setRooms([]);
                  }}
                  className="text-sm text-muted-foreground hover:text-primary mb-2"
                >
                  ← Kembali ke Pilih Tower
                </button>
                <h3 className="text-xl font-semibold">{selectedUnit.namaUnit}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedUnit.tipeUnit} - {selectedUnit.luas} m² - {selectedUnit.lokasi}
                </p>
              </div>
              
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat panorama untuk {selectedUnit.namaUnit}...</p>
              </div>
            </div>
          )}
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">Powered by Virtual Reality Technology</p>
          </div>
        </div>
      )}

      {/* 360° Viewer */}
      {!showRoomSelector && (
        <div 
          ref={containerRef}
          className={`relative w-full bg-black rounded-lg overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'h-screen' : 'h-96'
          }`}
        >

      <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
        <PanoramaSphere 
          currentRoom={currentRoom.id} 
          roomImage={currentRoom.image}
          doors={currentRoom.doors}
          onDoorClick={goToRoom}
        />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={0.1}
          maxDistance={1}
        />
      </Canvas>
      
          {/* Back to Room Selector */}
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={() => setShowRoomSelector(true)}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Pilih Unit</span>
            </button>
          </div>
          
          {/* Debug Mode Toggle */}
          <div className="absolute top-4 left-20 z-20">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                debugMode ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              {debugMode ? 'Debug ON' : 'Debug OFF'}
            </button>
            {clickCoordinates && debugMode && (
              <div className="mt-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                x: {clickCoordinates.x}, y: {clickCoordinates.y}
              </div>
            )}
          </div>

          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <div className="flex gap-2">
              <button
                onClick={prevRoom}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                disabled={isAutoPlay}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextRoom}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                disabled={isAutoPlay}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={toggleAutoPlay}
                className={`bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors ${
                  isAutoPlay ? 'bg-primary/70' : ''
                }`}
              >
                {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
      
      {/* Room Info Panel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-6 py-3 rounded-lg text-center max-w-md animate-fade-in">
        <h4 className="font-semibold text-lg">{currentRoom.name}</h4>
        <p className="text-sm text-gray-300 mt-1">{currentRoom.description}</p>
        {isAutoPlay && (
            <div className="mt-2">
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full"
                  style={{ 
                    animation: `loadingBar 4s linear infinite`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Auto review mode</p>
            </div>
        )}
      </div>

      {/* Room Features Panel */}
      <div className="absolute right-4 top-20 bg-black/50 text-white p-4 rounded-lg max-w-xs animate-fade-in">
        <h5 className="font-semibold text-sm mb-2">Fitur Ruangan:</h5>
        <ul className="space-y-1">
          {currentRoom.features.map((feature, index) => (
            <li key={index} className="text-xs text-gray-300 flex items-center">
              <span className="w-1 h-1 bg-primary rounded-full mr-2"></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Room Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
        {rooms.map((room, index) => (
          <button
            key={room.id}
            onClick={() => !isAutoPlay && setCurrentRoomIndex(index)}
            className={`relative transition-all duration-300 ${
              index === currentRoomIndex 
                ? 'w-8 h-3 bg-primary rounded-full' 
                : 'w-3 h-3 bg-white/40 hover:bg-white/60 rounded-full'
            } ${isAutoPlay ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            disabled={isAutoPlay}
          >
            {index === currentRoomIndex && isAutoPlay && (
              <div className="absolute inset-0 bg-primary/50 rounded-full animate-ping"></div>
            )}
          </button>
        ))}
      </div>

      {/* Debug Click Overlay */}
      {debugMode && (
        <div 
          className="absolute inset-0 cursor-crosshair z-30"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
            const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
            setClickCoordinates({ x: x + '%', y: y + '%' });
            console.log(`Clicked at: x: '${x}%', y: '${y}%'`);
          }}
        />
      )}



      {/* Navigation Hotspots - Only show when not in auto play */}
      {!isAutoPlay && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-110"
            onClick={prevRoom}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </div>
          
          <div 
            className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto transition-all duration-200 hover:scale-110"
            onClick={nextRoom}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 px-3 py-2 rounded max-w-xs">
        <p>🖱️ Seret untuk melihat • 🔍 Scroll untuk zoom</p>
        <p>🚪 Klik titik biru untuk masuk ruangan</p>
        <p>▶️ {isAutoPlay ? 'Mode auto review aktif' : 'Klik play untuk auto review'}</p>
        <p>⛶ Klik fullscreen untuk pengalaman terbaik</p>
      </div>

        </div>
      )}



    </div>
  );
};