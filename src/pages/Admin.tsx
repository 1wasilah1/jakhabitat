import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Upload, Plus } from 'lucide-react';
import { MasterUnit } from '../components/MasterUnit';
import { MasterMedia } from '../components/MasterMedia';

interface Layer {
  id: number;
  name: string;
  type: 'object360' | 'panorama' | 'iframe';
  frameCount?: number;
  path?: string;
  imageUrl?: string;
  videoUrl?: string;
  iframeUrl?: string;
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
  const [activeTab, setActiveTab] = useState('layers');
  const [hasChanges, setHasChanges] = useState(false);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [hotspotPosition, setHotspotPosition] = useState({ x: '0%', y: '0%' });
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    loadLayers();
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data.units || []);
      }
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  // Auto-save when layers change
  useEffect(() => {
    if (hasChanges) {
      const autoSave = async () => {
        try {
          await fetch('http://localhost:3001/api/data/layers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ layers })
          });
          setHasChanges(false);
        } catch (error) {
          console.error('Failed to save layers:', error);
        }
      };
      
      const timer = setTimeout(autoSave, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges, layers]);

  const loadLayers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data/layers');
      if (response.ok) {
        const data = await response.json();
        setLayers(data.layers || []);
      }
    } catch (error) {
      console.error('Failed to load layers:', error);
    }
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
    setHasChanges(true);
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
    setHasChanges(true);
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              {hasChanges && activeTab === 'layers' && (
                <p className="text-sm text-green-600 mt-1">✅ Saving to backend...</p>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'layers' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Layer Management
                </button>
                <button
                  onClick={() => setActiveTab('units')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'units' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Master Unit
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'media' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Master Media
                </button>
              </div>
            </div>

          </div>

          {activeTab === 'units' ? (
            <MasterUnit />
          ) : activeTab === 'media' ? (
            <MasterMedia />
          ) : (
          <div className="grid grid-cols-1 gap-6">

            {/* Layer Settings */}
            {layers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Layer</label>
                <select
                  value={selectedLayer?.id || ''}
                  onChange={(e) => {
                    const layerId = parseInt(e.target.value);
                    const layer = layers.find(l => l.id === layerId);
                    setSelectedLayer(layer || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Select a layer</option>
                  {layers.map(layer => (
                    <option key={layer.id} value={layer.id}>
                      Layer {layer.id} - {layer.name}
                    </option>
                  ))}
                </select>
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
                    {selectedLayer.frameCount || selectedLayer.id === 3 ? (
                      <>
                        {selectedLayer.id === 3 ? (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Object 360° Player</label>
                            <div 
                              className="relative mb-3 cursor-grab active:cursor-grabbing"
                              onMouseDown={(e) => {
                                const startX = e.clientX;
                                const startFrame = selectedFrame;
                                
                                const handleMouseMove = (e: MouseEvent) => {
                                  const deltaX = e.clientX - startX;
                                  const frameChange = Math.floor(deltaX / 3);
                                  let newFrame = startFrame + frameChange;
                                  
                                  if (newFrame < 1) newFrame = 1176 + (newFrame % 1176);
                                  if (newFrame > 1176) newFrame = newFrame % 1176 || 1176;
                                  
                                  setSelectedFrame(newFrame);
                                };
                                
                                const handleMouseUp = () => {
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };
                                
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            >
                              <img
                                key={`frame-${selectedFrame}`}
                                src={`/jakhabitat/layer/layer3/frame_${selectedFrame.toString().padStart(3, '0')}.jpg`}
                                alt={`Frame ${selectedFrame}`}
                                className="w-full h-[600px] object-contain border rounded cursor-crosshair"
                                onError={(e) => {
                                  e.currentTarget.src = '/jakhabitat/placeholder.svg';
                                }}
                                draggable={false}
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
                                  const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
                                  
                                  setHotspotPosition({ x, y });
                                  setShowHotspotModal(true);
                                }}
                              />
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                Frame {selectedFrame}/1176 - Drag to rotate
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Frame</label>
                            <select
                              value={selectedFrame}
                              onChange={(e) => {
                                setSelectedFrame(parseInt(e.target.value));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
                            >
                              {Array.from({length: selectedLayer.frameCount || 0}, (_, i) => (
                                <option key={i + 1} value={i + 1}>Frame {i + 1}</option>
                              ))}
                            </select>
                            
                            <div className="relative mb-3">
                              <img
                                key={`frame-${selectedFrame}`}
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
                            </div>
                          </>
                        )}
                        
                              {/* Show hotspots on preview */}
                              {selectedLayer.id === 3 && getHotspotsForFrame(selectedLayer, selectedFrame).map((hotspot, index) => {
                                const globalIndex = selectedLayer.hotspots.findIndex(h => h === hotspot);
                                return (
                                  <div
                                    key={index}
                                    className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-red-600 group"
                                    style={{
                                      left: hotspot.x,
                                      top: hotspot.y
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(`Delete hotspot "${hotspot.label}"?`)) {
                                        deleteHotspot(selectedLayer.id, globalIndex);
                                      }
                                    }}
                                  >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                      {hotspot.label} - Click to delete
                                    </div>
                                  </div>
                                );
                              })}
                        
                        <p className="text-xs text-gray-500 mb-2">
                          {selectedLayer.id === 3 
                            ? 'Drag to rotate 360°, click to add hotspot' 
                            : `Click on image to add hotspot to Frame ${selectedFrame}`
                          }
                        </p>
                        
                        {/* All hotspots list for Layer 3 */}
                        {selectedLayer.id === 3 && selectedLayer.hotspots.length > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 rounded">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">All Hotspots in Layer 3 ({selectedLayer.hotspots.length}):</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {selectedLayer.hotspots.map((hotspot, index) => (
                                <div key={index} className="text-xs text-gray-600 flex justify-between items-center p-2 bg-white rounded border">
                                  <input 
                                    type="text" 
                                    value={hotspot.label} 
                                    onChange={(e) => updateHotspot(selectedLayer.id, index, 'label', e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs border rounded mr-2"
                                  />
                                  <div className="flex gap-2 items-center">
                                    <span className="text-xs">F{hotspot.frame}</span>
                                    <button 
                                      onClick={() => deleteHotspot(selectedLayer.id, index)}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

                {/* Manual Add Hotspot Button */}
                <button
                  onClick={() => {
                    const newHotspot = {
                      x: '50%',
                      y: '50%',
                      label: `Hotspot ${selectedLayer.hotspots.length + 1}`,
                      frame: selectedLayer.type === 'object360' ? selectedFrame : 1,
                      targetLayer: selectedLayer.id + 1
                    };
                    setLayers(prev => prev.map(layer => 
                      layer.id === selectedLayer.id 
                        ? { ...layer, hotspots: [...layer.hotspots, newHotspot] }
                        : layer
                    ));
                    setHasChanges(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors mb-4"
                >
                  <Plus className="w-3 h-3" />
                  Add Hotspot Manual
                </button>

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
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">X Position (%)</label>
                              <input
                                type="text"
                                value={hotspot.x}
                                onChange={(e) => updateHotspot(selectedLayer.id, globalIndex, 'x', e.target.value)}
                                placeholder="50%"
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Y Position (%)</label>
                              <input
                                type="text"
                                value={hotspot.y}
                                onChange={(e) => updateHotspot(selectedLayer.id, globalIndex, 'y', e.target.value)}
                                placeholder="50%"
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Frame</label>
                              <input
                                type="number"
                                value={hotspot.frame}
                                onChange={(e) => updateHotspot(selectedLayer.id, globalIndex, 'frame', parseInt(e.target.value))}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
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
                        
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">X Position (%)</label>
                            <input
                              type="text"
                              value={hotspot.x}
                              onChange={(e) => updateHotspot(selectedLayer.id, index, 'x', e.target.value)}
                              placeholder="50%"
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Y Position (%)</label>
                            <input
                              type="text"
                              value={hotspot.y}
                              onChange={(e) => updateHotspot(selectedLayer.id, index, 'y', e.target.value)}
                              placeholder="50%"
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frame</label>
                            <input
                              type="number"
                              value={hotspot.frame}
                              onChange={(e) => updateHotspot(selectedLayer.id, index, 'frame', parseInt(e.target.value))}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
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
          )}
        </div>
      </div>
      
      {/* Hotspot Modal */}
      {showHotspotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Hotspot</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const unitId = formData.get('unit') as string;
              const selectedUnit = units.find(u => u.id === parseInt(unitId));
              
              if (selectedLayer && selectedUnit) {
                const newLayers = layers.map(layer => 
                  layer.id === selectedLayer.id 
                    ? {
                        ...layer,
                        hotspots: [...layer.hotspots, {
                          x: hotspotPosition.x,
                          y: hotspotPosition.y,
                          label: selectedUnit.name,
                          frame: selectedFrame,
                          targetLayer: 4
                        }]
                      }
                    : layer
                );
                setLayers(newLayers);
                setSelectedLayer(newLayers.find(l => l.id === selectedLayer.id) || null);
                setHasChanges(true);
              }
              setShowHotspotModal(false);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Unit</label>
                <select name="unit" required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="">Choose a unit...</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  Add Hotspot
                </button>
                <button type="button" onClick={() => setShowHotspotModal(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;