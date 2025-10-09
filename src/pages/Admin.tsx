import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit, Upload } from 'lucide-react';

interface Layer {
  id: number;
  name: string;
  type: 'object360' | 'panorama';
  frameCount?: number;
  path?: string;
  imageUrl?: string;
  videoUrl?: string;
  hotspots: Array<{
    x: string;
    y: string;
    label: string;
    frame: number;
    targetLayer: number;
  }>;
}

const Admin: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  useEffect(() => {
    loadLayers();
  }, []);

  const loadLayers = async () => {
    try {
      const response = await fetch('/jakhabitat/data/layers.json');
      const data = await response.json();
      setLayers(data.layers);
    } catch (error) {
      console.error('Failed to load layers:', error);
    }
  };

  const saveLayers = () => {
    const dataStr = JSON.stringify({ layers }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'layers.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const addHotspot = (layerId: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? {
            ...layer,
            hotspots: [...layer.hotspots, {
              x: '50%',
              y: '50%',
              label: 'New Hotspot',
              frame: 1,
              targetLayer: layerId + 1
            }]
          }
        : layer
    ));
  };

  const updateHotspot = (layerId: number, hotspotIndex: number, field: string, value: any) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? {
            ...layer,
            hotspots: layer.hotspots.map((hotspot, index) => 
              index === hotspotIndex 
                ? { ...hotspot, [field]: value }
                : hotspot
            )
          }
        : layer
    ));
  };

  const updateLayer = (layerId: number, field: string, value: any) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, [field]: value }
        : layer
    ));
  };

  const deleteHotspot = (layerId: number, hotspotIndex: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? {
            ...layer,
            hotspots: layer.hotspots.filter((_, index) => index !== hotspotIndex)
          }
        : layer
    ));
  };

  const handleFrameUpload = async (layerId: number, files: FileList | null) => {
    if (!files) return;
    
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('frames', file);
    });
    formData.append('layerId', layerId.toString());
    
    try {
      const response = await fetch('/api/upload/frames', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        updateLayer(layerId, 'frameCount', files.length);
        updateLayer(layerId, 'path', result.path);
        alert('Frames uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  const handlePanoramaUpload = async (layerId: number, file: File | undefined) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('panorama', file);
    formData.append('layerId', layerId.toString());
    
    try {
      const response = await fetch('/api/upload/panorama', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        updateLayer(layerId, 'imageUrl', result.imageUrl);
        alert('Panorama uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed!');
    }
  };

  const handleVideoUpload = async (layerId: number, file: File | undefined) => {
    if (!file) return;
    
    setIsConverting(true);
    setConversionProgress(0);
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('layerId', layerId.toString());
    
    try {
      const response = await fetch('/api/upload/video-convert', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        updateLayer(layerId, 'frameCount', result.frameCount);
        updateLayer(layerId, 'path', result.path);
        updateLayer(layerId, 'videoUrl', result.videoUrl);
        alert('Video converted successfully!');
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Conversion failed!');
    } finally {
      setIsConverting(false);
    }
  };

  const getHotspotsForFrame = (layer: Layer, frame: number) => {
    return layer.hotspots.filter(hotspot => hotspot.frame === frame);
  };

  const addHotspotToFrame = (layerId: number, frame: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? {
            ...layer,
            hotspots: [...layer.hotspots, {
              x: '50%',
              y: '50%',
              label: `Hotspot Frame ${frame}`,
              frame: frame,
              targetLayer: layerId + 1
            }]
          }
        : layer
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Layer Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => window.open('/jakhabitat/video-frame', '_blank')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Video to Frames
              </button>
              <button
                onClick={saveLayers}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Download JSON
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Layer List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Layers</h2>
              {layers.map(layer => (
                <div 
                  key={layer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLayer?.id === layer.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLayer(layer)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{layer.name}</h3>
                      <p className="text-sm text-gray-600">
                        Type: {layer.type} • 
                        {layer.type === 'object360' ? ` ${layer.frameCount} frames` : ' Panorama'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {layer.hotspots.length} hotspot(s)
                      </p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      #{layer.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Layer Settings */}
            {selectedLayer && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedLayer.name} - Settings
                </h2>
                
                <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layer Name</label>
                    <input
                      type="text"
                      value={selectedLayer.name}
                      onChange={(e) => updateLayer(selectedLayer.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={selectedLayer.type}
                      onChange={(e) => updateLayer(selectedLayer.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="object360">Object 360°</option>
                      <option value="panorama">Panorama 360°</option>
                    </select>
                  </div>
                  
                  {selectedLayer.type === 'object360' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frame Count</label>
                        <input
                          type="number"
                          value={selectedLayer.frameCount || 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-updated from upload</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frames Path</label>
                        <input
                          type="text"
                          value={selectedLayer.path || ''}
                          onChange={(e) => updateLayer(selectedLayer.id, 'path', e.target.value)}
                          placeholder="/jakhabitat/layer/layer1/"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video (Auto Convert)</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleVideoUpload(selectedLayer.id, e.target.files?.[0])}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                            disabled={isConverting}
                          />
                          {isConverting && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: `${conversionProgress}%`}}></div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">Upload video to auto-convert to frames</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Or Upload Frames Manually</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFrameUpload(selectedLayer.id, e.target.files)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                          />
                          <p className="text-xs text-gray-500">Upload multiple images for 360° frames</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Panorama Image URL</label>
                        <input
                          type="text"
                          value={selectedLayer.imageUrl || ''}
                          onChange={(e) => updateLayer(selectedLayer.id, 'imageUrl', e.target.value)}
                          placeholder="/jakhabitat/layer/layer4/panorama.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Panorama</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePanoramaUpload(selectedLayer.id, e.target.files?.[0])}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                        />
                        <p className="text-xs text-gray-500">Upload panorama image</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Hotspots */}
            {selectedLayer && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Hotspots ({selectedLayer.hotspots.length})
                  </h2>
                </div>
                
                {/* Object 360 Preview & Hotspot Management */}
                {selectedLayer.type === 'object360' && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    {selectedLayer.frameCount ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Frame</label>
                        <select
                          value={selectedFrame}
                          onChange={(e) => setSelectedFrame(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
                        >
                          {Array.from({length: selectedLayer.frameCount}, (_, i) => (
                            <option key={i + 1} value={i + 1}>Frame {i + 1}</option>
                          ))}
                        </select>
                        
                        {/* Frame Preview */}
                        <div className="relative mb-3">
                          <img
                            src={`${selectedLayer.path}${selectedFrame.toString().padStart(3, '0')}.jpg`}
                            alt={`Frame ${selectedFrame}`}
                            className="w-full h-64 object-contain border rounded cursor-crosshair"
                            onError={(e) => {
                              e.currentTarget.src = '/jakhabitat/placeholder.svg';
                            }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
                              const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
                              
                              setLayers(prev => prev.map(layer => 
                                layer.id === selectedLayer.id 
                                  ? {
                                      ...layer,
                                      hotspots: [...layer.hotspots, {
                                        x,
                                        y,
                                        label: `Hotspot ${layer.hotspots.length + 1}`,
                                        frame: selectedFrame,
                                        targetLayer: selectedLayer.id + 1
                                      }]
                                    }
                                  : layer
                              ));
                            }}
                          />
                          
                          {/* Show hotspots on preview */}
                          {getHotspotsForFrame(selectedLayer, selectedFrame).map((hotspot, index) => (
                            <div
                              key={index}
                              className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600"
                              style={{
                                left: hotspot.x,
                                top: hotspot.y
                              }}
                              title={hotspot.label}
                            />
                          ))}
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2">Click on image to add hotspot to Frame {selectedFrame}</p>
                      </>
                    ) : (
                      <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                        Upload video or frames first to manage hotspots
                      </div>
                    )}
                  </div>
                )}
                
                {/* Panorama Preview & Hotspot Management */}
                {selectedLayer.type === 'panorama' && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    {selectedLayer.imageUrl ? (
                      <>
                        {/* Panorama Preview */}
                        <div className="relative mb-3">
                          <img
                            src={selectedLayer.imageUrl}
                            alt="Panorama"
                            className="w-full h-64 object-cover border rounded cursor-crosshair"
                            onError={(e) => {
                              e.currentTarget.src = '/jakhabitat/placeholder.svg';
                            }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
                              const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
                              
                              setLayers(prev => prev.map(layer => 
                                layer.id === selectedLayer.id 
                                  ? {
                                      ...layer,
                                      hotspots: [...layer.hotspots, {
                                        x,
                                        y,
                                        label: `Hotspot ${layer.hotspots.length + 1}`,
                                        frame: 1,
                                        targetLayer: selectedLayer.id + 1
                                      }]
                                    }
                                  : layer
                              ));
                            }}
                          />
                          
                          {/* Show hotspots on preview */}
                          {selectedLayer.hotspots.map((hotspot, index) => (
                            <div
                              key={index}
                              className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600"
                              style={{
                                left: hotspot.x,
                                top: hotspot.y
                              }}
                              title={hotspot.label}
                            />
                          ))}
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-2">Click on panorama image to add hotspot</p>
                      </>
                    ) : (
                      <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                        Upload panorama image first to manage hotspots
                      </div>
                    )}
                  </div>
                )}

                {/* Hotspot List */}
                {selectedLayer.type === 'object360' ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Hotspots for Frame {selectedFrame} ({getHotspotsForFrame(selectedLayer, selectedFrame).length})
                    </h3>
                    {getHotspotsForFrame(selectedLayer, selectedFrame).map((hotspot, index) => {
                      const globalIndex = selectedLayer.hotspots.findIndex(h => h === hotspot);
                      return (
                        <div key={globalIndex} className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hotspot Name</label>
                              <input
                                type="text"
                                value={hotspot.label}
                                onChange={(e) => updateHotspot(selectedLayer.id, globalIndex, 'label', e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Target Layer</label>
                              <select
                                value={hotspot.targetLayer}
                                onChange={(e) => updateHotspot(selectedLayer.id, globalIndex, 'targetLayer', parseInt(e.target.value))}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                              >
                                {layers.map(layer => (
                                  <option key={layer.id} value={layer.id}>
                                    Layer {layer.id} - {layer.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Position: {hotspot.x}, {hotspot.y}</span>
                            <button
                              onClick={() => deleteHotspot(selectedLayer.id, globalIndex)}
                              className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {getHotspotsForFrame(selectedLayer, selectedFrame).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hotspots on frame {selectedFrame}. Click on the image above to add one.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Panorama Hotspots ({selectedLayer.hotspots.length})
                    </h3>
                    {selectedLayer.hotspots.map((hotspot, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hotspot Name</label>
                            <input
                              type="text"
                              value={hotspot.label}
                              onChange={(e) => updateHotspot(selectedLayer.id, index, 'label', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Layer</label>
                            <select
                              value={hotspot.targetLayer}
                              onChange={(e) => updateHotspot(selectedLayer.id, index, 'targetLayer', parseInt(e.target.value))}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                              {layers.map(layer => (
                                <option key={layer.id} value={layer.id}>
                                  Layer {layer.id} - {layer.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Position: {hotspot.x}, {hotspot.y}</span>
                          <button
                            onClick={() => deleteHotspot(selectedLayer.id, index)}
                            className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedLayer.hotspots.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No hotspots yet. Click on the panorama image above to add one.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;