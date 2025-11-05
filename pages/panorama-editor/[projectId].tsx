import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Hotspot {
  id: string;
  x: string;
  y: string;
  title: string;
  description: string;
  type: 'info' | 'link' | 'scene' | 'layer' | 'project' | 'asset';
  targetLayer?: number;
  targetUrl?: string;
  targetScene?: string;
  targetProject?: string;
  targetAsset?: string;
  assetUrl?: string;
  sceneId?: string;
  assetWidth?: number;
  assetHeight?: number;
  backgroundSize?: string;
}

const PanoramaEditor: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [message, setMessage] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [currentScene, setCurrentScene] = useState('0');
  const [scenes, setScenes] = useState<{id: string, name: string}[]>([]);
  const [defaultScene, setDefaultScene] = useState('0');
  const [showAddImage, setShowAddImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [draggingHotspot, setDraggingHotspot] = useState<string | null>(null);
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  const [assets, setAssets] = useState<{name: string, type: string, url: string}[]>([]);
  const panoramaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      loadScenes();
      loadHotspots();
      loadProjects();
      loadAssets();
    }
  }, [projectId, currentScene]);

  useEffect(() => {
    if (scenes.length > 0) {
      loadPannellum();
    }
  }, [currentScene, scenes]);

  const loadPannellum = () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);
      
      setTimeout(() => {
        initPannellum();
      }, 100);
    };
    if (!document.querySelector('script[src*="pannellum"]')) {
      document.head.appendChild(script);
    } else {
      initPannellum();
    }
  };

  const initPannellum = () => {
    const container = document.getElementById(`panorama-${currentScene}`);
    if (container && (window as any).pannellum) {
      container.innerHTML = '';
      
      setTimeout(() => {
        const currentSceneHotspots = hotspots.filter(hotspot => hotspot.sceneId === currentScene);
        
        // Add custom CSS for hotspots with assets
        currentSceneHotspots.forEach(hotspot => {
          if (hotspot.assetUrl) {
            const style = document.createElement('style');
            style.textContent = `
              .custom-hotspot-${hotspot.id} {
                background-image: url('${hotspot.assetUrl}') !important;
                background-size: ${hotspot.backgroundSize || 'contain'} !important;
                background-repeat: no-repeat !important;
                background-position: center !important;
                width: ${hotspot.assetWidth || 60}px !important;
                height: ${hotspot.assetHeight || 60}px !important;
              }
            `;
            document.head.appendChild(style);
          }
        });

        (window as any).pannellum.viewer(container, {
          type: 'equirectangular',
          panorama: `/panorama/${projectId}/app-files/scene-${currentScene}.jpg`,
          autoLoad: true,
          showControls: true,
          mouseZoom: true,
          keyboardZoom: false,
          hotSpots: currentSceneHotspots.map(hotspot => ({
            pitch: (50 - parseFloat(hotspot.y.replace('%', ''))) * 0.9,
            yaw: (parseFloat(hotspot.x.replace('%', '')) - 50) * 3.6,
            type: hotspot.type === 'scene' ? 'scene' : 'info',
            text: hotspot.title,
            ...(hotspot.type === 'scene' && { sceneId: hotspot.targetScene }),
            ...(hotspot.assetUrl && { cssClass: `custom-hotspot-${hotspot.id}` }),
            clickHandlerFunc: () => {
              if (hotspot.type === 'scene' && hotspot.targetScene) {
                setCurrentScene(hotspot.targetScene);
              } else if (hotspot.type === 'layer' && hotspot.targetLayer) {
                // Handle layer navigation - you may need to implement this based on your app structure
                console.log('Navigate to layer:', hotspot.targetLayer);
              } else {
                setEditingHotspot(hotspot);
                setShowEditor(true);
              }
            }
          }))
        });
      }, 100);
    }
  };

  const loadScenes = async () => {
    try {
      const response = await fetch(`/panorama/${projectId}/app-files/data.js`);
      if (response.ok) {
        const text = await response.text();
        const match = text.match(/var APP_DATA = ({[\s\S]*?});/);
        if (match) {
          const data = JSON.parse(match[1]);
          setScenes(data.scenes.map((s: any, index: number) => ({ 
            id: index.toString(), 
            name: s.name || `Scene ${index + 1}` 
          })));
          setDefaultScene(data.defaultScene || '0');
        }
      }
    } catch (error) {
      console.error('Failed to load scenes:', error);
    }
  };

  const getApiBaseUrl = () => {
    return '/api';
  };

  const loadHotspots = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/panorama/${projectId}/hotspots?scene=${currentScene}`);
      if (response.ok) {
        const data = await response.json();
        setHotspots(data.hotspots || []);
      }
    } catch (error) {
      console.error('Failed to load hotspots:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/panorama/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadAssets = async () => {
    try {
      const types = ['icon', 'panorama360', 'object360', 'video'];
      const allAssets: {name: string, type: string, url: string}[] = [];
      for (const type of types) {
        const response = await fetch(`${getApiBaseUrl()}/assets/${type}`);
        if (response.ok) {
          const data = await response.json();
          data.files?.forEach((file: any) => {
            allAssets.push({ name: file.name, type, url: `/media/${type}/${file.name}` });
          });
        }
      }
      setAssets(allAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const handlePanoramaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!addMode) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    const xPercent = x * 100;
    const yPercent = y * 100;
    
    const newHotspot: Hotspot = {
      id: 'hotspot-' + Date.now(),
      x: `${xPercent.toFixed(1)}%`,
      y: `${yPercent.toFixed(1)}%`,
      title: 'New Hotspot',
      description: 'Click to edit description',
      type: 'info',
      sceneId: currentScene
    };
    
    setEditingHotspot(newHotspot);
    setShowEditor(true);
    setAddMode(false);
  };

  const handleSaveHotspot = async () => {
    if (!editingHotspot) return;

    const targetSceneId = editingHotspot?.sceneId || currentScene;
    const hotspotToSave = {
      ...editingHotspot,
      sceneId: targetSceneId
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/panorama/${projectId}/hotspots?scene=${targetSceneId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotspotToSave)
      });

      if (response.ok) {
        setMessage(`Hotspot saved to scene ${parseInt(targetSceneId) + 1}!`);
        if (targetSceneId === currentScene) {
          loadHotspots();
        }
      } else {
        setMessage('Failed to save hotspot');
      }
    } catch (error) {
      setMessage('Error saving hotspot');
    }

    setEditingHotspot(null);
    setShowEditor(false);
  };

  if (!projectId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Panorama Editor - {projectId}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setAddMode(!addMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  addMode
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {addMode ? 'Cancel Add' : 'Add Hotspot'}
              </button>
              <Link
                href="/manage"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Scene Navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Scenes</h3>
            <div className="flex gap-2">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setCurrentScene(scene.id);
                    setHotspots([]);
                    setTimeout(() => loadHotspots(), 100);
                  }}
                  className={`px-3 py-1 rounded text-sm ${
                    currentScene === scene.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panorama Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">
                {scenes.find(s => s.id === currentScene)?.name || 'Panorama View'}
              </h3>
              <div 
                ref={panoramaRef}
                className={`aspect-video bg-gray-100 rounded-lg relative ${
                  addMode ? 'cursor-crosshair' : 'cursor-default'
                }`}
                onClick={handlePanoramaClick}
              >
                <div 
                  id={`panorama-${currentScene}`}
                  className="w-full h-full rounded-lg"
                />
                
                {addMode && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/70 text-white px-4 py-2 rounded">
                      Click to add hotspot
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Hotspots List */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Hotspots ({hotspots.length})</h3>
              <div className="space-y-2">
                {hotspots.map((hotspot) => (
                  <div key={hotspot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{hotspot.title}</div>
                      <div className="text-sm text-gray-500">{hotspot.type}</div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingHotspot(hotspot);
                        setShowEditor(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                {hotspots.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hotspots in this scene.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hotspot Editor */}
        {showEditor && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">
              {hotspots.find(h => h.id === editingHotspot?.id) ? 'Edit' : 'Add'} Hotspot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingHotspot?.title || ''}
                  onChange={(e) => setEditingHotspot(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editingHotspot?.type || 'info'}
                  onChange={(e) => setEditingHotspot(prev => prev ? {...prev, type: e.target.value as any} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="scene">Go to Scene</option>
                  <option value="layer">Go to Layer</option>
                  <option value="asset">Asset</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingHotspot?.description || ''}
                  onChange={(e) => setEditingHotspot(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              {(editingHotspot?.type === 'scene' || editingHotspot?.type === 'layer') && (
                <>
                  {editingHotspot?.type === 'scene' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Scene</label>
                      <select
                        value={editingHotspot?.targetScene || ''}
                        onChange={(e) => setEditingHotspot(prev => prev ? {...prev, targetScene: e.target.value} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Scene</option>
                        {scenes.map((scene, index) => (
                          <option key={scene.id} value={scene.id}>
                            Scene {index + 1} - {scene.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {editingHotspot?.type === 'layer' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Layer</label>
                      <select
                        value={editingHotspot?.targetLayer || ''}
                        onChange={(e) => setEditingHotspot(prev => prev ? {...prev, targetLayer: parseInt(e.target.value)} : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Layer</option>
                        <option value="1">Layer 1</option>
                        <option value="2">Layer 2</option>
                        <option value="3">Layer 3</option>
                      </select>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Preview (Optional)</label>
                    <select
                      value={editingHotspot?.assetUrl || ''}
                      onChange={(e) => setEditingHotspot(prev => prev ? {...prev, assetUrl: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Asset (Show Arrow)</option>
                      {assets.map((asset) => (
                        <option key={asset.url} value={asset.url}>
                          {asset.name} ({asset.type})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">If no asset is selected, an arrow will be displayed</p>
                  </div>
                  {editingHotspot?.assetUrl && editingHotspot.assetUrl.trim() !== '' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Width (px)</label>
                        <input
                          type="number"
                          value={editingHotspot?.assetWidth || 60}
                          onChange={(e) => setEditingHotspot(prev => prev ? {...prev, assetWidth: parseInt(e.target.value)} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="20"
                          max="200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Height (px)</label>
                        <input
                          type="number"
                          value={editingHotspot?.assetHeight || 60}
                          onChange={(e) => setEditingHotspot(prev => prev ? {...prev, assetHeight: parseInt(e.target.value)} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="20"
                          max="200"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Size</label>
                        <select
                          value={editingHotspot?.backgroundSize || 'contain'}
                          onChange={(e) => setEditingHotspot(prev => prev ? {...prev, backgroundSize: e.target.value} : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="contain">Contain (fit within bounds)</option>
                          <option value="cover">Cover (fill entire area)</option>
                          <option value="100% 100%">Stretch (100% x 100%)</option>
                          <option value="auto">Auto (original size)</option>
                          <option value="50% 50%">Small (50% x 50%)</option>
                          <option value="75% 75%">Medium (75% x 75%)</option>
                          <option value="125% 125%">Large (125% x 125%)</option>
                          <option value="150% 150%">Extra Large (150% x 150%)</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
              {editingHotspot?.type === 'asset' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                    <select
                      value={editingHotspot?.targetAsset || ''}
                      onChange={(e) => setEditingHotspot(prev => prev ? {...prev, targetAsset: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Asset</option>
                      {assets.map((asset) => (
                        <option key={asset.url} value={asset.url}>
                          {asset.name} ({asset.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Width (px)</label>
                    <input
                      type="number"
                      value={editingHotspot?.assetWidth || 60}
                      onChange={(e) => setEditingHotspot(prev => prev ? {...prev, assetWidth: parseInt(e.target.value)} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="20"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Height (px)</label>
                    <input
                      type="number"
                      value={editingHotspot?.assetHeight || 60}
                      onChange={(e) => setEditingHotspot(prev => prev ? {...prev, assetHeight: parseInt(e.target.value)} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="20"
                      max="200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Size</label>
                    <select
                      value={editingHotspot?.backgroundSize || 'contain'}
                      onChange={(e) => setEditingHotspot(prev => prev ? {...prev, backgroundSize: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="contain">Contain (fit within bounds)</option>
                      <option value="cover">Cover (fill entire area)</option>
                      <option value="100% 100%">Stretch (100% x 100%)</option>
                      <option value="auto">Auto (original size)</option>
                      <option value="50% 50%">Small (50% x 50%)</option>
                      <option value="75% 75%">Medium (75% x 75%)</option>
                      <option value="125% 125%">Large (125% x 125%)</option>
                      <option value="150% 150%">Extra Large (150% x 150%)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveHotspot}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {hotspots.find(h => h.id === editingHotspot?.id) ? 'Update' : 'Add'} Hotspot
              </button>
              <button
                onClick={() => { setEditingHotspot(null); setShowEditor(false); }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanoramaEditor;