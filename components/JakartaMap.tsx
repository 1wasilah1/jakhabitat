import React, { useState } from 'react';

const JakartaMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const locationData = {
    samawa: {
      name: 'Menara Samawa - Jakarta Timur',
      units: 780,
      data: [
        { tipe: 'STO', luas: '21,00', total: 160, sisa: 19 },
        { tipe: 'STC', luas: '22,25', total: 80, sisa: 7 },
        { tipe: '1BR', luas: '23,95', total: 160, sisa: 7 },
        { tipe: '1BRC', luas: '24,25', total: 20, sisa: 2 },
        { tipe: '2BR', luas: '34,65', total: 339, sisa: 7 },
        { tipe: '2BR - CSR an Tihana', luas: '34,65', total: 1, sisa: 0 },
        { tipe: '2BRC', luas: '35,30', total: 20, sisa: 0 }
      ]
    },
    kanaya: {
      name: 'Menara Kanaya - Jakarta Timur',
      units: 868,
      data: [
        { tipe: 'ST', luas: '23,40', total: 401, sisa: 382 },
        { tipe: 'ST.A', luas: '24,20', total: 46, sisa: 35 },
        { tipe: 'ST.B', luas: '22,60', total: 46, sisa: 43 },
        { tipe: 'ST.C', luas: '22,10', total: 23, sisa: 13 },
        { tipe: 'ST.D', luas: '27,00', total: 15, sisa: 13 },
        { tipe: 'ST.E', luas: '24,50', total: 7, sisa: 4 },
        { tipe: '2B', luas: '35,60', total: 198, sisa: 172 },
        { tipe: '2B.A', luas: '36,00', total: 88, sisa: 47 },
        { tipe: '2B.B', luas: '34,20', total: 44, sisa: 24 }
      ]
    }
  };

  return (
    <div className="bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Lokasi Sebaran Unit FPPR Hunian Terjangkau Milik di Jakarta</h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="relative">
            <div className="relative w-full h-[500px] bg-white">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Jakarta shape matching the reference image exactly */}
                
                {/* Jakarta Barat (Yellow/Orange) - Left irregular shape */}
                <path d="M5,35 L20,30 L25,40 L22,55 L18,70 L12,75 L8,70 L5,55 L3,45 Z" fill="#FCD34D" stroke="#000" strokeWidth="0.2" />
                
                {/* Jakarta Utara (Blue) - Top irregular coastline */}
                <path d="M20,15 L40,12 L60,10 L75,12 L85,16 L88,20 L85,25 L75,23 L60,22 L40,24 L25,26 L20,28 Z" fill="#3B82F6" stroke="#000" strokeWidth="0.2" />
                
                {/* Jakarta Pusat (Red/Orange) - Center small area */}
                <path d="M25,28 L40,24 L50,25 L48,35 L45,40 L35,38 L28,35 Z" fill="#EF4444" stroke="#000" strokeWidth="0.2" />
                
                {/* Jakarta Timur (Green) - Right large irregular area */}
                <path d="M50,25 L60,22 L75,23 L85,25 L92,30 L95,40 L93,55 L88,70 L82,80 L75,82 L65,78 L55,75 L50,65 L48,50 L48,35 Z" fill="#10B981" stroke="#000" strokeWidth="0.2" />
                
                {/* Jakarta Selatan (Pink/Magenta) - Bottom large area */}
                <path d="M18,70 L35,65 L50,65 L55,75 L65,78 L75,82 L82,80 L78,88 L70,92 L55,94 L40,92 L25,88 L18,82 L12,75 Z" fill="#EC4899" stroke="#000" strokeWidth="0.2" />
                
                {/* Location markers */}
                <circle cx="15" cy="50" r="1.5" fill="#000" />
                <circle cx="65" cy="18" r="1.5" fill="#000" />
                <circle cx="45" cy="70" r="1.5" fill="#000" />
                <circle cx="60" cy="78" r="1.5" fill="#000" />
                <circle cx="70" cy="75" r="1.5" fill="#000" />
                
                {/* Connecting lines */}
                <line x1="15" y1="50" x2="2" y2="35" stroke="#000" strokeWidth="0.5" />
                <line x1="65" y1="18" x2="85" y2="5" stroke="#000" strokeWidth="0.5" />
                <line x1="45" y1="70" x2="25" y2="88" stroke="#000" strokeWidth="0.5" />
                <line x1="70" y1="75" x2="88" y2="92" stroke="#000" strokeWidth="0.5" />
              </svg>
              
              {/* Building images with labels */}
              <div className="absolute top-2 left-2 text-center">
                <div className="w-16 h-12 bg-gray-300 rounded-full mb-1 flex items-center justify-center">
                  <div className="w-12 h-8 bg-blue-200 rounded"></div>
                </div>
                <div className="text-xs font-bold">
                  <div>Sentraland Cengkareng</div>
                  <div>Jakarta Barat</div>
                </div>
              </div>
              
              <div className="absolute top-2 right-2 text-center">
                <div className="w-16 h-12 bg-gray-300 rounded-full mb-1 flex items-center justify-center">
                  <div className="w-12 h-8 bg-orange-200 rounded"></div>
                </div>
                <div className="text-xs font-bold">
                  <div>Bandar Kemayoran</div>
                  <div>Jakarta Utara</div>
                </div>
              </div>
              
              <div className="absolute bottom-16 left-2 text-center">
                <div className="w-16 h-12 bg-gray-300 rounded-full mb-1 flex items-center justify-center">
                  <div className="w-12 h-8 bg-green-200 rounded"></div>
                </div>
                <div className="text-xs font-bold">
                  <div>- Menara Samawa</div>
                  <div>- Menara Swasana</div>
                  <div>Jakarta Timur</div>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2 text-center">
                <div className="w-16 h-12 bg-gray-300 rounded-full mb-1 flex items-center justify-center">
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="text-xs font-bold">
                  <div>Menara Kanaya</div>
                  <div>Jakarta Timur</div>
                </div>
              </div>
              
              {/* Diamond icon */}
              <div className="absolute bottom-8 right-8">
                <div className="w-6 h-6 bg-orange-400 transform rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Data List Section */}
          <div className="bg-white p-6">
            <h3 className="text-xl font-bold mb-6">LOKASI SEBARAN UNIT FPPR HUNIAN TERJANGKAU MILIK DI JAKARTA</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">1. Sentraland Cengkareng - Jakarta Barat</span>
                <span className="font-bold">166 UNIT</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">2. Bandar Kemayoran - Jakarta Utara</span>
                <span className="font-bold">38 UNIT</span>
              </div>
              
              <div 
                className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-500 cursor-pointer"
                onClick={() => setSelectedLocation(selectedLocation === 'samawa' ? null : 'samawa')}
              >
                <span className="text-sm font-medium">3. Menara Samawa - Jakarta Timur</span>
                <span className="font-bold text-green-700">780 UNIT</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">4. Menara Swasana - Jakarta Timur</span>
                <span className="font-bold">96 UNIT</span>
              </div>
              
              <div 
                className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-500 cursor-pointer"
                onClick={() => setSelectedLocation(selectedLocation === 'kanaya' ? null : 'kanaya')}
              >
                <span className="text-sm font-medium">5. Menara Kanaya - Jakarta Timur</span>
                <span className="font-bold text-green-700">868 UNIT</span>
              </div>
            </div>
            
            {selectedLocation && (
              <div className="mt-6 p-4 bg-blue-50 rounded border">
                <h4 className="font-semibold text-lg mb-3 text-blue-600">
                  {locationData[selectedLocation as keyof typeof locationData].name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Total Unit: {locationData[selectedLocation as keyof typeof locationData].units}
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left border">Tipe</th>
                        <th className="p-2 text-center border">Luas</th>
                        <th className="p-2 text-center border">Total</th>
                        <th className="p-2 text-center border">Sisa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationData[selectedLocation as keyof typeof locationData].data.slice(0, 4).map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 border text-xs">{item.tipe}</td>
                          <td className="p-2 border text-center text-xs">{item.luas}</td>
                          <td className="p-2 border text-center text-xs">{item.total}</td>
                          <td className="p-2 border text-center text-xs">{item.sisa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JakartaMap;