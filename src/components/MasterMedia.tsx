import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Eye, Download, FolderOpen } from 'lucide-react';

interface MediaFile {
  id: number;
  name: string;
  type: 'panorama360' | 'icon' | 'object360' | 'video';
  category: string;
  url: string;
  size: number;
  uploadDate: string;
  layerId?: number;
  layerName?: string;
  unitId?: number;
  unitName?: string;
  typeId?: number;
  typeName?: string;
  roomType?: string;
}

export const MasterMedia: React.FC = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [layers, setLayers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedLayerForPanorama, setSelectedLayerForPanorama] = useState<number>(4);
  const [selectedUnitForPanorama, setSelectedUnitForPanorama] = useState<number>(0);
  const [selectedTypeForPanorama, setSelectedTypeForPanorama] = useState<number>(1);
  const [selectedRoomForPanorama, setSelectedRoomForPanorama] = useState<string>('lorong');
  const [customNameForPanorama, setCustomNameForPanorama] = useState<string>('');
  const [viewModal, setViewModal] = useState<MediaFile | null>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [editingHotspot, setEditingHotspot] = useState<any>(null);
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);

  // Auto-save when data changes
  useEffect(() => {
    if (hasChanges && media.length > 0) {
      const autoSave = async () => {
        setAutoSaveStatus('Menyimpan...');
        
        try {
          await fetch('http://localhost:3001/api/data/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media })
          });
          
          setAutoSaveStatus('✅ Tersimpan ke server');
          setHasChanges(false);
          setTimeout(() => setAutoSaveStatus(''), 3000);
        } catch (error) {
          setAutoSaveStatus('❌ Gagal menyimpan');
          setTimeout(() => setAutoSaveStatus(''), 3000);
        }
      };
      
      const timer = setTimeout(autoSave, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges, media]);

  useEffect(() => {
    loadMedia();
    loadLayers();
    loadUnits();
    loadHotspots();
  }, []);

  useEffect(() => {
    // Set default unit and type when units are loaded
    if (units.length > 0 && selectedUnitForPanorama === 0) {
      const firstUnit = units[0];
      setSelectedUnitForPanorama(firstUnit.id);
      if (firstUnit?.types?.length > 0) {
        setSelectedTypeForPanorama(firstUnit.types[0].id);
      }
    }
  }, [units]);

  const loadHotspots = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/hotspots');
      if (response.ok) {
        const data = await response.json();
        setHotspots(data.hotspots || []);
      }
    } catch (error) {
      console.error('Failed to load hotspots:', error);
    }
  };

  const loadLayers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/layers');
      if (response.ok) {
        const data = await response.json();
        const panoramaLayers = data.layers.filter((l: any) => l.type === 'panorama');
        setLayers(panoramaLayers);
      }
    } catch (error) {
      console.error('Failed to load layers:', error);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/units');
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded units from backend:', data.units);
        setUnits(data.units || []);
      }
    } catch (error) {
      console.error('Failed to load units from backend:', error);
    }
  };

  const loadMedia = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const handleFileUpload = async (files: FileList, type: string, category: string, layerId?: number, unitId?: number, typeId?: number, roomType?: string, customName?: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const selectedLayer = layers.find(l => l.id === layerId);
      const selectedUnit = units.find(u => u.id === unitId);
      const selectedType = selectedUnit?.types?.find(t => t.id === typeId);
      const displayName = type === 'panorama360' && customName ? customName : file.name;
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('layerName', selectedLayer?.name || '');
        formData.append('unitName', selectedUnit?.name || '');
        formData.append('typeName', selectedType?.name || '');
        formData.append('roomType', roomType || '');
        
        const response = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        
        const newMedia: MediaFile = {
          id: Math.max(...media.map(m => m.id), 0) + 1,
          name: displayName,
          type: type as any,
          category,
          url: result.url,
          size: result.size,
          uploadDate: new Date().toISOString().split('T')[0],
          layerId: type === 'panorama360' ? layerId : undefined,
          layerName: type === 'panorama360' ? selectedLayer?.name : undefined,
          unitId: type === 'panorama360' ? unitId : undefined,
          unitName: type === 'panorama360' ? selectedUnit?.name : undefined,
          typeId: type === 'panorama360' ? typeId : undefined,
          typeName: type === 'panorama360' ? selectedType?.name : undefined,
          roomType: type === 'panorama360' ? roomType : undefined
        };
        
        const updatedMedia = [...media, newMedia];
        setMedia(updatedMedia);
        
        // Save to backend
        await fetch('http://localhost:3001/api/data/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media: updatedMedia })
        });
        
        setHasChanges(true);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload gagal!');
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const addHotspot = (x: number, y: number) => {
    const newHotspot = {
      id: Math.max(...hotspots.map(h => h.id), 0) + 1,
      mediaId: viewModal?.id,
      x,
      y,
      type: 'icon',
      hotspotType: 'info',
      title: 'New Hotspot',
      description: '',
      active: true
    };
    setEditingHotspot(newHotspot);
    setIsHotspotModalOpen(true);
  };

  const saveHotspot = (hotspot: any) => {
    let updatedHotspots;
    if (hotspots.find(h => h.id === hotspot.id)) {
      updatedHotspots = hotspots.map(h => h.id === hotspot.id ? hotspot : h);
    } else {
      updatedHotspots = [...hotspots, hotspot];
    }
    
    setHotspots(updatedHotspots);
    
    // Save to backend
    fetch('http://localhost:3001/api/data/hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotspots: updatedHotspots })
    });
    
    setHasChanges(true);
    setIsHotspotModalOpen(false);
    setEditingHotspot(null);
  };

  const deleteHotspot = (id: number) => {
    const updatedHotspots = hotspots.filter(h => h.id !== id);
    setHotspots(updatedHotspots);
    
    // Save to backend
    fetch('http://localhost:3001/api/data/hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotspots: updatedHotspots })
    });
    
    setHasChanges(true);
  };

  const getHotspotsForMedia = (mediaId: number) => {
    return hotspots.filter(h => h.mediaId === mediaId);
  };

  const panoramaMedia = media.filter(m => m.type === 'panorama360');

  const deleteMedia = (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus media ini? Data akan hilang dari localStorage.')) return;
    
    const updatedMedia = media.filter(m => m.id !== id);
    setMedia(updatedMedia);
    
    // Update backend JSON
    fetch('http://localhost:3001/api/data/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media: updatedMedia })
    });
    
    setHasChanges(true);
    alert('Media berhasil dihapus!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'panorama360': return '🌐';
      case 'marzipano': return '🗺️';
      case 'object360': return '🔄';
      case 'icon': return '🎯';
      case 'video': return '🎬';
      default: return '📁';
    }
  };

  const filteredMedia = selectedCategory === 'all' 
    ? media 
    : media.filter(m => m.type === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Media</h2>
          {autoSaveStatus && (
            <p className="text-sm text-green-600 mt-1">{autoSaveStatus}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Backend mode - Files saved to server</p>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="all">All Media</option>
          <option value="panorama360">Panorama 360°</option>
          <option value="marzipano">Marzipano</option>
          <option value="object360">Object 360°</option>
          <option value="icon">Icons</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {/* Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panorama 360 Upload */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <div className="text-center">
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-medium text-gray-900 mb-2">Panorama 360°</h3>
            <select
              value={selectedLayerForPanorama}
              onChange={(e) => setSelectedLayerForPanorama(parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-1"
            >
              <option value={4}>Layer 4 - Panorama</option>
              <option value={5}>Layer 5 - Panorama</option>
            </select>
            <select
              value={selectedUnitForPanorama}
              onChange={(e) => {
                const unitValue = e.target.value;
                let unit;
                
                // Try by ID first
                const unitId = parseInt(unitValue);
                if (!isNaN(unitId)) {
                  unit = units.find(u => u.id === unitId);
                }
                
                // If not found, try by name (case insensitive)
                if (!unit) {
                  unit = units.find(u => u.name?.toLowerCase() === unitValue.toLowerCase());
                }
                
                if (unit) {
                  setSelectedUnitForPanorama(unit.id);
                  console.log('Selected unit:', unit);
                  if (unit?.types?.length > 0) {
                    setSelectedTypeForPanorama(unit.types[0].id);
                  } else {
                    setSelectedTypeForPanorama(0);
                  }
                }
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-1"
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name} ({unit.types?.length || 0} types)</option>
              ))}
            </select>
            <select
              value={selectedTypeForPanorama}
              onChange={(e) => setSelectedTypeForPanorama(parseInt(e.target.value))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
            >
              <option value="">Select Type ({(() => {
                const selectedUnit = units.find(u => u.id === selectedUnitForPanorama) || 
                                   units.find(u => u.name?.toLowerCase() === selectedUnitForPanorama?.toString().toLowerCase());
                return selectedUnit?.types?.length || 0;
              })()} available)</option>
              {(() => {
                const selectedUnit = units.find(u => u.id === selectedUnitForPanorama) || 
                                   units.find(u => u.name?.toLowerCase() === selectedUnitForPanorama?.toString().toLowerCase());
                return selectedUnit?.types?.map(type => (
                <option key={type.id} value={type.id}>{type.name} - {type.size}m² - {new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0}).format(type.price)}</option>
                )) || [];
              })()}
            </select>
            <select
              value={selectedRoomForPanorama}
              onChange={(e) => setSelectedRoomForPanorama(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
            >
              <option value="lorong">Lorong</option>
              <option value="kamar-1">Kamar 1</option>
              <option value="kamar-2">Kamar 2</option>
              <option value="kamar-utama">Kamar Utama</option>
              <option value="dapur">Dapur</option>
              <option value="ruang-tamu">Ruang Tamu</option>
              <option value="ruang-keluarga">Ruang Keluarga</option>
              <option value="ruang-anak">Ruang Anak</option>
              <option value="kamar-mandi">Kamar Mandi</option>
              <option value="balkon">Balkon</option>
              <option value="ruang-makan">Ruang Makan</option>
              <option value="gudang">Gudang</option>
            </select>
            <input
              type="text"
              value={customNameForPanorama}
              onChange={(e) => setCustomNameForPanorama(e.target.value)}
              placeholder="Custom name (optional)"
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
            />
            <button
              onClick={() => {
                loadUnits();
                console.log('Refreshed units data');
              }}
              className="w-full px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs mb-2 hover:bg-gray-200"
            >
              🔄 Refresh Units
            </button>
            <div className="flex gap-1 mb-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files, 'panorama360', 'Panorama', selectedLayerForPanorama, selectedUnitForPanorama, selectedTypeForPanorama, selectedRoomForPanorama, customNameForPanorama);
                    setCustomNameForPanorama('');
                  }
                }}
                className="hidden"
                id="panorama-upload"
              />
              <label
                htmlFor="panorama-upload"
                className="cursor-pointer bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1 flex-1"
              >
                <Upload className="w-3 h-3" />
                Image
              </label>
              
              <button
                onClick={() => handleMarzipanoUpload()}
                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors inline-flex items-center gap-1 flex-1"
              >
                📁 Marzipano
              </button>
            </div>
          </div>
        </div>

        {/* Object 360 Upload */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-medium text-gray-900 mb-2">Object 360°</h3>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'object360', 'Object 360')}
              className="hidden"
              id="object360-upload"
            />
            <label
              htmlFor="object360-upload"
              className="cursor-pointer bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </label>
          </div>
        </div>

        {/* Icons Upload */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-medium text-gray-900 mb-2">Icons</h3>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'icon', 'Icons')}
              className="hidden"
              id="icon-upload"
            />
            <label
              htmlFor="icon-upload"
              className="cursor-pointer bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </label>
          </div>
        </div>

        {/* Video Upload */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors">
          <div className="text-center">
            <div className="text-3xl mb-2">🎬</div>
            <h3 className="font-medium text-gray-900 mb-2">Videos</h3>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video', 'Videos')}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="cursor-pointer bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </label>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between text-sm mb-2">
            <span>Uploading files...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
          {filteredMedia.map((file) => (
            <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {file.type === 'video' ? (
                  <video 
                    src={file.url} 
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                ) : (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Thumbnail error for:', file.name, 'URL type:', typeof file.url);
                      e.currentTarget.src = '/jakhabitat/placeholder.svg';
                    }}
                  />
                )}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {getTypeIcon(file.type)} {file.type}
                </div>
              </div>
              
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{file.category}</p>
                {file.layerName && (
                  <p className="text-xs text-blue-600 font-medium">{file.layerName}</p>
                )}
                {file.unitName && (
                  <p className="text-xs text-green-600 font-medium">{file.unitName}</p>
                )}
                {file.typeName && (
                  <p className="text-xs text-purple-600 font-medium">{file.typeName}</p>
                )}
                {file.roomType && (
                  <p className="text-xs text-orange-600 font-medium">{file.roomType}</p>
                )}
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                <p className="text-xs text-gray-500">{file.uploadDate}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewModal(file)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.url;
                        link.download = file.name;
                        link.click();
                      }}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => deleteMedia(file.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMedia.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No media files found</p>
            <p className="text-sm">Upload some files to get started</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden flex">
            <div className="flex-1">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">{viewModal.name}</h3>
                <button
                  onClick={() => {
                    setViewModal(null);
                    setEditingHotspot(null);
                    setIsHotspotModalOpen(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4 relative">
                {viewModal.type === 'video' ? (
                  <video 
                    src={viewModal.url} 
                    controls
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="relative">
                    <img 
                      key={`${viewModal.id}-${viewModal.url.substring(0, 20)}`}
                      src={viewModal.url} 
                      alt={viewModal.name}
                      className="max-w-full max-h-[60vh] object-contain cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width * 100);
                        const y = ((e.clientY - rect.top) / rect.height * 100);
                        addHotspot(x, y);
                      }}
                      onError={(e) => {
                        console.log('Image load error for:', viewModal.name, 'URL type:', typeof viewModal.url);
                        e.currentTarget.src = '/jakhabitat/placeholder.svg';
                      }}
                    />
                    {getHotspotsForMedia(viewModal.id).map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600"
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`
                        }}
                        onClick={() => {
                          setEditingHotspot(hotspot);
                          setIsHotspotModalOpen(true);
                        }}
                        title={hotspot.title}
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Click pada gambar untuk menambah hotspot</p>
              </div>
            </div>
            
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h4 className="font-semibold mb-3">Hotspots ({getHotspotsForMedia(viewModal.id).length})</h4>
              <div className="space-y-2">
                {getHotspotsForMedia(viewModal.id).map((hotspot) => (
                  <div key={hotspot.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{hotspot.title}</div>
                        <div className="text-xs text-gray-500">
                          {hotspot.hotspotType === 'info' && '🛈 Info'}
                          {hotspot.hotspotType === 'navigation' && '🧭 Navigation'}
                          {hotspot.hotspotType === 'room' && '🚪 Room'}
                          {hotspot.hotspotType === 'furniture' && '🪑 Furniture'}
                          {hotspot.hotspotType === 'appliance' && '📱 Appliance'}
                          {hotspot.hotspotType === 'window' && '🪟 Window'}
                          {hotspot.hotspotType === 'door' && '🚪 Door'}
                          {hotspot.hotspotType === 'light' && '💡 Light'}
                          {hotspot.hotspotType === 'outlet' && '🔌 Outlet'}
                          {hotspot.hotspotType === 'feature' && '⭐ Feature'}
                          {!hotspot.hotspotType && (hotspot.type === 'icon' ? '🎯 Icon' : '🔗 Link')}
                          {' • '}
                          {hotspot.type === 'icon' ? 'Show Icon' : 'Link to Panorama'}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHotspot(hotspot.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-xs text-gray-600">
                      X: {hotspot.x?.toFixed(1)}%, Y: {hotspot.y?.toFixed(1)}%
                    </div>
                    <button
                      onClick={() => {
                        setEditingHotspot(hotspot);
                        setIsHotspotModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-xs mt-1"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotspot Edit Modal */}
      {isHotspotModalOpen && editingHotspot && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingHotspot.id ? 'Edit Hotspot' : 'Add Hotspot'}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingHotspot.title || ''}
                  onChange={(e) => setEditingHotspot({...editingHotspot, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Hotspot</label>
                <select
                  value={editingHotspot.hotspotType || 'info'}
                  onChange={(e) => setEditingHotspot({...editingHotspot, hotspotType: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="info">🛈 Info</option>
                  <option value="navigation">🧭 Navigation</option>
                  <option value="room">🚪 Room</option>
                  <option value="furniture">🪑 Furniture</option>
                  <option value="appliance">📱 Appliance</option>
                  <option value="window">🪟 Window</option>
                  <option value="door">🚪 Door</option>
                  <option value="light">💡 Light</option>
                  <option value="outlet">🔌 Outlet</option>
                  <option value="feature">⭐ Feature</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Action Type</label>
                <select
                  value={editingHotspot.type}
                  onChange={(e) => setEditingHotspot({...editingHotspot, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="icon">Show Icon</option>
                  <option value="link">Link to Panorama</option>
                </select>
              </div>
              
              {editingHotspot.type === 'link' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Link to Panorama</label>
                  <select
                    value={editingHotspot.targetMediaId || ''}
                    onChange={(e) => {
                      const targetMedia = panoramaMedia.find(m => m.id === parseInt(e.target.value));
                      setEditingHotspot({
                        ...editingHotspot, 
                        targetMediaId: parseInt(e.target.value),
                        targetLayerId: targetMedia?.layerId,
                        targetUnitId: targetMedia?.unitId
                      });
                    }}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="">Select Panorama</option>
                    {panoramaMedia.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} | {m.layerName} - {m.unitName} - {m.typeName} - {m.roomType}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingHotspot.description || ''}
                  onChange={(e) => setEditingHotspot({...editingHotspot, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsHotspotModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveHotspot(editingHotspot)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};