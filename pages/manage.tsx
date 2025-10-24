import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type HotspotType = 'info' | 'layer' | 'scene' | 'asset';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  type: HotspotType;
  title: string;
  content?: string;
  targetLayer?: number;
  targetScene?: string;
  targetProject?: string;
  targetAsset?: string;
  targetLinkId?: string;
  timeStart?: number;
  timeEnd?: number;
  assetWidth?: number;
  assetHeight?: number;
  backgroundSize?: string;
}

interface Layer2Link {
  id: string;
  title: string;
  url: string;
  description?: string;
}

interface PanoramaProject {
  id: string;
  name: string;
  scenes: PanoramaScene[];
  defaultSceneId?: string;
}

interface PanoramaScene {
  id: string;
  name: string;
  image: string;
  hotspots: Hotspot[];
}

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: number;
}

const Manage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('layer1');
  const [layer1Video, setLayer1Video] = useState('/layer/layer1/dprkp.mp4');
  const [layer3Video, setLayer3Video] = useState('/layer/layer3/layer3.mp4');
  const [layer1Hotspots, setLayer1Hotspots] = useState<Hotspot[]>([]);
  const [layer2Links, setLayer2Links] = useState<Layer2Link[]>([]);
  const [layer3Hotspots, setLayer3Hotspots] = useState<Hotspot[]>([]);
  const [panoramaProjects, setPanoramaProjects] = useState<PanoramaProject[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddHotspotMode, setIsAddHotspotMode] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [editingProject, setEditingProject] = useState<PanoramaProject | null>(null);
  const [panoramaScenes, setPanoramaScenes] = useState<{[key: string]: {scene: string, hotspots: Hotspot[], name: string}}>({});
  const [activeSceneId, setActiveSceneId] = useState<string>('');
  const [newSceneName, setNewSceneName] = useState<string>('');
  const [editorViewer, setEditorViewer] = useState<any>(null);

  useEffect(() => {
    loadData();
    // Always load assets for hotspot asset selection
    if (activeTab === 'layer1' || activeTab === 'layer3') {
      loadAssets();
    }
  }, [activeTab]);

  const loadPannellumForEditor = () => {
    if (typeof window !== 'undefined' && !(window as any).pannellum) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.onload = () => {
        if (activeSceneId && panoramaScenes[activeSceneId]) {
          setTimeout(() => initEditorPannellum(), 100);
        }
      };
      document.head.appendChild(script);
    }
  };

  const loadAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'panorama-edit') {
      loadAssets();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'layer1') {
        const res = await fetch('/api/layers/layer1');
        const data = await res.json();
        setLayer1Video(data.video || '/layer/layer1/dprkp.mp4');
        setLayer1Hotspots(data.hotspots || []);
        // Load layer2 links for hotspot configuration
        const layer2Res = await fetch('/api/layers/layer2');
        const layer2Data = await layer2Res.json();
        setLayer2Links(layer2Data.links || []);
      } else if (activeTab === 'layer2') {
        const res = await fetch('/api/layers/layer2');
        const data = await res.json();
        setLayer2Links(data.links || []);
      } else if (activeTab === 'layer3') {
        const res = await fetch('/api/layers/layer3');
        const data = await res.json();
        setLayer3Video(data.video || '/layer/layer3/layer3.mp4');
        setLayer3Hotspots(data.hotspots || []);
        // Load panorama projects for hotspot configuration
        const panoramaRes = await fetch('/api/panorama/projects');
        const panoramaData = await panoramaRes.json();
        setPanoramaProjects(panoramaData.projects || []);
      } else if (activeTab === 'panorama') {
        const res = await fetch('/api/panorama/projects');
        const data = await res.json();
        setPanoramaProjects(data.projects || []);
      } else if (activeTab === 'assets') {
        const res = await fetch('/api/assets');
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const saveLayer1 = async () => {
    try {
      await fetch('/api/layers/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: layer1Video, hotspots: layer1Hotspots })
      });
    } catch (error) {
      console.error('Failed to save layer1:', error);
    }
  };

  const saveLayer2 = async () => {
    try {
      await fetch('/api/layers/layer2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: layer2Links })
      });
    } catch (error) {
      console.error('Failed to save layer2:', error);
    }
  };

  const saveLayer3 = async () => {
    try {
      await fetch('/api/layers/layer3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: layer3Video, hotspots: layer3Hotspots })
      });
    } catch (error) {
      console.error('Failed to save layer3:', error);
    }
  };

  const tabs = [
    { id: 'layer1', label: 'Layer 1' },
    { id: 'layer2', label: 'Layer 2' },
    { id: 'layer3', label: 'Layer 3' },
    { id: 'panorama', label: 'Panorama' },
    { id: 'panorama-edit', label: 'Edit Panorama' },
    { id: 'assets', label: 'Assets' }
  ];

  const addHotspot = (layer: 'layer1' | 'layer3') => {
    const newHotspot: Hotspot = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: 50,
      y: 50,
      type: 'info',
      title: 'New Hotspot'
    };
    
    if (layer === 'layer1') {
      setLayer1Hotspots([...layer1Hotspots, newHotspot]);
    } else {
      setLayer3Hotspots([...layer3Hotspots, newHotspot]);
    }
  };

  const deleteHotspot = (id: string, layer: 'layer1' | 'layer3') => {
    if (layer === 'layer1') {
      setLayer1Hotspots(layer1Hotspots.filter(h => h.id !== id));
    } else {
      setLayer3Hotspots(layer3Hotspots.filter(h => h.id !== id));
    }
  };

  const addLayer2Link = () => {
    const newLink: Layer2Link = {
      id: Date.now().toString(),
      title: 'New Link',
      url: '#'
    };
    setLayer2Links([...layer2Links, newLink]);
  };

  const deleteLayer2Link = (id: string) => {
    setLayer2Links(layer2Links.filter(l => l.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Reload assets after successful upload
        loadAssets();
        alert('File uploaded successfully!');
      } else {
        alert('Upload failed!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed!');
    }

    // Reset input
    event.target.value = '';
  };

  const deleteAsset = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets?assetId=${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadAssets();
        alert('Asset deleted successfully!');
      } else {
        alert('Delete failed!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed!');
    }
  };

  const editProject = (project: PanoramaProject) => {
    setEditingProject(project);
    setActiveTab('panorama-edit');
    loadPanoramaData(project.id);
  };

  const loadPanoramaData = async (projectId: string) => {
    try {
      const response = await fetch(`/api/panorama/scenes?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setPanoramaScenes(data.scenes || {});
        const sceneIds = Object.keys(data.scenes || {});
        if (sceneIds.length > 0) {
          setActiveSceneId(sceneIds[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load panorama data:', error);
    }
  };

  const uploadPanoramaScene = async (file: File, sceneName: string) => {
    if (!editingProject || !sceneName.trim()) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', editingProject.id);
    
    try {
      const response = await fetch('/api/panorama/upload-scene', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        const sceneId = `scene-${Date.now()}`;
        const newScenes = {
          ...panoramaScenes,
          [sceneId]: { scene: data.url, hotspots: [], name: sceneName }
        };
        setPanoramaScenes(newScenes);
        setActiveSceneId(sceneId);
        setNewSceneName('');
      }
    } catch (error) {
      console.error('Failed to upload scene:', error);
    }
  };

  const addPanoramaHotspot = (x: number, y: number) => {
    if (!activeSceneId) return;
    
    const newHotspot: Hotspot = {
      id: `hotspot-${Date.now()}`,
      x,
      y,
      type: 'scene',
      title: 'New Hotspot'
    };
    
    const updatedScenes = {
      ...panoramaScenes,
      [activeSceneId]: {
        ...panoramaScenes[activeSceneId],
        hotspots: [...(panoramaScenes[activeSceneId]?.hotspots || []), newHotspot]
      }
    };
    setPanoramaScenes(updatedScenes);
  };

  const initEditorPannellum = () => {
    const editorContainer = document.getElementById('panorama-editor');
    
    if (!editorContainer || !panoramaScenes[activeSceneId] || !(window as any).pannellum) {
      return;
    }

    if (editorViewer) {
      try {
        editorViewer.destroy();
      } catch (e) {}
    }

    editorContainer.innerHTML = '';

    const currentScene = panoramaScenes[activeSceneId];
    
    const hotspots = (currentScene.hotspots || []).map((hotspot) => ({
      id: `editor-${hotspot.id}`,
      pitch: (50 - hotspot.y) * 1.8,
      yaw: (hotspot.x - 50) * 3.6,
      type: 'info',
      text: hotspot.title,
      clickHandlerFunc: () => {
        const updatedScenes = {
          ...panoramaScenes,
          [activeSceneId]: {
            ...panoramaScenes[activeSceneId],
            hotspots: panoramaScenes[activeSceneId].hotspots.filter(h => h.id !== hotspot.id)
          }
        };
        setPanoramaScenes(updatedScenes);
      }
    }));

    try {
      const viewer = (window as any).pannellum.viewer(editorContainer, {
        type: 'equirectangular',
        panorama: currentScene.scene,
        autoLoad: true,
        hotSpots: hotspots,
        showControls: false,
        mouseZoom: false
      });

      viewer.on('click', (event: any) => {
        const coords = viewer.mouseEventToCoords(event);
        const x = (coords[1] / 3.6) + 50;
        const y = 50 - (coords[0] / 1.8);
        addPanoramaHotspot(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
      });

      setEditorViewer(viewer);
    } catch (error) {
      console.error('Error creating Pannellum viewer:', error);
    }
  };

  const savePanoramaData = async () => {
    if (!editingProject) return;
    
    try {
      await fetch('/api/panorama/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: editingProject.id, 
          scenes: panoramaScenes
        })
      });
      alert('Panorama data saved!');
    } catch (error) {
      console.error('Failed to save panorama data:', error);
    }
  };

  const deleteScene = (sceneId: string) => {
    const updatedScenes = { ...panoramaScenes };
    delete updatedScenes[sceneId];
    setPanoramaScenes(updatedScenes);
    
    const remainingIds = Object.keys(updatedScenes);
    if (remainingIds.length > 0 && activeSceneId === sceneId) {
      setActiveSceneId(remainingIds[0]);
    } else if (remainingIds.length === 0) {
      setActiveSceneId('');
    }
  };

  const setDefaultScene = async (projectId: string, sceneId: string) => {
    const updated = panoramaProjects.map(p => 
      p.id === projectId ? { ...p, defaultSceneId: sceneId } : p
    );
    setPanoramaProjects(updated);
    setEditingProject(updated.find(p => p.id === projectId) || null);
    
    try {
      await fetch('/api/panorama/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: updated })
      });
    } catch (error) {
      console.error('Failed to set default scene:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    const updated = panoramaProjects.filter(p => p.id !== projectId);
    setPanoramaProjects(updated);
    
    try {
      await fetch('/api/panorama/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: updated })
      });
      
      // Delete scene data
      await fetch(`/api/panorama/scenes?projectId=${projectId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Layer Management</h1>
            <Link href="/" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'layer1' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Layer 1 Video</h3>
                  <div className="flex gap-4 items-center mb-4">
                    <input
                      type="text"
                      value={layer1Video}
                      onChange={(e) => setLayer1Video(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Video path"
                    />
                    <button onClick={saveLayer1} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Update
                    </button>
                  </div>
                  
                  {/* Video Preview with Hotspots */}
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <video 
                      className="w-full h-full object-cover"
                      controls
                      muted
                      id="layer1-video"
                      onTimeUpdate={(e) => setCurrentVideoTime(e.currentTarget.currentTime)}
                    >
                      <source src={layer1Video} type="video/mp4" />
                    </video>
                    
                    {/* Hotspots Container */}
                    <div className="absolute inset-0 pointer-events-none">
                      {layer1Hotspots.filter(hotspot => 
                        currentVideoTime >= (hotspot.timeStart || 0) && currentVideoTime <= (hotspot.timeEnd || 999)
                      ).map((hotspot) => (
                        <div
                          key={hotspot.id}
                          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
                          style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                          }}
                          onClick={() => {
                            const updatedHotspots = layer1Hotspots.filter(h => h.id !== hotspot.id);
                            setLayer1Hotspots(updatedHotspots);
                          }}
                        >
                          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform">
                            <div className="w-full h-full rounded-full bg-red-400 opacity-50 animate-ping"></div>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {hotspot.title} (Click to delete)
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Click to Add Hotspot */}
                    {isAddHotspotMode && (
                      <div 
                        className="absolute inset-0 cursor-crosshair z-30"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          
                          // Get current video time
                          const video = document.querySelector('video');
                          const currentTime = video ? Math.floor(video.currentTime) : 0;
                          
                          const newHotspot = {
                            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
                            y: Math.max(0, Math.min(100, Math.round(y * 10) / 10)),
                            type: 'info' as HotspotType,
                            title: 'New Hotspot',
                            timeStart: currentTime,
                            timeEnd: currentTime + 5
                          };
                          
                          setLayer1Hotspots([...layer1Hotspots, newHotspot]);
                          setIsAddHotspotMode(false);
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Click on existing hotspot to delete
                    </p>
                    <button
                      onClick={() => setIsAddHotspotMode(!isAddHotspotMode)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isAddHotspotMode 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isAddHotspotMode ? 'Cancel Add Mode' : 'Add Hotspot Mode'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Hotspot Details</h3>
                    <button onClick={saveLayer1} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Save All Changes
                    </button>
                  </div>
                  <div className="space-y-4">
                    {layer1Hotspots.map((hotspot) => (
                      <div key={hotspot.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={hotspot.title}
                            onChange={(e) => {
                              const updated = layer1Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, title: e.target.value } : h
                              );
                              setLayer1Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Label"
                          />
                          <select
                            value={hotspot.type}
                            onChange={(e) => {
                              const updated = layer1Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, type: e.target.value as HotspotType } : h
                              );
                              setLayer1Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="info">Info</option>
                            <option value="layer">Layer</option>
                            <option value="asset">Asset</option>
                          </select>
                          {hotspot.type === 'layer' && (
                            <select
                              value={hotspot.targetLayer || ''}
                              onChange={(e) => {
                                const updated = layer1Hotspots.map(h => 
                                  h.id === hotspot.id ? { ...h, targetLayer: Number(e.target.value), targetLinkId: undefined } : h
                                );
                                setLayer1Hotspots(updated);
                              }}
                              className="border border-gray-300 rounded-md px-3 py-2"
                            >
                              <option value="">Select Layer</option>
                              <option value="2">Layer 2</option>
                              <option value="3">Layer 3</option>
                              <option value="4">Panorama</option>
                            </select>
                          )}
                          {hotspot.type === 'layer' && hotspot.targetLayer === 2 && (
                            <select
                              value={hotspot.targetLinkId || ''}
                              onChange={(e) => {
                                const updated = layer1Hotspots.map(h => 
                                  h.id === hotspot.id ? { ...h, targetLinkId: e.target.value } : h
                                );
                                setLayer1Hotspots(updated);
                              }}
                              className="border border-gray-300 rounded-md px-3 py-2"
                            >
                              <option value="">Select Link</option>
                              {layer2Links.map(link => (
                                <option key={link.id} value={link.id}>
                                  {link.title || link.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {hotspot.type === 'layer' && (
                            <>
                              <select
                                value={hotspot.targetAsset || ''}
                                onChange={(e) => {
                                  const updated = layer1Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, targetAsset: e.target.value } : h
                                  );
                                  setLayer1Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                              >
                                <option value="">No Asset (Show Arrow)</option>
                                {assets.map(asset => (
                                  <option key={asset.id} value={asset.url}>
                                    {asset.name}
                                  </option>
                                ))}
                              </select>
                              {hotspot.targetAsset && (
                                <>
                                  <select
                                    value={hotspot.backgroundSize || 'contain'}
                                    onChange={(e) => {
                                      const updated = layer1Hotspots.map(h => 
                                        h.id === hotspot.id ? { ...h, backgroundSize: e.target.value } : h
                                      );
                                      setLayer1Hotspots(updated);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                  >
                                    <option value="contain">Contain</option>
                                    <option value="cover">Cover</option>
                                    <option value="100% 100%">Stretch</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={hotspot.assetWidth || 60}
                                    onChange={(e) => {
                                      const updated = layer1Hotspots.map(h => 
                                        h.id === hotspot.id ? { ...h, assetWidth: parseInt(e.target.value) } : h
                                      );
                                      setLayer1Hotspots(updated);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Width"
                                    min="20"
                                    max="200"
                                  />
                                  <input
                                    type="number"
                                    value={hotspot.assetHeight || 60}
                                    onChange={(e) => {
                                      const updated = layer1Hotspots.map(h => 
                                        h.id === hotspot.id ? { ...h, assetHeight: parseInt(e.target.value) } : h
                                      );
                                      setLayer1Hotspots(updated);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Height"
                                    min="20"
                                    max="200"
                                  />
                                </>
                              )}
                            </>
                          )}
                          {hotspot.type === 'asset' && (
                            <>
                              <select
                                value={hotspot.backgroundSize || 'contain'}
                                onChange={(e) => {
                                  const updated = layer1Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, backgroundSize: e.target.value } : h
                                  );
                                  setLayer1Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                              >
                                <option value="contain">Contain (No Crop)</option>
                                <option value="cover">Cover (Crop to Fill)</option>
                                <option value="100% 100%">Stretch (Fill Exact)</option>
                              </select>
                              <input
                                type="number"
                                value={hotspot.assetWidth || 60}
                                onChange={(e) => {
                                  const updated = layer1Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, assetWidth: parseInt(e.target.value) } : h
                                  );
                                  setLayer1Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Width (px)"
                                min="20"
                                max="200"
                              />
                              <input
                                type="number"
                                value={hotspot.assetHeight || 60}
                                onChange={(e) => {
                                  const updated = layer1Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, assetHeight: parseInt(e.target.value) } : h
                                  );
                                  setLayer1Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Height (px)"
                                min="20"
                                max="200"
                              />
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <input
                            type="number"
                            value={hotspot.timeStart || 0}
                            onChange={(e) => {
                              const updated = layer1Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, timeStart: Number(e.target.value) } : h
                              );
                              setLayer1Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Start Time (s)"
                          />
                          <input
                            type="number"
                            value={hotspot.timeEnd || 5}
                            onChange={(e) => {
                              const updated = layer1Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, timeEnd: Number(e.target.value) } : h
                              );
                              setLayer1Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="End Time (s)"
                          />
                          <div className="text-sm text-gray-500 flex items-center">
                            Position: {hotspot.x}%, {hotspot.y}%
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => deleteHotspot(hotspot.id, 'layer1')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layer2' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Layer 2 Links</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={addLayer2Link}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Add Link
                    </button>
                    <button
                      onClick={saveLayer2}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {layer2Links.map((link) => (
                    <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => {
                            const updated = layer2Links.map(l => 
                              l.id === link.id ? { ...l, title: e.target.value } : l
                            );
                            setLayer2Links(updated);
                          }}
                          className="border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const updated = layer2Links.map(l => 
                              l.id === link.id ? { ...l, url: e.target.value } : l
                            );
                            setLayer2Links(updated);
                          }}
                          className="border border-gray-300 rounded-md px-3 py-2"
                          placeholder="URL"
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => deleteLayer2Link(link.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'layer3' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Layer 3 Video</h3>
                  <div className="flex gap-4 items-center mb-4">
                    <input
                      type="text"
                      value={layer3Video}
                      onChange={(e) => setLayer3Video(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Video path"
                    />
                    <button onClick={saveLayer3} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Update
                    </button>
                  </div>
                  
                  {/* Video Preview with Hotspots */}
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <video 
                      className="w-full h-full object-cover"
                      controls
                      muted
                      id="layer3-video"
                      onTimeUpdate={(e) => setCurrentVideoTime(e.currentTarget.currentTime)}
                    >
                      <source src={layer3Video} type="video/mp4" />
                    </video>
                    
                    {/* Hotspots Container */}
                    <div className="absolute inset-0 pointer-events-none">
                      {layer3Hotspots.filter(hotspot => 
                        currentVideoTime >= (hotspot.timeStart || 0) && currentVideoTime <= (hotspot.timeEnd || 999)
                      ).map((hotspot) => (
                        <div
                          key={hotspot.id}
                          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
                          style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                          }}
                          onClick={() => {
                            const updatedHotspots = layer3Hotspots.filter(h => h.id !== hotspot.id);
                            setLayer3Hotspots(updatedHotspots);
                          }}
                        >
                          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform">
                            <div className="w-full h-full rounded-full bg-red-400 opacity-50 animate-ping"></div>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {hotspot.title} (Click to delete)
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Click to Add Hotspot */}
                    {isAddHotspotMode && (
                      <div 
                        className="absolute inset-0 cursor-crosshair z-30"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          
                          // Get current video time
                          const video = document.querySelector('video');
                          const currentTime = video ? Math.floor(video.currentTime) : 0;
                          
                          const newHotspot = {
                            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
                            y: Math.max(0, Math.min(100, Math.round(y * 10) / 10)),
                            type: 'info' as HotspotType,
                            title: 'New Hotspot',
                            timeStart: currentTime,
                            timeEnd: currentTime + 5
                          };
                          
                          setLayer3Hotspots([...layer3Hotspots, newHotspot]);
                          setIsAddHotspotMode(false);
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Click on existing hotspot to delete
                    </p>
                    <button
                      onClick={() => setIsAddHotspotMode(!isAddHotspotMode)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isAddHotspotMode 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isAddHotspotMode ? 'Cancel Add Mode' : 'Add Hotspot Mode'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Hotspot Details</h3>
                    <button onClick={saveLayer3} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Save All Changes
                    </button>
                  </div>
                  <div className="space-y-4">
                    {layer3Hotspots.map((hotspot) => (
                      <div key={hotspot.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={hotspot.title}
                            onChange={(e) => {
                              const updated = layer3Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, title: e.target.value } : h
                              );
                              setLayer3Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Label"
                          />
                          <select
                            value={hotspot.type}
                            onChange={(e) => {
                              const updated = layer3Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, type: e.target.value as HotspotType } : h
                              );
                              setLayer3Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="info">Info</option>
                            <option value="layer">Layer</option>
                            <option value="asset">Asset</option>
                          </select>
                          {hotspot.type === 'layer' && (
                            <select
                              value={hotspot.targetLayer || ''}
                              onChange={(e) => {
                                const updated = layer3Hotspots.map(h => 
                                  h.id === hotspot.id ? { ...h, targetLayer: Number(e.target.value), targetScene: undefined } : h
                                );
                                setLayer3Hotspots(updated);
                              }}
                              className="border border-gray-300 rounded-md px-3 py-2"
                            >
                              <option value="">Select Layer</option>
                              <option value="1">Layer 1</option>
                              <option value="2">Layer 2</option>
                              <option value="4">Panorama</option>
                            </select>
                          )}
                          {hotspot.type === 'layer' && hotspot.targetLayer === 4 && (
                            <select
                              value={hotspot.targetScene || ''}
                              onChange={(e) => {
                                const updated = layer3Hotspots.map(h => 
                                  h.id === hotspot.id ? { ...h, targetScene: e.target.value } : h
                                );
                                setLayer3Hotspots(updated);
                              }}
                              className="border border-gray-300 rounded-md px-3 py-2"
                            >
                              <option value="">Select Panorama Project</option>
                              {panoramaProjects.map(project => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {hotspot.type === 'layer' && (
                            <>
                              <select
                                value={hotspot.targetAsset || ''}
                                onChange={(e) => {
                                  const updated = layer3Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, targetAsset: e.target.value } : h
                                  );
                                  setLayer3Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                              >
                                <option value="">No Asset (Show Arrow)</option>
                                {assets.map(asset => (
                                  <option key={asset.id} value={asset.url}>
                                    {asset.name}
                                  </option>
                                ))}
                              </select>
                              {hotspot.targetAsset && (
                                <>
                                  <select
                                    value={hotspot.backgroundSize || 'contain'}
                                    onChange={(e) => {
                                      const updated = layer3Hotspots.map(h => 
                                        h.id === hotspot.id ? { ...h, backgroundSize: e.target.value } : h
                                      );
                                      setLayer3Hotspots(updated);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                  >
                                    <option value="contain">Contain</option>
                                    <option value="cover">Cover</option>
                                    <option value="100% 100%">Stretch</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={hotspot.assetWidth || 60}
                                    onChange={(e) => {
                                      const updated = layer3Hotspots.map(h => 
                                        h.id === hotspot.id ? { ...h, assetWidth: parseInt(e.target.value) } : h
                                      );
                                      setLayer3Hotspots(updated);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Width"
                                    min="20"
                                    max="200"
                                  />
                                  <input
                                    type="number"
                                    value={hotspot.assetHeight || 60}
                                    onChange={(e) => {
                                      const updated = layer3Hotspots.map(h => 
                                        h.id === hotspot.id ? { ...h, assetHeight: parseInt(e.target.value) } : h
                                      );
                                      setLayer3Hotspots(updated);
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Height"
                                    min="20"
                                    max="200"
                                  />
                                </>
                              )}
                            </>
                          )}
                          {hotspot.type === 'asset' && (
                            <>
                              <select
                                value={hotspot.backgroundSize || 'contain'}
                                onChange={(e) => {
                                  const updated = layer3Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, backgroundSize: e.target.value } : h
                                  );
                                  setLayer3Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                              >
                                <option value="contain">Contain (No Crop)</option>
                                <option value="cover">Cover (Crop to Fill)</option>
                                <option value="100% 100%">Stretch (Fill Exact)</option>
                              </select>
                              <input
                                type="number"
                                value={hotspot.assetWidth || 60}
                                onChange={(e) => {
                                  const updated = layer3Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, assetWidth: parseInt(e.target.value) } : h
                                  );
                                  setLayer3Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Width (px)"
                                min="20"
                                max="200"
                              />
                              <input
                                type="number"
                                value={hotspot.assetHeight || 60}
                                onChange={(e) => {
                                  const updated = layer3Hotspots.map(h => 
                                    h.id === hotspot.id ? { ...h, assetHeight: parseInt(e.target.value) } : h
                                  );
                                  setLayer3Hotspots(updated);
                                }}
                                className="border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Height (px)"
                                min="20"
                                max="200"
                              />
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <input
                            type="number"
                            value={hotspot.timeStart || 0}
                            onChange={(e) => {
                              const updated = layer3Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, timeStart: Number(e.target.value) } : h
                              );
                              setLayer3Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Start Time (s)"
                          />
                          <input
                            type="number"
                            value={hotspot.timeEnd || 5}
                            onChange={(e) => {
                              const updated = layer3Hotspots.map(h => 
                                h.id === hotspot.id ? { ...h, timeEnd: Number(e.target.value) } : h
                              );
                              setLayer3Hotspots(updated);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                            placeholder="End Time (s)"
                          />
                          <div className="text-sm text-gray-500 flex items-center">
                            Position: {hotspot.x}%, {hotspot.y}%
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => deleteHotspot(hotspot.id, 'layer3')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'panorama' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Panorama Projects</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        const newProject = {
                          id: `project-${Date.now()}`,
                          name: 'New Panorama Project',
                          scenes: []
                        };
                        const updatedProjects = [...panoramaProjects, newProject];
                        setPanoramaProjects(updatedProjects);
                        
                        // Auto-save after creating
                        try {
                          await fetch('/api/panorama/projects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projects: updatedProjects })
                          });
                        } catch (error) {
                          console.error('Failed to save project:', error);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Create Project
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await fetch('/api/panorama/projects', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projects: panoramaProjects })
                          });
                          alert('Projects saved successfully!');
                        } catch (error) {
                          alert('Failed to save projects!');
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
                
                {panoramaProjects.length > 0 ? (
                  <div className="space-y-4">
                    {panoramaProjects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) => {
                              const updated = panoramaProjects.map(p => 
                                p.id === project.id ? { ...p, name: e.target.value } : p
                              );
                              setPanoramaProjects(updated);
                            }}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 mr-4"
                            placeholder="Project Name"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => editProject(project)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteProject(project.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Scenes: {project.scenes?.length || 0} {project.defaultSceneId && '• Default Scene Set'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No panorama projects found
                  </div>
                )}
              </div>
            )}

            {activeTab === 'panorama-edit' && (
              <div>
                {editingProject ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Edit: {editingProject.name}</h3>
                      <div className="flex gap-2">
                        <a
                          href={`/preview/${editingProject?.id}`}
                          target="_blank"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                        >
                          Preview
                        </a>
                        <button
                          onClick={() => setActiveTab('panorama')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                        >
                          Back to Projects
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-4">Upload Panorama Scene</h4>
                        <div className="mb-4 space-y-2">
                          <input
                            type="text"
                            value={newSceneName}
                            onChange={(e) => setNewSceneName(e.target.value)}
                            placeholder="Scene name (e.g., Living Room, Kitchen)"
                            className="w-full border rounded px-3 py-2"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && newSceneName.trim()) {
                                uploadPanoramaScene(file, newSceneName);
                              } else if (file && !newSceneName.trim()) {
                                alert('Please enter a scene name first');
                              }
                            }}
                            className="w-full"
                          />
                        </div>
                        
                        {Object.keys(panoramaScenes).length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">Scenes ({Object.keys(panoramaScenes).length})</h5>
                            <div className="flex gap-2 mb-4 overflow-x-auto">
                              {Object.keys(panoramaScenes).map((sceneId) => (
                                <div key={sceneId} className="flex-shrink-0 relative">
                                  <button
                                    onClick={() => setActiveSceneId(sceneId)}
                                    className={`block w-20 h-12 rounded border-2 overflow-hidden ${
                                      activeSceneId === sceneId ? 'border-blue-500' : 'border-gray-300'
                                    }`}
                                  >
                                    <img 
                                      src={panoramaScenes[sceneId].scene} 
                                      alt="Scene" 
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                  {editingProject?.defaultSceneId === sceneId && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                                      ★
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h6 className="text-xs font-medium mb-2 text-gray-600">
                            Preview: {activeSceneId ? panoramaScenes[activeSceneId]?.name || 'Select Scene' : 'Select Scene'}
                          </h6>
                          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                            {activeSceneId && panoramaScenes[activeSceneId] ? (
                              <>
                                <div 
                                  id="panorama-editor" 
                                  className="w-full h-48 cursor-crosshair relative"
                                  style={{
                                    backgroundImage: `url(${panoramaScenes[activeSceneId].scene})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }}
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    addPanoramaHotspot(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                                  }}
                                >
                                  {panoramaScenes[activeSceneId]?.hotspots.map((hotspot) => (
                                    <div
                                      key={hotspot.id}
                                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                                      style={{
                                        left: `${hotspot.x}%`,
                                        top: `${hotspot.y}%`,
                                      }}
                                    >
                                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform">
                                        <div className="w-full h-full rounded-full bg-blue-400 opacity-50 animate-pulse"></div>
                                      </div>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {hotspot.title}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                  <button
                                    onClick={() => setDefaultScene(editingProject!.id, activeSceneId)}
                                    className={`px-2 py-1 rounded text-xs ${
                                      editingProject?.defaultSceneId === activeSceneId ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                                    }`}
                                  >
                                    {editingProject?.defaultSceneId === activeSceneId ? 'Default' : 'Set Default'}
                                  </button>
                                  <button
                                    onClick={() => deleteScene(activeSceneId)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-48 text-gray-500">
                                Click on a scene thumbnail to preview
                              </div>
                            )}
                          </div>
                        </div>
                        
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">
                          Hotspots {activeSceneId && `(${panoramaScenes[activeSceneId]?.hotspots.length || 0})`}
                        </h4>
                        {activeSceneId && (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {panoramaScenes[activeSceneId]?.hotspots.map((hotspot) => (
                              <div key={hotspot.id} className="border rounded p-3">
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={hotspot.title}
                                      onChange={(e) => {
                                        const updatedScenes = {
                                          ...panoramaScenes,
                                          [activeSceneId]: {
                                            ...panoramaScenes[activeSceneId],
                                            hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                              h.id === hotspot.id ? { ...h, title: e.target.value } : h
                                            )
                                          }
                                        };
                                        setPanoramaScenes(updatedScenes);
                                      }}
                                      className="border rounded px-2 py-1 text-sm"
                                      placeholder="Title"
                                    />
                                    <select 
                                      value={hotspot.type || 'layer'}
                                      onChange={(e) => {
                                        const updatedScenes = {
                                          ...panoramaScenes,
                                          [activeSceneId]: {
                                            ...panoramaScenes[activeSceneId],
                                            hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                              h.id === hotspot.id ? { 
                                                ...h, 
                                                type: e.target.value,
                                                targetLayer: undefined,
                                                targetScene: undefined,
                                                targetAsset: undefined
                                              } : h
                                            )
                                          }
                                        };
                                        setPanoramaScenes(updatedScenes);
                                      }}
                                      className="border rounded px-2 py-1 text-sm"
                                    >
                                      <option value="layer">Layer</option>
                                      <option value="scene">Scene</option>
                                      <option value="asset">Asset</option>
                                    </select>
                                  </div>
                                  
                                  {hotspot.type === 'layer' && (
                                    <div className="space-y-1">
                                      <select 
                                        value={hotspot.targetLayer || ''}
                                        onChange={(e) => {
                                          const updatedScenes = {
                                            ...panoramaScenes,
                                            [activeSceneId]: {
                                              ...panoramaScenes[activeSceneId],
                                              hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                h.id === hotspot.id ? { 
                                                  ...h, 
                                                  targetLayer: Number(e.target.value),
                                                  targetProject: undefined,
                                                  targetScene: undefined
                                                } : h
                                              )
                                            }
                                          };
                                          setPanoramaScenes(updatedScenes);
                                        }}
                                        className="border rounded px-2 py-1 text-sm w-full"
                                      >
                                        <option value="">Select Layer</option>
                                        <option value="1">Layer 1</option>
                                        <option value="2">Layer 2</option>
                                        <option value="3">Layer 3</option>
                                        <option value="4">Panorama</option>
                                      </select>
                                      
                                      {hotspot.targetLayer === 4 && (
                                        <>
                                          <select 
                                            value={hotspot.targetProject || ''}
                                            onChange={(e) => {
                                              const updatedScenes = {
                                                ...panoramaScenes,
                                                [activeSceneId]: {
                                                  ...panoramaScenes[activeSceneId],
                                                  hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                    h.id === hotspot.id ? { ...h, targetProject: e.target.value, targetScene: undefined } : h
                                                  )
                                                }
                                              };
                                              setPanoramaScenes(updatedScenes);
                                            }}
                                            className="border rounded px-2 py-1 text-sm w-full"
                                          >
                                            <option value="">Select Project</option>
                                            <option value={editingProject?.id}>Current Project</option>
                                            {panoramaProjects.filter(p => p.id !== editingProject?.id).map(project => (
                                              <option key={project.id} value={project.id}>
                                                {project.name}
                                              </option>
                                            ))}
                                          </select>
                                          
                                          {hotspot.targetProject && (
                                            <select 
                                              value={hotspot.targetScene || ''}
                                              onChange={(e) => {
                                                const updatedScenes = {
                                                  ...panoramaScenes,
                                                  [activeSceneId]: {
                                                    ...panoramaScenes[activeSceneId],
                                                    hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                      h.id === hotspot.id ? { ...h, targetScene: e.target.value } : h
                                                    )
                                                  }
                                                };
                                                setPanoramaScenes(updatedScenes);
                                              }}
                                              className="border rounded px-2 py-1 text-sm w-full"
                                            >
                                              <option value="">Select Scene</option>
                                              {hotspot.targetProject === editingProject?.id ? (
                                                Object.keys(panoramaScenes).filter(id => id !== activeSceneId).map(sceneId => (
                                                  <option key={sceneId} value={sceneId}>
                                                    {panoramaScenes[sceneId].name}
                                                  </option>
                                                ))
                                              ) : (
                                                <option value="default-scene">Default Scene</option>
                                              )}
                                            </select>
                                          )}
                                        </>
                                      )}
                                      
                                      <select 
                                        value={hotspot.targetAsset || ''}
                                        onChange={(e) => {
                                          const updatedScenes = {
                                            ...panoramaScenes,
                                            [activeSceneId]: {
                                              ...panoramaScenes[activeSceneId],
                                              hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                h.id === hotspot.id ? { ...h, targetAsset: e.target.value } : h
                                              )
                                            }
                                          };
                                          setPanoramaScenes(updatedScenes);
                                        }}
                                        className="border rounded px-2 py-1 text-sm w-full"
                                      >
                                        <option value="">No Asset (Show Arrow)</option>
                                        {assets.map(asset => (
                                          <option key={asset.id} value={asset.url}>
                                            {asset.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                  
                                  {hotspot.type === 'scene' && (
                                    <div className="space-y-1">
                                      <select 
                                        value={hotspot.targetProject || ''}
                                        onChange={(e) => {
                                          const updatedScenes = {
                                            ...panoramaScenes,
                                            [activeSceneId]: {
                                              ...panoramaScenes[activeSceneId],
                                              hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                h.id === hotspot.id ? { ...h, targetProject: e.target.value, targetScene: undefined } : h
                                              )
                                            }
                                          };
                                          setPanoramaScenes(updatedScenes);
                                        }}
                                        className="border rounded px-2 py-1 text-sm w-full"
                                      >
                                        <option value="">Select Project</option>
                                        <option value={editingProject?.id}>Current Project</option>
                                        {panoramaProjects.filter(p => p.id !== editingProject?.id).map(project => (
                                          <option key={project.id} value={project.id}>
                                            {project.name}
                                          </option>
                                        ))}
                                      </select>
                                      
                                      {hotspot.targetProject && (
                                        <select 
                                          value={hotspot.targetScene || ''}
                                          onChange={(e) => {
                                            const updatedScenes = {
                                              ...panoramaScenes,
                                              [activeSceneId]: {
                                                ...panoramaScenes[activeSceneId],
                                                hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                  h.id === hotspot.id ? { ...h, targetScene: e.target.value } : h
                                                )
                                              }
                                            };
                                            setPanoramaScenes(updatedScenes);
                                          }}
                                          className="border rounded px-2 py-1 text-sm w-full"
                                        >
                                          <option value="">Select Scene</option>
                                          {hotspot.targetProject === editingProject?.id ? (
                                            Object.keys(panoramaScenes).filter(id => id !== activeSceneId).map(sceneId => (
                                              <option key={sceneId} value={sceneId}>
                                                {panoramaScenes[sceneId].name}
                                              </option>
                                            ))
                                          ) : (
                                            <option value="external">External Project Scene</option>
                                          )}
                                        </select>
                                      )}
                                      
                                      <select 
                                        value={hotspot.targetAsset || ''}
                                        onChange={(e) => {
                                          const updatedScenes = {
                                            ...panoramaScenes,
                                            [activeSceneId]: {
                                              ...panoramaScenes[activeSceneId],
                                              hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                h.id === hotspot.id ? { ...h, targetAsset: e.target.value } : h
                                              )
                                            }
                                          };
                                          setPanoramaScenes(updatedScenes);
                                        }}
                                        className="border rounded px-2 py-1 text-sm w-full"
                                      >
                                        <option value="">No Asset (Show Arrow)</option>
                                        {assets.map(asset => (
                                          <option key={asset.id} value={asset.url}>
                                            {asset.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                  
                                  {hotspot.type === 'asset' && (
                                    <div className="space-y-1">
                                      <select 
                                        value={hotspot.targetAsset || ''}
                                        onChange={(e) => {
                                          const updatedScenes = {
                                            ...panoramaScenes,
                                            [activeSceneId]: {
                                              ...panoramaScenes[activeSceneId],
                                              hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                h.id === hotspot.id ? { ...h, targetAsset: e.target.value } : h
                                              )
                                            }
                                          };
                                          setPanoramaScenes(updatedScenes);
                                        }}
                                        className="border rounded px-2 py-1 text-sm w-full"
                                      >
                                        <option value="">Select Asset</option>
                                        {assets.map(asset => (
                                          <option key={asset.id} value={asset.url}>
                                            {asset.name}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="grid grid-cols-2 gap-1">
                                        <input
                                          type="number"
                                          value={hotspot.assetWidth || 60}
                                          onChange={(e) => {
                                            const updatedScenes = {
                                              ...panoramaScenes,
                                              [activeSceneId]: {
                                                ...panoramaScenes[activeSceneId],
                                                hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                  h.id === hotspot.id ? { ...h, assetWidth: parseInt(e.target.value) } : h
                                                )
                                              }
                                            };
                                            setPanoramaScenes(updatedScenes);
                                          }}
                                          className="border rounded px-2 py-1 text-xs"
                                          placeholder="Width"
                                          min="20"
                                          max="200"
                                        />
                                        <input
                                          type="number"
                                          value={hotspot.assetHeight || 60}
                                          onChange={(e) => {
                                            const updatedScenes = {
                                              ...panoramaScenes,
                                              [activeSceneId]: {
                                                ...panoramaScenes[activeSceneId],
                                                hotspots: panoramaScenes[activeSceneId].hotspots.map(h => 
                                                  h.id === hotspot.id ? { ...h, assetHeight: parseInt(e.target.value) } : h
                                                )
                                              }
                                            };
                                            setPanoramaScenes(updatedScenes);
                                          }}
                                          className="border rounded px-2 py-1 text-xs"
                                          placeholder="Height"
                                          min="20"
                                          max="200"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>Position: {hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%</span>
                                  <button 
                                    onClick={() => {
                                      const updatedScenes = {
                                        ...panoramaScenes,
                                        [activeSceneId]: {
                                          ...panoramaScenes[activeSceneId],
                                          hotspots: panoramaScenes[activeSceneId].hotspots.filter(h => h.id !== hotspot.id)
                                        }
                                      };
                                      setPanoramaScenes(updatedScenes);
                                    }}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )) || []}
                          </div>
                        )}
                        
                        <button 
                          onClick={savePanoramaData}
                          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No project selected for editing
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assets' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Asset Management</h3>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    id="asset-upload"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="asset-upload"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer"
                  >
                    Upload Asset
                  </label>
                </div>
                
                {assets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.map((asset) => (
                      <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          {asset.type === 'image' ? (
                            <img 
                              src={asset.url} 
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video 
                              src={asset.url}
                              className="w-full h-full object-cover"
                              controls
                            />
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-1 truncate">{asset.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {asset.type} • {(asset.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        <button
                          onClick={() => deleteAsset(asset.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No assets uploaded
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

export default Manage;