import React, { useState, useEffect, useRef } from 'react';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  type: string;
  title: string;
  targetLayer?: number;
  targetScene?: string;
  targetAsset?: string;
  targetProject?: string;
  assetUrl?: string;
  assetWidth?: number;
  assetHeight?: number;
  backgroundSize?: string;
}

interface PanoramaProject {
  id: string;
  name: string;
  defaultSceneId?: string;
}

interface PanoramaViewerProps {
  onNavigate: (layer: number, sceneId?: string) => void;
  projectId?: string;
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ onNavigate, projectId }) => {
  const [projects, setProjects] = useState<PanoramaProject[]>([]);
  const [scenes, setScenes] = useState<{[key: string]: {scene: string, hotspots: Hotspot[], name: string}}>({});
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<PanoramaProject | null>(null);
  const [pannellumLoaded, setPannellumLoaded] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<{layer?: number, projectId?: string, sceneId?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumRef = useRef<any>(null);

  useEffect(() => {
    loadPannellum();
  }, []);

  useEffect(() => {
    if (projectId !== undefined) {
      loadProjects();
    }
  }, [projectId]);



  useEffect(() => {
    if (currentSceneId && scenes[currentSceneId] && pannellumLoaded) {
      setTimeout(() => initPannellum(), 50);
    }
  }, [currentSceneId, scenes, pannellumLoaded]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .asset-hotspot {
          background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0IiBoZWlnaHQ9IjE0NCIgdmlld0JveD0iMCAwIDE0NCAxNDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjcyIiBjeT0iNzIiIHI9IjcyIiBmaWxsPSIjM0I4MkY2Ii8+Cjxzdmcgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiB2aWV3Qm94PSIwIDAgNzIgNzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMzYiIHk9IjM2Ij4KPHBhdGggZD0iTTkgOUg2M1Y2M0g5VjlaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjkiLz4KPC9zdmc+Cjwvc3ZnPgo=') !important;
          background-size: 144px 144px !important;
          width: 144px !important;
          height: 144px !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const loadPannellum = () => {
    if (typeof window !== 'undefined' && !(window as any).pannellum) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.onload = () => setPannellumLoaded(true);
      document.head.appendChild(script);
    } else if ((window as any).pannellum) {
      setPannellumLoaded(true);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading projects, projectId:', projectId);
      const response = await fetch('/api/panorama/projects');
      const data = await response.json();
      const projectList = data.projects || [];
      console.log('Available projects:', projectList);
      setProjects(projectList);
      
      let targetProject: PanoramaProject | undefined;
      if (projectId) {
        targetProject = projectList.find((p: any) => p.id === projectId);
        console.log('Found target project for ID', projectId, ':', targetProject);
      }
      
      // Only use fallback if no projectId was provided
      if (!targetProject && !projectId) {
        targetProject = projectList.find((p: any) => p.defaultSceneId) || projectList[0];
        console.log('Using fallback project:', targetProject);
      }
      
      if (targetProject) {
        console.log('Loading project:', targetProject.name);
        await loadProject(targetProject);
      } else {
        const errorMsg = `Project not found: ${projectId}`;
        console.error(errorMsg);
        console.error('Available project IDs:', projectList.map((p: any) => p.id));
        setError(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
      setLoading(false);
    }
  };

  const loadProject = async (project: PanoramaProject) => {
    try {
      console.log('Loading project scenes for:', project.id);
      const response = await fetch(`/api/panorama/scenes?projectId=${project.id}`);
      const data = await response.json();
      const projectScenes = data.scenes || {};
      console.log('Loaded scenes for project', project.id, ':', Object.keys(projectScenes));
      console.log('Full scene data:', projectScenes);
      
      setCurrentProject(project);
      setScenes(projectScenes);
      
      const sceneIds = Object.keys(projectScenes);
      if (sceneIds.length === 0) {
        console.warn('No scenes found for project:', project.id);
        setError(`No scenes found for project: ${project.name}`);
        setLoading(false);
        return;
      }
      
      const initialScene = project.defaultSceneId && projectScenes[project.defaultSceneId] 
        ? project.defaultSceneId 
        : sceneIds[0];
      
      console.log('Initial scene selected:', initialScene);
      console.log('Default scene ID from project:', project.defaultSceneId);
      console.log('Available scene IDs:', sceneIds);
      
      if (initialScene) {
        setCurrentSceneId(initialScene);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load project scenes:', error);
      setError('Failed to load project scenes');
      setLoading(false);
    }
  };

  const loadProjectDynamically = async (targetProjectId: string, targetSceneId?: string) => {
    try {
      const targetProject = projects.find(p => p.id === targetProjectId);
      if (!targetProject) return;

      const response = await fetch(`/api/panorama/scenes?projectId=${targetProjectId}`);
      const data = await response.json();
      const projectScenes = data.scenes || {};
      
      setCurrentProject(targetProject);
      setScenes(projectScenes);
      
      const sceneIds = Object.keys(projectScenes);
      let sceneToLoad = targetSceneId;
      
      if (!sceneToLoad || !projectScenes[sceneToLoad]) {
        sceneToLoad = targetProject.defaultSceneId && projectScenes[targetProject.defaultSceneId] 
          ? targetProject.defaultSceneId 
          : sceneIds[0];
      }
      
      if (sceneToLoad) {
        setCurrentSceneId(sceneToLoad);
      }
    } catch (error) {
      console.error('Failed to load target project:', error);
    }
  };

  const initPannellum = () => {
    console.log('initPannellum called with:', {
      viewerRef: !!viewerRef.current,
      currentSceneId,
      hasScene: !!scenes[currentSceneId],
      pannellumLoaded: !!(window as any).pannellum
    });
    
    if (!viewerRef.current || !scenes[currentSceneId] || !(window as any).pannellum) {
      console.log('initPannellum early return - missing requirements');
      return;
    }

    const currentScene = scenes[currentSceneId];
    console.log('Initializing scene:', currentScene);
    
    if (pannellumRef.current) {
      try {
        pannellumRef.current.destroy();
      } catch (e) {}
      pannellumRef.current = null;
    }

    if (viewerRef.current) {
      viewerRef.current.innerHTML = '';
    }

    const hotspots = (currentScene.hotspots || []).map((hotspot, index) => {
      const hotspotConfig: any = {
        id: `hotspot-${hotspot.id}`,
        pitch: (50 - hotspot.y) * 1.8,
        yaw: (hotspot.x - 50) * 3.6,
        text: hotspot.title,
        clickHandlerFunc: () => {
          if (hotspot.targetLayer) {
            // Save current state to history
            setNavigationHistory(prev => [...prev, { projectId, sceneId: currentSceneId }]);
            
            if (hotspot.targetLayer === 4 && hotspot.targetProject && hotspot.targetProject !== projectId) {
              // Switch to different panorama project only if it's actually different
              loadProjectDynamically(hotspot.targetProject, hotspot.targetScene);
            } else {
              // Navigate to other layers
              onNavigate(hotspot.targetLayer);
            }
          } else if (hotspot.targetScene) {
            // Save current state to history for scene navigation
            setNavigationHistory(prev => [...prev, { projectId, sceneId: currentSceneId }]);
            setCurrentSceneId(hotspot.targetScene);
          }
          // Asset hotspots don't open files when clicked
        }
      };

      if (hotspot.type === 'asset' && hotspot.targetAsset) {
        hotspotConfig.type = 'info';
        hotspotConfig.cssClass = `asset-hotspot-${hotspot.id}`;
        
        // Add dynamic CSS for this specific hotspot
        setTimeout(() => {
          const style = document.createElement('style');
          style.textContent = `
            .asset-hotspot-${hotspot.id} {
              background-image: url('${hotspot.targetAsset}') !important;
              background-size: ${hotspot.backgroundSize || 'contain'} !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
              width: ${hotspot.assetWidth || 60}px !important;
              height: ${hotspot.assetHeight || 60}px !important;
            }
          `;
          document.head.appendChild(style);
        }, 100);
      } else if (hotspot.type === 'scene') {
        hotspotConfig.type = 'scene';
        
        // If scene hotspot has assetUrl, use custom styling
        if (hotspot.assetUrl) {
          hotspotConfig.cssClass = `scene-asset-hotspot-${hotspot.id}`;
          setTimeout(() => {
            const style = document.createElement('style');
            style.textContent = `
              .scene-asset-hotspot-${hotspot.id} {
                background-image: url('${hotspot.assetUrl}') !important;
                background-size: ${hotspot.backgroundSize || 'contain'} !important;
                background-repeat: no-repeat !important;
                background-position: center !important;
                width: ${hotspot.assetWidth || 60}px !important;
                height: ${hotspot.assetHeight || 60}px !important;
              }
            `;
            document.head.appendChild(style);
          }, 100);
        }
      } else if (hotspot.type === 'layer') {
        hotspotConfig.type = 'info';
        
        // If layer hotspot has targetAsset, use custom styling
        if (hotspot.targetAsset) {
          hotspotConfig.cssClass = `layer-asset-hotspot-${hotspot.id}`;
          setTimeout(() => {
            const style = document.createElement('style');
            style.textContent = `
              .layer-asset-hotspot-${hotspot.id} {
                background-image: url('${hotspot.targetAsset}') !important;
                background-size: ${hotspot.backgroundSize || 'contain'} !important;
                background-repeat: no-repeat !important;
                background-position: center !important;
                width: ${hotspot.assetWidth || 60}px !important;
                height: ${hotspot.assetHeight || 60}px !important;
              }
            `;
            document.head.appendChild(style);
          }, 100);
        }
      } else {
        hotspotConfig.type = 'info';
      }
      
      return hotspotConfig;
    });

    console.log('Initializing scene:', currentSceneId, 'with hotspots:', hotspots);

    pannellumRef.current = (window as any).pannellum.viewer(viewerRef.current, {
      type: 'equirectangular',
      panorama: currentScene.scene,
      autoLoad: true,
      hotSpots: hotspots
    });
  };

  const currentScene = scenes[currentSceneId];

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-xl mb-2">Loading Panorama...</div>
          <div className="text-sm opacity-75">
            {projectId ? `Loading project: ${projectId}` : 'Initializing viewer'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-xl mb-2 text-red-400">Error</div>
          <div className="text-sm opacity-75">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
        {currentScene ? (
          <>
            <div ref={viewerRef} className="w-full h-full" />
            
            <div className="absolute top-4 left-8 bg-black/70 text-white px-3 py-2 rounded z-10">
              <div className="text-sm font-medium">{currentProject?.name}</div>
              <div className="text-xs opacity-75">{currentScene.name}</div>
            </div>
            
            {(() => {
              // Hide existing back button if any
              const existingBackBtn = document.querySelector('.panorama-back-btn');
              if (existingBackBtn) {
                existingBackBtn.remove();
              }
              
              // Show back button only if there's navigation history
              return navigationHistory.length > 0 ? (
                <button
                  onClick={() => {
                    const lastHistory = navigationHistory[navigationHistory.length - 1];
                    if (lastHistory) {
                      if (lastHistory.layer) {
                        onNavigate(lastHistory.layer);
                      } else if (lastHistory.projectId !== projectId) {
                        window.location.href = `/preview/${lastHistory.projectId}`;
                      } else if (lastHistory.sceneId) {
                        setCurrentSceneId(lastHistory.sceneId);
                      }
                      setNavigationHistory(prev => prev.slice(0, -1));
                    }
                  }}
                  className="panorama-back-btn absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded z-10 text-sm"
                >
                  ← Back
                </button>
              ) : null;
            })()}
            
            {Object.keys(scenes).length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {Object.keys(scenes).map((sceneId) => (
                  <button
                    key={sceneId}
                    onClick={() => {
                      console.log('Switching to scene:', sceneId);
                      setCurrentSceneId(sceneId);
                    }}
                    className={`w-12 h-8 rounded border-2 overflow-hidden ${
                      currentSceneId === sceneId ? 'border-blue-400' : 'border-white/50'
                    }`}
                  >
                    <img 
                      src={scenes[sceneId].scene}
                      alt={scenes[sceneId].name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="text-xl mb-2">No Panorama Available</div>
              <div className="text-sm opacity-75">
                {currentProject ? 
                  `No scenes found for project: ${currentProject.name}` : 
                  'Please create a panorama project first'
                }
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PanoramaViewer;