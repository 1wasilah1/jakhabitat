import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function JakartaAdminMap() {
  const [selectedTower, setSelectedTower] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalUnit, setModalUnit] = useState<any>(null)
  const [panoramaScenes, setPanoramaScenes] = useState<any>({})

  const handleUnitClick = async (unit: any, towerName: string) => {
    setModalUnit({ ...unit, towerName })
    setShowModal(true)
  }

  useEffect(() => {
    if (showModal && modalUnit) {
      // Map tower names and unit types to correct project IDs from the data
      let projectId = null;
      
      if (modalUnit.type === 'AKSES MASUK & PARKIRAN') {
        projectId = 'project-1765779191168'; // Samawa AREA MASUK & PARKIRAN
      } else if (modalUnit.type === 'FASUM') {
        projectId = 'project-1765779241506'; // Kanaya FASILITAS UMUM
      } else if (modalUnit.towerName.includes('Samawa')) {
        projectId = 'project-1764660544537';
      } else if (modalUnit.towerName.includes('Kanaya')) {
        projectId = 'project-1764659629822';
      }
      
      console.log('Modal opened for:', modalUnit.towerName, 'Project ID:', projectId)
      
      if (projectId) {
        const loadPanorama = async () => {
          try {
            const res = await fetch(`/api/panorama/scenes?projectId=${projectId}`)
            const data = await res.json()
            console.log('Loaded panorama data:', data)
            
            if (data.scenes && Object.keys(data.scenes).length > 0) {
              setPanoramaScenes(data.scenes)
              setTimeout(() => {
                initPanorama(data.scenes)
              }, 1000)
            } else {
              console.log('No scenes found for project:', projectId)
            }
          } catch (error) {
            console.error('Failed to load panorama:', error)
          }
        }
        
        setTimeout(loadPanorama, 500)
      }
    }
  }, [showModal, modalUnit])

  const initPanorama = (scenes: any) => {
    const sceneIds = Object.keys(scenes)
    console.log('Initializing panorama with scenes:', sceneIds)
    
    if (sceneIds.length === 0) {
      console.log('No scenes available')
      return
    }
    
    const container = document.getElementById('panorama-preview')
    if (!container) {
      console.log('Container not found')
      return
    }

    // Clear container first
    container.innerHTML = ''
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.position = 'relative'

    if (typeof window !== 'undefined' && (window as any).pannellum) {
      try {
        const firstSceneId = sceneIds[0]
        const firstScene = scenes[firstSceneId]
        
        console.log('Creating panorama viewer with first scene:', firstSceneId, firstScene)
        
        const hotspots = Array.isArray(firstScene.hotspots) ? firstScene.hotspots.map((hotspot: any) => ({
          id: hotspot.id,
          pitch: (50 - hotspot.y) * 1.8,
          yaw: (hotspot.x - 50) * 3.6,
          type: hotspot.type === 'scene' ? 'scene' : 'info',
          text: hotspot.title,
          sceneId: hotspot.targetScene,
          clickHandlerFunc: () => {
            if (hotspot.targetScene && scenes[hotspot.targetScene]) {
              const targetScene = scenes[hotspot.targetScene]
              const newHotspots = Array.isArray(targetScene.hotspots) ? targetScene.hotspots.map((h: any) => ({
                id: h.id,
                pitch: (50 - h.y) * 1.8,
                yaw: (h.x - 50) * 3.6,
                type: h.type === 'scene' ? 'scene' : 'info',
                text: h.title,
                sceneId: h.targetScene,
                clickHandlerFunc: () => initPanorama(scenes)
              })) : []
              
              container.innerHTML = ''
              ;(window as any).pannellum.viewer(container, {
                type: 'equirectangular',
                panorama: targetScene.scene,
                autoLoad: true,
                hotSpots: newHotspots,
                showControls: true,
                showFullscreenCtrl: false
              })
            }
          }
        })) : []
        
        const viewer = (window as any).pannellum.viewer(container, {
          type: 'equirectangular',
          panorama: firstScene.scene,
          autoLoad: true,
          hotSpots: hotspots,
          showControls: true,
          showFullscreenCtrl: false
        })
        
        // Force resize after creation
        setTimeout(() => {
          if (viewer && viewer.resize) {
            viewer.resize()
          }
        }, 100)
        
        console.log('Panorama initialized successfully')
      } catch (error) {
        console.error('Error initializing panorama:', error)
      }
    } else {
      console.log('Loading Pannellum library')
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
      script.onload = () => {
        console.log('Pannellum loaded, initializing panorama')
        setTimeout(() => initPanorama(scenes), 100)
      }
      document.head.appendChild(script)
    }
  }
  const regions = [
    { 
      name: 'Jakarta Barat', 
      color: '#A5468C', 
      luas: '126.15 km²', 
      populasi: '2.5 Juta',
      towers: [
        { 
          name: 'Sentraland Cengkareng', 
          units: '166 UNIT', 
          image: '/tower-unit/Banner-Samesta-Sentraland-Cengkareng.webp',
          isFull: true,
          unitTypes: []
        }
      ]
    },
    { 
      name: 'Jakarta Utara', 
      color: '#D64441', 
      luas: '146.66 km²', 
      populasi: '1.8 Juta',
      towers: [
        { 
          name: 'Bandar Kemayoran', 
          units: '38 UNIT', 
          image: '/tower-unit/bandar-kemayoran.webp',
          isFull: true,
          unitTypes: []
        }
      ]
    },
    { name: 'Jakarta Pusat', color: '#3FA6CC', luas: '48.13 km²', populasi: '0.9 Juta', towers: [] },
    { 
      name: 'Jakarta Timur', 
      color: '#F0B44B', 
      luas: '188.03 km²', 
      populasi: '2.9 Juta',
      towers: [
        { 
          name: 'Menara Samawa', 
          units: '780 UNIT', 
          image: '/tower-unit/menara-samawa-proyek-sarana.jpg', 
          highlight: true,
          unitTypes: [
            { type: 'Studio' },
            { type: '1 BR' },
            { type: '2 BR' },
            { type: 'AKSES MASUK & PARKIRAN' },
            { type: 'FASUM' }
          ]
        },
        { 
          name: 'Menara Swasana', 
          units: '96 UNIT', 
          image: '/tower-unit/menara-swasana-didesain-secara-eksklusif-untuk-menjadi-hunian-terbaik_220531161743-521.jpg',
          isFull: true,
          unitTypes: []
        },
        { 
          name: 'Menara Kanaya', 
          units: '868 UNIT', 
          image: '/tower-unit/kanaya.jpg', 
          highlight: true,
          unitTypes: [
            { type: 'Studio' },
            { type: '1 BR' },
            { type: '2 BR' },
            { type: 'AKSES MASUK & PARKIRAN' },
            { type: 'FASUM' }
          ]
        }
      ]
    },
    { name: 'Jakarta Selatan', color: '#86AE3E', luas: '141.27 km²', populasi: '2.2 Juta', towers: [] }
  ]

  return (
    <div className="py-20">
      <div className="max-w-6xl mx-auto px-4">


        <div className="space-y-4 max-w-4xl mx-auto">
          {regions.map((region, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="p-4" style={{backgroundColor: region.color}}>
                    <h3 className="text-xl font-bold text-white">{region.name}</h3>
                  </div>

                </div>
                
                {region.towers.length > 0 && (
                  <>
                    <div className="px-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex gap-3 pr-6 flex-col">
                      <div className="flex gap-3">
                        {region.towers.map((tower, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <motion.div 
                              className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-md ${
                                tower.isFull ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                              } ${
                                tower.highlight ? 'border-green-500' : 'border-gray-200'
                              }`}
                              animate={tower.isFull ? {} : {
                                boxShadow: [
                                  '0 0 0px rgba(34, 197, 94, 0)',
                                  '0 0 20px rgba(34, 197, 94, 0.8)',
                                  '0 0 0px rgba(34, 197, 94, 0)'
                                ]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                              onClick={() => !tower.isFull && setSelectedTower(selectedTower === tower.name ? null : tower.name)}
                            >
                              <img 
                                src={tower.image} 
                                alt={tower.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/96?text=Tower'
                                }}
                              />
                            </motion.div>
                            <p className="text-xs text-center mt-2 font-semibold text-gray-800">{tower.name}</p>
                            <p className={`text-xs font-bold ${
                              tower.highlight ? 'text-green-600' : 'text-gray-600'
                            }`}>{tower.units}</p>
                            {tower.isFull && (
                              <span className="text-xs text-red-600 font-bold">FULL</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <AnimatePresence>
                        {selectedTower && region.towers.find(t => t.name === selectedTower) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 rounded-lg p-4 mt-2"
                          >
                            <h4 className="font-bold text-sm mb-3">{selectedTower} - Tipe Unit</h4>
                            <div className="space-y-2">
                              {region.towers.find(t => t.name === selectedTower)?.unitTypes?.map((unit, i) => (
                                <div 
                                  key={i} 
                                  className="bg-white p-2 rounded text-xs cursor-pointer hover:bg-gray-100 transition text-center"
                                  onClick={() => handleUnitClick(unit, selectedTower)}
                                >
                                  <span className="font-semibold">{unit.type}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && modalUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-[95vw] h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Preview {modalUnit.towerName}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
            
            <div className="w-full h-[calc(100%-80px)] bg-gray-100 rounded-lg overflow-hidden">
              {Object.keys(panoramaScenes).length > 0 ? (
                <div id="panorama-preview" className="w-full h-full"></div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Loading Panorama...</div>
                    <div className="text-sm text-gray-600">Preparing 360° view for {modalUnit.towerName}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
