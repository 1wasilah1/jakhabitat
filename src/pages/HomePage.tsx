import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import bannerImage from '@/assets/banner.webp';

const HomePage = () => {
  const [showRain, setShowRain] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPanoramaModal, setShowPanoramaModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [panoramas, setPanoramas] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentIndices, setCurrentIndices] = useState({});
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, currentX: 0, category: null });
  const [show360Modal, setShow360Modal] = useState(false);
  const [selectedPanorama, setSelectedPanorama] = useState(null);
  const [panoramaHotspots, setPanoramaHotspots] = useState([]);


  useEffect(() => {
    const timer = setTimeout(() => setShowRain(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showModal) {
      fetch('https://dprkp.jakarta.go.id/api/jakhabitat/master-unit')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUnits(data.data);
          }
        })
        .catch(err => console.error('Error loading units:', err));
    }
  }, [showModal]);

  useEffect(() => {
    if (showPanoramaModal && selectedUnit) {
      fetch('https://dprkp.jakarta.go.id/api/jakhabitat/panoramas')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Filter panoramas by unit if unitId field exists, otherwise show all
            const filteredPanoramas = data.photos.filter(panorama => 
              panorama.unitId === selectedUnit.id || !panorama.unitId
            );
            setPanoramas(filteredPanoramas.length > 0 ? filteredPanoramas : data.photos);
          }
        })
        .catch(err => console.error('Error loading panoramas:', err));
    }
  }, [showPanoramaModal, selectedUnit]);

  // Load hotspots for selected panorama
  useEffect(() => {
    if (show360Modal && selectedPanorama) {
      console.log('Loading hotspots for panorama ID:', selectedPanorama.id);
      setPanoramaHotspots([]); // Clear previous hotspots
      
      fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/hotspots/${selectedPanorama.id}`)
        .then(res => res.json())
        .then(data => {
          console.log('Hotspots loaded for panorama', selectedPanorama.id, ':', data);
          if (data.success) {
            setPanoramaHotspots(data.hotspots || []);
          }
        })
        .catch(err => {
          console.error('Error loading hotspots:', err);
          setPanoramaHotspots([]);
        });
    } else {
      setPanoramaHotspots([]); // Clear hotspots when modal closes
    }
  }, [show360Modal, selectedPanorama]);

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setShowModal(false);
    setShowPanoramaModal(true);
  };

  const createRainDrops = () => {
    const drops = [];
    for (let i = 0; i < 100; i++) {
      drops.push(
        <div
          key={i}
          className="absolute w-0.5 bg-blue-200/60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${Math.random() * 100 + 50}px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 1 + 0.5}s`,
            transform: 'translateY(-100vh)',
            animation: `rainFall ${Math.random() * 1 + 0.5}s linear infinite`
          }}
        />
      );
    }
    return drops;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-200">
      <img 
        src={bannerImage} 
        alt="Jakhabitat Banner" 
        className="w-full h-full object-cover"
      />
      
      {/* Rain effect */}
      {showRain && (
        <div className="absolute inset-0 pointer-events-none">
          {createRainDrops()}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes rainFall {
                0% { transform: translateY(-100vh); }
                100% { transform: translateY(100vh); }
              }
            `
          }} />
        </div>
      )}
      
      {/* Folded paper corner effect */}
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
        <div 
          className="w-full h-full bg-white/20 shadow-lg"
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
            transformOrigin: 'top left',
            animation: 'paperFlutter 3s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-0 left-0 w-full h-full bg-gray-300/30"
          style={{
            clipPath: 'polygon(0% 0%, 80% 0%, 0% 80%)',
            transformOrigin: 'top left',
            animation: 'paperFlutter 3s ease-in-out infinite 0.5s'
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes paperFlutter {
              0%, 100% { transform: rotateZ(0deg) rotateY(0deg); }
              25% { transform: rotateZ(2deg) rotateY(5deg); }
              50% { transform: rotateZ(-1deg) rotateY(-3deg); }
              75% { transform: rotateZ(1deg) rotateY(2deg); }
            }
          `
        }} />
      </div>
      

      {/* Triangular Hotspot above Nuansa Cilangkap */}
      <div className="absolute top-40 left-96 transform -translate-x-1/2 -translate-y-1/2 text-center cursor-pointer" onClick={() => setShowModal(true)}>
        {/* Triangular spotlight effect */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-0 h-0 border-l-[30px] border-r-[30px] border-t-[40px] border-l-transparent border-r-transparent border-t-gray-600/40"
            style={{ 
              filter: 'blur(2px)',
              animation: 'lightToDark 2s ease-in-out infinite alternate'
            }}
          />
        </div>
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-white/70"
            style={{ 
              filter: 'blur(1px)',
              animation: 'lightToDark 2s ease-in-out infinite alternate 0.5s'
            }}
          />
        </div>
      </div>
      

      
      {/* Fullscreen Transparent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="w-full h-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white text-4xl font-semibold mb-6">
              Pilih Unit
            </h2>
            
            {/* Unit Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 max-w-4xl">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg p-4 text-white transition-all duration-300 hover:scale-105"
                  onClick={() => handleUnitSelect(unit)}
                >
                  <div className="text-lg font-semibold mb-2">
                    {unit.namaUnit}
                  </div>
                  <div className="text-sm text-white/80">
                    {unit.tipeUnit} - {unit.luas}m²
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              className="bg-transparent border border-white/30 hover:border-white/50 text-white px-6 py-3 rounded-md transition-all duration-300 text-lg"
              onClick={() => setShowModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      
      {/* Panorama Modal */}
      {showPanoramaModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowPanoramaModal(false)}>
          <div className="w-full h-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white text-3xl font-semibold mb-2">
              {selectedUnit?.namaUnit}
            </h2>
            <p className="text-white/80 mb-6">{selectedUnit?.tipeUnit} - {selectedUnit?.luas}m²</p>
            
            {/* Categorized Panoramas by tipeUnit */}
            <div className="w-full max-w-6xl space-y-8">
              {(() => {
                // Group panoramas by tipeUnit
                const groupedPanoramas = panoramas.reduce((acc, panorama) => {
                  const tipe = panorama.tipeUnit || 'Lainnya';
                  if (!acc[tipe]) acc[tipe] = [];
                  acc[tipe].push(panorama);
                  return acc;
                }, {});
                
                return Object.entries(groupedPanoramas).map(([tipeUnit, panoramasInType]) => (
                  <div key={tipeUnit} className="mb-8">
                    <h3 className="text-white text-xl font-semibold mb-4">
                      {tipeUnit}
                    </h3>
                    
                    {/* Card Stack for this category */}
                    <div 
                      className="relative w-full h-80 cursor-grab active:cursor-grabbing"
                      onMouseDown={(e) => {
                        setDragState({ isDragging: true, startX: e.clientX, currentX: e.clientX, category: tipeUnit });
                      }}
                      onMouseMove={(e) => {
                        if (dragState.isDragging && dragState.category === tipeUnit) {
                          setDragState(prev => ({ ...prev, currentX: e.clientX }));
                        }
                      }}
                      onMouseUp={() => {
                        if (dragState.isDragging && dragState.category === tipeUnit) {
                          const deltaX = dragState.currentX - dragState.startX;
                          const threshold = 50;
                          
                          if (Math.abs(deltaX) > threshold) {
                            const currentIndex = currentIndices[tipeUnit] || 0;
                            let newIndex;
                            
                            if (deltaX > 0) {
                              // Drag right - go to previous
                              newIndex = currentIndex > 0 ? currentIndex - 1 : panoramasInType.length - 1;
                            } else {
                              // Drag left - go to next
                              newIndex = currentIndex < panoramasInType.length - 1 ? currentIndex + 1 : 0;
                            }
                            
                            setCurrentIndices(prev => ({ ...prev, [tipeUnit]: newIndex }));
                          }
                          
                          setDragState({ isDragging: false, startX: 0, currentX: 0, category: null });
                        }
                      }}
                      onMouseLeave={() => {
                        setDragState({ isDragging: false, startX: 0, currentX: 0, category: null });
                      }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        {panoramasInType.map((panorama, index) => {
                          const totalCards = panoramasInType.length;
                          const currentIndex = currentIndices[tipeUnit] || 0;
                          const adjustedIndex = (index - currentIndex + totalCards) % totalCards;
                          const centerIndex = Math.floor(Math.min(totalCards, 3) / 2);
                          const offset = adjustedIndex - centerIndex;
                          
                          // Only show 3 cards max
                          if (adjustedIndex >= 3) return null;
                          
                          const isCenter = adjustedIndex === centerIndex;
                          const scale = isCenter ? 1 : 0.85;
                          let translateX = offset * 200;
                          
                          // Add drag offset for smooth dragging
                          if (dragState.isDragging && dragState.category === tipeUnit) {
                            const dragOffset = dragState.currentX - dragState.startX;
                            translateX += dragOffset;
                          }
                          
                          const zIndex = 3 - Math.abs(offset);
                          const opacity = Math.max(0.6, 1 - Math.abs(offset) * 0.2);
                          
                          return (
                            <div
                              key={panorama.id}
                              className="absolute w-80 h-64 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer"
                              style={{
                                transform: `translateX(${translateX}px) scale(${scale})`,
                                zIndex,
                                opacity
                              }}
                              onClick={(e) => {
                                // Only trigger click if not dragging
                                if (!dragState.isDragging) {
                                  setSelectedPanorama(panorama);
                                  setShow360Modal(true);
                                }
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              <div className="relative w-full h-full">
                                <img 
                                  src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${panorama.filename}`} 
                                  alt={panorama.originalName || 'Panorama'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to gradient if image fails
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div 
                                  className="absolute inset-0 -z-10"
                                  style={{
                                    background: `linear-gradient(135deg, 
                                      ${index % 4 === 0 ? '#60A5FA, #3B82F6' : 
                                        index % 4 === 1 ? '#C084FC, #A855F7' : 
                                        index % 4 === 2 ? '#34D399, #10B981' : 
                                        '#F472B6, #EC4899'})`
                                  }}
                                />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="text-white text-lg font-semibold">
                                  {panorama.roomCategory || panorama.originalName || `Ruang ${panorama.id}`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div className="flex gap-3 mt-8 relative z-10">
              <button 
                className="bg-white/20 hover:bg-white/30 border border-white/50 text-white px-6 py-3 rounded-md transition-all duration-300 font-semibold"
                onClick={() => {
                  setShowPanoramaModal(false);
                  setShowModal(true);
                }}
              >
                ← Pilih Unit Lain
              </button>
              <button 
                className="bg-transparent border border-white/50 hover:border-white/70 text-white px-6 py-3 rounded-md transition-all duration-300 font-semibold"
                onClick={() => setShowPanoramaModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 360 Fullscreen Modal */}
      {show360Modal && selectedPanorama && (
        <div className="fixed inset-0 bg-black z-[100]" onClick={() => setShow360Modal(false)}>
          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setShow360Modal(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
            >
              ✕
            </button>
            
            {/* Back button */}
            <button
              onClick={() => {
                setShow360Modal(false);
                setShowPanoramaModal(true);
              }}
              className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2"
            >
              ← Kembali
            </button>
            
            {/* Matterport-style 360 Viewer */}
            <Canvas
              camera={{ position: [0, 0, 0.1], fov: 75 }}
              className="w-full h-full"
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            >
              <MatterportSphere 
                src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${selectedPanorama.filename}`}
                hotspots={panoramaHotspots}
              />
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                enableRotate={true}
                enableDamping={true}
                dampingFactor={0.1}
                rotateSpeed={-0.3}
                zoomSpeed={0.5}
                minDistance={0.1}
                maxDistance={2}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI - Math.PI / 3}
                autoRotate={false}
              />
            </Canvas>

          </div>
        </div>
      )}
      

    </div>
  );
};

// Matterport-style Sphere Component
const MatterportSphere = ({ src, hotspots = [] }) => {
  const texture = useLoader(THREE.TextureLoader, src);
  
  // Configure texture for seamless panorama
  React.useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.flipY = true;
    }
  }, [texture]);
  
  return (
    <group>
      <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial 
          map={texture} 
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
      
      {/* 3D Hotspots */}
      {hotspots && hotspots.length > 0 && hotspots.map((hotspot, index) => {
        if (!hotspot.x || !hotspot.y) return null;
        
        // Direct mapping for equirectangular panorama
        const u = hotspot.x / 1920; // 0 to 1
        const v = 1 - (hotspot.y / 960); // flip Y, 0 to 1
        
        // Convert to spherical coordinates
        const longitude = u * Math.PI * 2; // 0 to 2π
        const latitude = v * Math.PI; // 0 to π
        
        const radius = 490;
        
        // Standard sphere mapping (same as Three.js texture mapping)
        const x = -radius * Math.sin(latitude) * Math.cos(longitude);
        const y = radius * Math.cos(latitude);
        const z = radius * Math.sin(latitude) * Math.sin(longitude);
        

        
        return (
          <group key={hotspot.id || index} position={[x, y, z]}>
            {/* Hotspot sphere */}
            <mesh
              onClick={() => {
                if (hotspot.destination) {
                  const targetPanorama = panoramas.find(p => 
                    p.filename.toLowerCase().includes(hotspot.destination.toLowerCase())
                  );
                  if (targetPanorama) {
                    setSelectedPanorama(targetPanorama);
                  } else {
                    alert(`Panorama "${hotspot.destination}" tidak ditemukan di unit ini`);
                  }
                }
              }}
            >
              <sphereGeometry args={[10]} />
              <meshBasicMaterial color="#FF0000" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default HomePage;