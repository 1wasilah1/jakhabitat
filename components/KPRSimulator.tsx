import React, { useState, useEffect } from 'react';

const KPRSimulator = () => {
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTenor, setSelectedTenor] = useState('5');
  const [showModal, setShowModal] = useState(false);
  const [panoramaProjects, setPanoramaProjects] = useState([]);
  const [panoramaScenes, setPanoramaScenes] = useState({});
  const [projectUnits, setProjectUnits] = useState([]);

  const towerData = {
    'kanaya': {
      name: 'Kanaya Nuansa Cilangkap',
      units: [
        { type: '22.1 ST.C', luas: '22,1', harga: 225420000 },
        { type: '22.6 ST.B', luas: '22,6', harga: 230520000 },
        { type: '23.4 ST', luas: '23,4', harga: 238680000 },
        { type: '24.2 ST.A', luas: '24,2', harga: 246840000 },
        { type: '34.2 2B.B', luas: '34,2', harga: 395753850 },
        { type: '36 2B.A', luas: '36', harga: 416583000 }
      ]
    },
    'samawa': {
      name: 'Samawa Nuansa Pondok Kelapa',
      units: [
        { type: '22.1 ST.C', luas: '22,1', harga: 225420000 },
        { type: '22.6 ST.B', luas: '22,6', harga: 230520000 },
        { type: '23.4 ST', luas: '23,4', harga: 238680000 },
        { type: '24.2 ST.A', luas: '24,2', harga: 246840000 },
        { type: '34.2 2B.B', luas: '34,2', harga: 395753850 },
        { type: '36 2B.A', luas: '36', harga: 416583000 }
      ]
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    loadProjectUnits();
  }, []);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        loadPanoramaData();
      }, 200);
    }
  }, [showModal]);

  const loadProjectUnits = async () => {
    try {
      const res = await fetch('/api/panorama/projects');
      const data = await res.json();
      const units = (data.projects || []).filter((p: any) => p.unitType && p.price);
      setProjectUnits(units);
    } catch (error) {
      console.error('Failed to load project units:', error);
    }
  };

  const getFilteredUnits = () => {
    if (!selectedTower) return [];
    console.log('Project units:', projectUnits);
    console.log('Selected tower:', selectedTower);
    
    return projectUnits.filter((unit: any) => {
      if (selectedTower === 'kanaya') {
        return unit.name?.toLowerCase().includes('kanaya') || unit.location?.toLowerCase().includes('cilangkap');
      }
      if (selectedTower === 'samawa') {
        return unit.name?.toLowerCase().includes('samawa') || unit.location?.toLowerCase().includes('pondok kelapa');
      }
      return false;
    });
  };

  const loadPanoramaData = async () => {
    try {
      const projectId = 'project-1761262951055';
      const scenesRes = await fetch(`/api/panorama/scenes?projectId=${projectId}`);
      const scenesData = await scenesRes.json();
      setPanoramaScenes(scenesData.scenes || {});
      
      setTimeout(() => {
        initPanorama(scenesData.scenes);
      }, 300);
    } catch (error) {
      console.error('Failed to load panorama data:', error);
    }
  };

  const initPanorama = (scenes: any) => {
    const sceneIds = Object.keys(scenes);
    if (sceneIds.length === 0) return;
    
    const firstScene = scenes[sceneIds[0]];
    if (!firstScene?.scene) return;

    const container = document.getElementById('panorama-preview');
    if (!container) return;

    if (typeof window !== 'undefined' && (window as any).pannellum) {
      try {
        const sceneConfig: any = {};
        Object.keys(scenes).forEach(sceneId => {
          sceneConfig[sceneId] = {
            type: 'equirectangular',
            panorama: scenes[sceneId].scene,
            autoLoad: true,
            hotSpots: (scenes[sceneId].hotspots || []).map((hotspot: any) => ({
              id: hotspot.id,
              pitch: (50 - hotspot.y) * 1.8,
              yaw: (hotspot.x - 50) * 3.6,
              type: hotspot.type === 'scene' ? 'scene' : 'info',
              text: hotspot.title,
              sceneId: hotspot.targetScene
            }))
          };
        });
        
        (window as any).pannellum.viewer(container, {
          default: {
            firstScene: sceneIds[0],
            autoLoad: true
          },
          scenes: sceneConfig
        });
      } catch (error) {
        console.error('Error initializing panorama:', error);
      }
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.onload = () => {
        setTimeout(() => initPanorama(scenes), 100);
      };
      document.head.appendChild(script);
    }
  };

  const calculateInstallment = (price: number, years: number) => {
    const monthlyRate = 0.05 / 12; // 5% annual rate
    const numPayments = years * 12;
    const principal = price * 0.8; // 80% financing
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    return monthly;
  };

  return (
    <div className="bg-gray-200 p-8 rounded-lg">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Panel - Unit Types */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold text-center mb-6">Tipe dan Harga Unit Tower</h3>
            
            <div className="flex mb-6">
              <button
                className={`flex-1 px-4 py-2 rounded-l-lg font-medium ${
                  selectedTower === 'kanaya' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedTower('kanaya');
                  setSelectedUnit('');
                }}
              >
                Kanaya Nuansa Cilangkap
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-r-lg font-medium ${
                  selectedTower === 'samawa' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedTower('samawa');
                  setSelectedUnit('');
                }}
              >
                Samawa Nuansa Pondok Kelapa
              </button>
            </div>

            {selectedTower && projectUnits.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 py-2 font-semibold text-gray-700">
                  <div>Tipe Hunian</div>
                  <div>Luas</div>
                  <div>Harga</div>
                </div>
                {getFilteredUnits().map((unit: any, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm">
                    <div>{unit.unitType}</div>
                    <div>{unit.area || '-'}</div>
                    <div>{formatRupiah(unit.price)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              Harga terakhir diperbarui 28/04/2025 13:50 WIB
            </div>
          </div>

          {/* Right Panel - Calculation */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold text-center mb-6">Hitung Simulasi Cicilan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Tower</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  value={selectedTower}
                  onChange={(e) => setSelectedTower(e.target.value)}
                >
                  <option value="">Pilih Tipe Tower</option>
                  <option value="kanaya">Kanaya Nuansa Cilangkap</option>
                  <option value="samawa">Samawa Nuansa Pondok Kelapa</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipe Hunian</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  disabled={!selectedTower}
                >
                  <option value="">Pilih Tipe Unit</option>
                  {selectedTower && getFilteredUnits().map((unit, index) => (
                    <option key={index} value={index}>{unit.unitType} | {unit.area || '-'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Jangka Waktu (Tahun)</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  value={selectedTenor}
                  onChange={(e) => setSelectedTenor(e.target.value)}
                >
                  <option value="5">5 Tahun</option>
                  <option value="10">10 Tahun</option>
                  <option value="15">15 Tahun</option>
                  <option value="20">20 Tahun</option>
                </select>
                <div className="text-sm text-gray-500 mt-1">Bunga Fix 5,00%</div>
              </div>

              <button 
                className={`w-full py-3 rounded-lg font-medium ${
                  selectedTower && selectedUnit !== '' 
                    ? 'bg-gray-900 text-white hover:bg-gray-800' 
                    : 'bg-gray-300 text-gray-600'
                }`}
                disabled={!selectedTower || selectedUnit === ''}
                onClick={() => setShowModal(true)}
              >
                Preview
              </button>

              {selectedTower && selectedUnit !== '' && getFilteredUnits()[selectedUnit] && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Hasil Simulasi:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Harga Unit:</span>
                      <span className="font-medium">
                        {formatRupiah(getFilteredUnits()[selectedUnit].price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cicilan/bulan:</span>
                      <span className="font-medium text-green-600">
                        {formatRupiah(calculateInstallment(getFilteredUnits()[selectedUnit].price, parseInt(selectedTenor)))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[95vw] h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Preview {selectedTower && getFilteredUnits()[selectedUnit]?.unitType}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
            
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <div id="panorama-preview" className="w-full h-full"></div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default KPRSimulator;