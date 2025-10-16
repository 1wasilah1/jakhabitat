import React, { useState } from 'react';

const MarzipanoTools: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showHotspotEditor, setShowHotspotEditor] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [hotspots, setHotspots] = useState<any[]>([]);
  
  const loadHotspots = async (project: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/marzipano/${project}/hotspots`);
      if (response.ok) {
        const data = await response.json();
        setHotspots(data.hotspots || []);
      }
    } catch (error) {
      console.error('Failed to load hotspots:', error);
    }
  };
  
  // Load hotspots when editor opens
  React.useEffect(() => {
    if (showHotspotEditor && selectedFolder) {
      loadHotspots(selectedFolder);
    }
  }, [showHotspotEditor, selectedFolder]);
  
  const saveHotspot = async () => {
    const titleInput = document.querySelector('input[placeholder="Title"]') as HTMLInputElement;
    const textInput = document.querySelector('input[placeholder="Text"]') as HTMLInputElement;
    const yawSpan = document.getElementById('hotspot-yaw');
    const pitchSpan = document.getElementById('hotspot-pitch');
    
    if (!titleInput?.value || !textInput?.value) {
      alert('Please fill in title and text');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/marzipano/${selectedFolder}/hotspots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleInput.value,
          text: textInput.value,
          yaw: yawSpan?.textContent || '0',
          pitch: pitchSpan?.textContent || '0'
        })
      });
      
      if (response.ok) {
        alert('Hotspot saved successfully!');
        // Clear form
        titleInput.value = '';
        textInput.value = '';
        if (yawSpan) yawSpan.textContent = '0';
        if (pitchSpan) pitchSpan.textContent = '0';
        // Reload hotspots
        loadHotspots(selectedFolder);
      } else {
        alert('Failed to save hotspot');
      }
    } catch (error) {
      alert('Error saving hotspot');
    }
  };
  
  const deleteHotspot = async (hotspotId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/marzipano/${selectedFolder}/hotspots/${hotspotId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Hotspot deleted successfully!');
        // Reload hotspots from server
        loadHotspots(selectedFolder);
      } else {
        alert('Failed to delete hotspot');
      }
    } catch (error) {
      // Fallback: remove from local state only
      setHotspots(prev => prev.filter(h => h.id !== hotspotId));
      alert('Hotspot removed from list (file not updated)');
    }
  };

  const marzipanoFolders = [
    'tower-kanaya',
    'tower-kanaya-studio',
    'tower-samawa'
  ];

  const handlePreview = (folder: string) => {
    setSelectedFolder(folder);
    setPreviewUrl(`/jakhabitat/marzipano/${folder}/app-files/index.html`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marzipano Tools</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project List */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Marzipano Projects</h2>
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                + Add Project
              </button>
            </div>
            <div className="space-y-3">
              {marzipanoFolders.map((folder) => (
                <div key={folder} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{folder}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(folder)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFolder(folder);
                        setShowHotspotEditor(true);
                      }}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      Edit Hotspots
                    </button>
                    <a
                      href={`/jakhabitat/marzipano/${folder}/app-files/index.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">
                {selectedFolder ? `Preview: ${selectedFolder}` : 'Select a project to preview'}
              </h2>
            </div>
            <div className="h-96">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title={`Marzipano Preview - ${selectedFolder}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a project to see preview
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Project Manager</h3>
              <p className="text-sm text-gray-600 mb-3">Manage Marzipano project files and settings</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                Manage Projects
              </button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Hotspot Editor</h3>
              <p className="text-sm text-gray-600 mb-3">Add and edit hotspots in panorama scenes</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
                Edit Hotspots
              </button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Scene Manager</h3>
              <p className="text-sm text-gray-600 mb-3">Organize and manage panorama scenes</p>
              <button className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700">
                Manage Scenes
              </button>
            </div>
          </div>
        </div>

        {/* Add Project Modal */}
        {showAddProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Project</h3>
              <input
                type="text"
                placeholder="Project name (e.g., tower-samawa)"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              />
              <div className="text-sm text-gray-600 mb-4">
                <p>Steps to add project:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create folder: /public/marzipano/{newProjectName || 'project-name'}/</li>
                  <li>Copy Marzipano files with app-files/ structure</li>
                  <li>Click "Add to List" below</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (newProjectName) {
                      // Add to list (you'd need to implement backend API)
                      alert(`Project "${newProjectName}" added to list. Make sure to create the folder structure.`);
                      setNewProjectName('');
                      setShowAddProject(false);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add to List
                </button>
                <button
                  onClick={() => {
                    setShowAddProject(false);
                    setNewProjectName('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hotspot Editor Modal */}
        {showHotspotEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[95vw] h-[90vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Hotspots - {selectedFolder}</h3>
                <button
                  onClick={() => setShowHotspotEditor(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 h-full">
                {/* Panorama Viewer */}
                <div className="col-span-3 border rounded">
                  <div className="bg-blue-600 text-white p-2 rounded-t text-sm font-medium flex justify-between">
                    <span>📍 Click panorama: Add hotspot | Click hotspot: Edit</span>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" className="text-xs" />
                      <span className="text-xs">Edit Mode</span>
                    </label>
                  </div>
                  <iframe
                    src={`/jakhabitat/marzipano/${selectedFolder}/app-files/index.html`}
                    className="w-full h-full border-0 rounded-b"
                    title={`Hotspot Editor - ${selectedFolder}`}
                    onLoad={(e) => {
                      // Add click listener to iframe
                      const iframe = e.target as HTMLIFrameElement;
                      try {
                        iframe.contentWindow?.addEventListener('click', (event) => {
                          // Calculate yaw/pitch from click position
                          const rect = iframe.getBoundingClientRect();
                          const x = event.clientX - rect.left;
                          const y = event.clientY - rect.top;
                          const yaw = ((x / rect.width) - 0.5) * Math.PI * 2;
                          const pitch = ((0.5 - y / rect.height)) * Math.PI;
                          
                          console.log('Hotspot position:', { yaw, pitch, x, y });
                          alert(`Hotspot added at yaw: ${yaw.toFixed(4)}, pitch: ${pitch.toFixed(4)}`);
                        });
                      } catch (e) {
                        console.log('Cross-origin iframe, cannot add click listener');
                      }
                    }}
                  />
                </div>
                
                {/* Hotspot Panel */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Add Hotspot</h5>
                    <div className="space-y-2">
                      <input placeholder="Title" className="w-full border rounded px-2 py-1 text-sm" />
                      <input placeholder="Text" className="w-full border rounded px-2 py-1 text-sm" />
                      <select className="w-full border rounded px-2 py-1 text-sm">
                        <option value="">Select Target Project</option>
                        {marzipanoFolders.map(folder => (
                          <option key={folder} value={folder}>{folder}</option>
                        ))}
                      </select>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Hotspot Icon</label>
                        <div className="grid grid-cols-4 gap-1 border rounded p-2 max-h-24 overflow-y-auto">
                          {[
                            { emoji: '🏠', name: 'Home' },
                            { emoji: '🏢', name: 'Building' },
                            { emoji: '🚪', name: 'Door' },
                            { emoji: '🛏️', name: 'Bed' },
                            { emoji: '🛋️', name: 'Sofa' },
                            { emoji: '🚿', name: 'Shower' },
                            { emoji: '🍽️', name: 'Dining' },
                            { emoji: '📺', name: 'TV' },
                            { emoji: '🪟', name: 'Window' },
                            { emoji: '🚗', name: 'Parking' },
                            { emoji: '🏊', name: 'Pool' },
                            { emoji: '🏋️', name: 'Gym' },
                            { emoji: '🌳', name: 'Garden' },
                            { emoji: '🛗', name: 'Elevator' },
                            { emoji: '🔒', name: 'Security' },
                            { emoji: '📍', name: 'Location' }
                          ].map((icon, idx) => (
                            <button
                              key={idx}
                              className="p-1 text-lg hover:bg-blue-100 rounded border border-transparent hover:border-blue-300 transition-colors"
                              title={icon.name}
                              onClick={() => {
                                // Set selected icon
                                document.querySelectorAll('.icon-btn').forEach(btn => btn.classList.remove('bg-blue-200', 'border-blue-500'));
                                (event?.target as HTMLElement)?.classList.add('bg-blue-200', 'border-blue-500');
                              }}
                              type="button"
                            >
                              {icon.emoji}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Or use Icons8: 
                          <a href="https://icons8.com/icons/ios" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Browse more icons
                          </a>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Yaw: <span id="hotspot-yaw">0</span><br/>
                        Pitch: <span id="hotspot-pitch">0</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={saveHotspot}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                        >
                          💾 Save New
                        </button>
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700" style={{display: 'none'}} id="update-btn">
                          🔄 Update
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Current Hotspots</h5>
                    <div className="border rounded p-3 h-64 overflow-y-auto bg-gray-50 text-sm">
                      <div className="space-y-2">
                        {hotspots.length > 0 ? hotspots.map((hotspot, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border hover:bg-blue-50 cursor-pointer" onClick={() => {
                            // Load hotspot data to form
                            const titleInput = document.querySelector('input[placeholder="Title"]') as HTMLInputElement;
                            const textInput = document.querySelector('input[placeholder="Text"]') as HTMLInputElement;
                            if (titleInput) titleInput.value = hotspot.title;
                            if (textInput) textInput.value = hotspot.text;
                            document.getElementById('hotspot-yaw')!.textContent = hotspot.yaw.toFixed(3);
                            document.getElementById('hotspot-pitch')!.textContent = hotspot.pitch.toFixed(3);
                            document.getElementById('update-btn')!.style.display = 'block';
                          }}>
                            <div className="font-medium flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🏢</span>
                                <span>{hotspot.title}</span>
                              </div>
                              <span className="text-blue-600 text-xs">✎ Edit</span>
                            </div>
                            <div className="text-xs text-gray-500">yaw: {hotspot.yaw.toFixed(3)}, pitch: {hotspot.pitch.toFixed(3)}</div>
                            <div className="flex gap-2 mt-1">
                              <button className="text-blue-600 text-xs hover:underline" onClick={(e) => {
                                e.stopPropagation();
                                // Load to form for editing
                              }}>Edit</button>
                              <button className="text-red-600 text-xs hover:underline" onClick={(e) => {
                                e.stopPropagation();
                                if(confirm(`Delete "${hotspot.title}" hotspot? This will remove it from data.js file.`)) {
                                  deleteHotspot(hotspot.title);
                                }
                              }}>Delete</button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-gray-500 text-center py-4">
                            No hotspots found
                          </div>
                        )}
                        
                        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                          <div className="text-xs text-yellow-700">
                            💡 <strong>Tip:</strong> Click any hotspot in the panorama to edit it directly
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Instructions</h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Add New:</strong></p>
                      <p>1. Click empty area in panorama</p>
                      <p>2. Fill details → Save New</p>
                      <p><strong>Edit Existing:</strong></p>
                      <p>1. Click hotspot icon in panorama</p>
                      <p>2. Modify details → Update</p>
                      <p>3. Or click hotspot in list → Edit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarzipanoTools;