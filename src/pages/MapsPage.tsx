import React, { useState, useEffect } from 'react';

const MapsPage = () => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // DKI Jakarta areas with SVG paths
  const jakartaAreas = [
    { 
      id: 1, 
      name: 'Jakarta Pusat', 
      color: '#FF6B6B', 
      path: 'M45,40 L55,35 L65,40 L60,55 L50,60 L40,55 Z',
      labelX: 52, labelY: 47
    },
    { 
      id: 2, 
      name: 'Jakarta Utara', 
      color: '#4ECDC4', 
      path: 'M35,20 L75,15 L80,25 L75,35 L65,40 L55,35 L45,40 L35,35 Z',
      labelX: 57, labelY: 27
    },
    { 
      id: 3, 
      name: 'Jakarta Barat', 
      color: '#45B7D1', 
      path: 'M20,30 L45,40 L40,55 L35,70 L25,75 L15,65 L10,45 Z',
      labelX: 30, labelY: 52
    },
    { 
      id: 4, 
      name: 'Jakarta Selatan', 
      color: '#96CEB4', 
      path: 'M40,55 L60,55 L75,60 L80,75 L70,85 L45,80 L35,70 Z',
      labelX: 57, labelY: 67
    },
    { 
      id: 5, 
      name: 'Jakarta Timur', 
      color: '#FFEAA7', 
      path: 'M65,40 L85,35 L90,50 L85,65 L75,60 L60,55 Z',
      labelX: 75, labelY: 50
    },
    { 
      id: 6, 
      name: 'Kepulauan Seribu', 
      color: '#DDA0DD', 
      path: 'M15,10 L25,8 L30,15 L25,20 L15,18 Z',
      labelX: 22, labelY: 14
    }
  ];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <h1 className="text-white text-4xl font-bold mb-2">
          Peta DKI Jakarta
        </h1>
        <p className="text-white/80 text-lg">Jelajahi wilayah Daerah Khusus Ibukota Jakarta</p>
      </div>
      
      {/* Compass Legend */}
      <div className="absolute top-32 right-8 bg-white/15 backdrop-blur-md rounded-full p-4 border border-white/20 shadow-2xl">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">U</div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">S</div>
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">B</div>
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">T</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-400"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-white/60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="relative w-full max-w-4xl h-96 mx-8">
          {/* Map SVG Container */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
          >
            {/* Jakarta Areas */}
            {jakartaAreas.map((area, index) => (
              <g key={area.id}>
                {/* Area Shape */}
                <path
                  d={area.path}
                  fill={area.color}
                  stroke="white"
                  strokeWidth="0.8"
                  className="cursor-pointer transition-all duration-500 hover:opacity-80 hover:stroke-yellow-300"
                  style={{
                    animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`,
                    transformOrigin: 'center'
                  }}
                  onMouseEnter={() => !showDetails && setSelectedArea(area)}
                  onMouseLeave={() => !showDetails && setSelectedArea(null)}
                  onClick={() => {
                    setSelectedArea(area);
                    setShowDetails(true);
                  }}
                />
                
                {/* Area Label */}
                <text
                  x={area.labelX}
                  y={area.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="3"
                  fontWeight="bold"
                  className="pointer-events-none"
                  style={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    animation: `fadeIn 1s ease-out ${index * 0.2 + 0.5}s both`
                  }}
                >
                  {area.name.replace('Jakarta ', '')}
                </text>

                {/* Animated dots */}
                <circle
                  cx={area.labelX - 5}
                  cy={area.labelY - 3}
                  r="0.5"
                  fill="white"
                  opacity="0.8"
                  style={{
                    animation: `pulse 2s ease-in-out infinite ${index * 0.3}s`
                  }}
                />
                <circle
                  cx={area.labelX + 5}
                  cy={area.labelY + 3}
                  r="0.3"
                  fill="white"
                  opacity="0.6"
                  style={{
                    animation: `pulse 2s ease-in-out infinite ${index * 0.3 + 0.5}s`
                  }}
                />
              </g>
            ))}

            {/* Central Jakarta Icon */}
            <circle
              cx="52"
              cy="47"
              r="2"
              fill="white"
              stroke="#FF6B6B"
              strokeWidth="0.5"
              style={{
                animation: 'glow 3s ease-in-out infinite'
              }}
            />
            <text
              x="52"
              y="43"
              textAnchor="middle"
              fill="white"
              fontSize="1.5"
              fontWeight="bold"
            >
              🏛️
            </text>
          </svg>

          {/* Hover Info Panel */}
          {selectedArea && !showDetails && (
            <div 
              className="absolute bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl transition-all duration-300 pointer-events-none"
              style={{
                left: `${selectedArea.labelX}%`,
                top: `${selectedArea.labelY - 15}%`,
                transform: 'translateX(-50%)',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              <h3 className="font-bold text-gray-800 mb-1">{selectedArea.name}</h3>
              <p className="text-sm text-gray-600">Klik untuk detail lebih lanjut</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <h3 className="text-white font-bold text-lg">Legenda Peta</h3>
        </div>
        
        <div className="space-y-3 mb-4">
          <h4 className="text-white/90 font-semibold text-sm uppercase tracking-wide">Wilayah DKI Jakarta</h4>
          {jakartaAreas.map((area) => (
            <div key={area.id} className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-all duration-200 cursor-pointer"
                 onClick={() => {
                   setSelectedArea(area);
                   setShowDetails(true);
                 }}>
              <div 
                className="w-5 h-5 rounded-md border-2 border-white/30 shadow-lg"
                style={{ backgroundColor: area.color }}
              />
              <span className="text-white/90 text-sm font-medium">{area.name}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-white/20 pt-3">
          <h4 className="text-white/90 font-semibold text-sm uppercase tracking-wide mb-2">Simbol</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white rounded-full border-2 border-red-400 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-white/80 text-xs">Pusat Pemerintahan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full opacity-60 animate-pulse"></div>
              </div>
              <span className="text-white/80 text-xs">Titik Referensi</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/20">
          <p className="text-white/60 text-xs italic">Klik area untuk detail informasi</p>
        </div>
      </div>
      
      {/* Scale Legend */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/15 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-2xl">
        <div className="text-center mb-3">
          <h4 className="text-white font-semibold text-sm">Skala Peta</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-white mb-1"></div>
            <span className="text-white/80 text-xs">0</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-white/60 mb-1"></div>
            <span className="text-white/80 text-xs">25 km</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-white/40 mb-1"></div>
            <span className="text-white/80 text-xs">50 km</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-white/60 text-xs">Skala Aproximasi</p>
        </div>
      </div>

      {/* Navigation Legend */}
      <div className="absolute bottom-8 right-8 bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <h3 className="text-white font-bold text-lg">Navigasi</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🖱️</span>
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">Hover</p>
              <p className="text-white/60 text-xs">Lihat info singkat</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">👆</span>
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">Klik</p>
              <p className="text-white/60 text-xs">Detail wilayah</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎯</span>
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">Zoom</p>
              <p className="text-white/60 text-xs">Area interaktif</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/20">
          <p className="text-white/60 text-xs text-center">DKI Jakarta - 2024</p>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
      >
        <span>←</span>
        <span>Kembali</span>
      </button>

      {/* Details Modal */}
      {showDetails && selectedArea && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => {
          setShowDetails(false);
          setSelectedArea(null);
        }}>
          <div className="bg-white rounded-xl p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: selectedArea.color }}>
              {selectedArea.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Informasi detail tentang wilayah {selectedArea.name} akan ditampilkan di sini.
            </p>
            <button
              onClick={() => setShowDetails(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes pulse {
            0%, 100% { 
              opacity: 0.4;
              transform: scale(1);
            }
            50% { 
              opacity: 1;
              transform: scale(1.5);
            }
          }
          
          @keyframes glow {
            0%, 100% { 
              filter: drop-shadow(0 0 5px rgba(255, 107, 107, 0.5));
            }
            50% { 
              filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.8));
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `
      }} />
    </div>
  );
};

export default MapsPage;