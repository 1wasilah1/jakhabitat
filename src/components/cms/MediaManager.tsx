import React, { useState, useEffect } from 'react';
import { Image, Eye, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const MediaManager = ({ authState }) => {
  const [panoramas, setPanoramas] = useState([]);
  const [groupedPanoramas, setGroupedPanoramas] = useState({});
  const [expandedUnits, setExpandedUnits] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPanorama, setSelectedPanorama] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [pendingHotspot, setPendingHotspot] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadPanoramas();
  }, []);

  useEffect(() => {
    // Group panoramas by unit
    const grouped = panoramas.reduce((acc, panorama) => {
      const unitKey = panorama.unitId || 'no_unit';
      const unitName = panorama.unitName || 'Unit Tidak Diketahui';
      
      if (!acc[unitKey]) {
        acc[unitKey] = {
          unitName,
          unitDetails: `${panorama.tipeUnit || ''} - ${panorama.luas || ''}m² - ${panorama.lokasi || ''}`,
          photos: []
        };
      }
      acc[unitKey].photos.push(panorama);
      return acc;
    }, {});
    
    setGroupedPanoramas(grouped);
  }, [panoramas]);

  const loadPanoramas = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/panoramas', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setPanoramas(result.photos);
      }
    } catch (error) {
      console.error('Error loading panoramas:', error);
    }
  };

  const toggleUnit = (unitKey) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitKey]: !prev[unitKey]
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus panorama ini?')) return;
    
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/panoramas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Panorama berhasil dihapus!');
        loadPanoramas();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus panorama');
    }
  };

  const handleAddHotspot = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    setPendingHotspot({ x, y });
    loadAvailableCategories();
    setShowHotspotModal(true);
  };

  const saveHotspot = async (destination) => {
    if (!pendingHotspot) return;
    
    const newHotspot = { 
      x: pendingHotspot.x, 
      y: pendingHotspot.y, 
      destination: destination 
    };
    const updatedHotspots = [...hotspots, newHotspot];
    setHotspots(updatedHotspots);
    
    try {
      await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/hotspots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify({
          photoId: selectedPanorama.id,
          x: pendingHotspot.x,
          y: pendingHotspot.y,
          destination: destination
        }),
      });
    } catch (error) {
      console.error('Error saving hotspot:', error);
    }
    
    setShowHotspotModal(false);
    setPendingHotspot(null);
  };

  const loadAvailableCategories = async () => {
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/panoramas`, {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        // Filter categories from same unit
        const unitCategories = result.photos
          .filter(photo => photo.unitId === selectedPanorama.unitId && photo.id !== selectedPanorama.id)
          .map(photo => ({
            id: photo.id,
            category: photo.roomCategory,
            filename: photo.filename
          }));
        setAvailableCategories(unitCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleRemoveHotspot = async (index) => {
    const updatedHotspots = hotspots.filter((_, i) => i !== index);
    setHotspots(updatedHotspots);
    
    try {
      await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/hotspots/${selectedPanorama.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify({ hotspots: updatedHotspots }),
      });
    } catch (error) {
      console.error('Error updating hotspots:', error);
    }
  };

  const loadHotspots = async (photoId) => {
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/hotspots/${photoId}`, {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setHotspots(result.hotspots || []);
      }
    } catch (error) {
      console.error('Error loading hotspots:', error);
      setHotspots([]);
    }
  };

  const navigateToDestination = async (destination) => {
    if (!destination || isTransitioning) return;
    
    // Find photo with matching category in same unit
    const targetPhoto = panoramas.find(photo => 
      photo.unitId === selectedPanorama.unitId && 
      photo.roomCategory === destination
    );
    
    if (targetPhoto) {
      setIsTransitioning(true);
      
      // Fade out effect
      setTimeout(async () => {
        setSelectedPanorama(targetPhoto);
        await loadHotspots(targetPhoto.id);
        
        // Fade in effect
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    } else {
      alert('Foto tujuan tidak ditemukan');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Media</h2>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Panorama 360° by Unit</h3>
            <div className="text-sm text-gray-500">
              Total: {panoramas.length} foto dari {Object.keys(groupedPanoramas).length} unit
            </div>
          </div>
          
          {Object.keys(groupedPanoramas).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada media yang diupload
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPanoramas).map(([unitKey, unitData]) => (
                <div key={unitKey} className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleUnit(unitKey)}
                  >
                    <div className="flex items-center space-x-3">
                      {expandedUnits[unitKey] ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{unitData.unitName}</h4>
                        <p className="text-sm text-gray-500">{unitData.unitDetails}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {unitData.photos.length} foto
                      </span>
                    </div>
                  </div>
                  
                  {expandedUnits[unitKey] && (
                    <div className="border-t bg-gray-50">
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {unitData.photos.map((photo) => (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${photo.filename}`}
                                  alt={photo.originalName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                  }}
                                />
                              </div>
                              
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedPanorama(photo);
                                      setShowDetailModal(true);
                                      loadHotspots(photo.id);
                                    }}
                                    className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(photo.id)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="text-center mb-1">
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {String(photo.roomCategory || 'N/A').replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate text-center">
                                  {photo.originalName}
                                </p>
                                <p className="text-xs text-gray-400 text-center">
                                  {photo.fileSize ? `${Math.round(Number(photo.fileSize) / 1024)} KB` : 'N/A'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPanorama && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Media</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Unit:</strong> {String(selectedPanorama.unitName || 'N/A')}
                </div>
                <div>
                  <strong>Kategori:</strong> {String(selectedPanorama.roomCategory || 'N/A').replace('_', ' ')}
                </div>
                <div>
                  <strong>Filename:</strong> {String(selectedPanorama.originalName || '')}
                </div>
                <div>
                  <strong>Size:</strong> {selectedPanorama.fileSize ? `${Math.round(Number(selectedPanorama.fileSize) / 1024)} KB` : 'N/A'}
                </div>
                <div>
                  <strong>Upload Date:</strong> {selectedPanorama.createdAt ? new Date(selectedPanorama.createdAt).toLocaleString('id-ID') : 'N/A'}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Preview:</h4>
                  <button
                    onClick={() => setIsAddingHotspot(!isAddingHotspot)}
                    className={`px-3 py-1 text-sm rounded ${isAddingHotspot ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                  >
                    {isAddingHotspot ? 'Selesai' : 'Tambah Hotspot'}
                  </button>
                </div>
                <div className="relative">
                  <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <img 
                      src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${selectedPanorama.filename}`}
                      alt={selectedPanorama.originalName}
                      className="w-full h-64 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                  
                  {/* Loading overlay during transition */}
                  {isTransitioning && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                      <div className="text-white text-sm">Berpindah ruangan...</div>
                    </div>
                  )}
                  
                  {isAddingHotspot && (
                    <div 
                      className="absolute inset-0 cursor-crosshair"
                      onClick={handleAddHotspot}
                    />
                  )}
                  
                  {!isTransitioning && hotspots.map((hotspot, index) => (
                    <div
                      key={index}
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white cursor-pointer transform -translate-x-2 -translate-y-2 hover:bg-red-600 animate-pulse"
                      style={{ left: hotspot.x, top: hotspot.y }}
                      onClick={() => isAddingHotspot ? handleRemoveHotspot(index) : navigateToDestination(hotspot.destination)}
                      title={isAddingHotspot ? `Hotspot ${index + 1} - Klik untuk hapus` : `Ke ${String(hotspot.destination || 'Unknown').replace('_', ' ')}`}
                    />
                  ))}
                </div>
                
                {hotspots.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">Hotspots ({hotspots.length}):</h5>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {hotspots.map((hotspot, index) => (
                        <div key={index} className="text-xs text-gray-600 flex justify-between">
                          <span>Hotspot {index + 1}: {hotspot.destination ? String(hotspot.destination).replace('_', ' ') : 'No destination'} (x={hotspot.x}px, y={hotspot.y}px)</span>
                          <button 
                            onClick={() => handleRemoveHotspot(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hotspot Destination Modal */}
      {showHotspotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Pilih Tujuan Hotspot</h3>
            <p className="text-sm text-gray-600 mb-4">
              Koordinat: x={pendingHotspot?.x}px, y={pendingHotspot?.y}px
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableCategories.length === 0 ? (
                <p className="text-gray-500 text-sm">Tidak ada kategori lain di unit ini</p>
              ) : (
                availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => saveHotspot(cat.category)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{String(cat.category || 'N/A').replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500">{cat.filename}</div>
                  </button>
                ))
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowHotspotModal(false);
                  setPendingHotspot(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;