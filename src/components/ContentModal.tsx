import { X } from 'lucide-react';
import { useState, Suspense, lazy, useEffect } from 'react';
import buildingExterior from '@/assets/building-exterior.jpg';
import roomInterior from '@/assets/room-interior.jpg';

const Tour360 = lazy(() => import('./Tour360').then(module => ({ default: module.Tour360 })));

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  title: string;
}

const sectionContent: Record<string, {
  images: string[];
  description: string;
  show360Tour: boolean;
  towers?: Array<{
    name: string;
    images: string[];
    description: string;
  }>;
}> = {
  'htm': {
    images: [buildingExterior],
    description: 'HTM (Hak Tanggungan Milik) adalah sistem kepemilikan properti yang memberikan jaminan hak milik yang kuat dan legal. Dengan HTM, Anda mendapatkan sertifikat kepemilikan yang sah.',
    show360Tour: false
  },
  'unit-tour': {
    images: [buildingExterior, roomInterior],
    description: 'Jelajahi unit-unit apartemen kami dengan teknologi virtual tour 360°. Pilih salah satu tower untuk melihat galeri foto dan tour virtual.',
    show360Tour: true,
    towers: []
  },
  'contact': {
    images: [buildingExterior],
    description: 'Hubungi tim marketing kami untuk informasi lebih lanjut. Tersedia konsultasi gratis dan kunjungan langsung ke lokasi proyek.',
    show360Tour: false
  },
  'location': {
    images: [buildingExterior],
    description: 'Lokasi strategis di jantung kota dengan akses mudah ke berbagai fasilitas publik, pusat perbelanjaan, dan transportasi umum.',
    show360Tour: false
  },
  'benefits': {
    images: [roomInterior],
    description: 'Nikmati berbagai keuntungan investasi properti: Nilai investasi yang terus meningkat, Lokasi premium, Fasilitas lengkap, Sistem pembayaran fleksibel.',
    show360Tour: true
  },
  'faq': {
    images: [buildingExterior],
    description: 'Temukan jawaban atas pertanyaan yang sering ditanyakan seputar pembelian unit, proses pembayaran, fasilitas, dan berbagai informasi penting lainnya.',
    show360Tour: false
  },
  'register': {
    images: [roomInterior],
    description: 'Proses pendaftaran mudah dan cepat. Cukup siapkan dokumen KTP, NPWP, dan slip gaji. Tim kami akan membantu proses dari awal hingga serah terima unit.',
    show360Tour: false
  },
  'brochure': {
    images: [buildingExterior, roomInterior],
    description: 'Download e-brochure lengkap dengan informasi detail unit, denah lantai, fasilitas, lokasi, dan paket investasi yang tersedia.',
    show360Tour: true
  }
};

export const ContentModal = ({ isOpen, onClose, sectionId, title }: ContentModalProps) => {
  const [towers, setTowers] = useState([]);
  const [panoramaPhotos, setPanoramaPhotos] = useState([]);
  
  if (!isOpen) return null;

  // Load units data when modal opens
  useEffect(() => {
    const loadUnits = async () => {
      if (!isOpen || sectionId !== 'unit-tour') return;
      
      try {
        const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/public/master-unit');
        const result = await response.json();
        if (result.success) {
          const towerData = result.data.map(unit => ({
            name: unit.namaUnit,
            description: `${unit.tipeUnit} - ${unit.luas} m² - ${unit.lokasi}`,
            images: [roomInterior, buildingExterior] // fallback images
          }));
          setTowers(towerData);
          
          // Load panorama photos for first tower
          if (result.data.length > 0) {
            loadPanoramaPhotos(result.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };
    
    loadUnits();
  }, [isOpen, sectionId]);
  
  // Load panorama photos for selected tower
  const loadPanoramaPhotos = async (unitId) => {
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/public/panoramas/${unitId}`);
      const result = await response.json();
      if (result.success && result.photos.length > 0) {
        setPanoramaPhotos(result.photos);
      }
    } catch (error) {
      console.error('Error loading panorama photos:', error);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const content = sectionContent[sectionId] || {
    images: [buildingExterior],
    description: 'Informasi akan segera tersedia.',
    show360Tour: false
  };

  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [unitAreas, setUnitAreas] = useState([]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background w-full h-full overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Tower Selection for Unit Tour */}
          {sectionId === 'unit-tour' && towers.length > 0 ? (
            <>
              {!selectedTower ? (
                <>
                  {/* Main Images Gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {content.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${title} ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Informasi Detail</h3>
                    <p className="text-muted-foreground leading-relaxed">{content.description}</p>
                  </div>

                  {/* Tower Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Pilih Tower</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {towers.map((tower, index) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedTower(tower.name)}
                          className="p-6 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors group"
                        >
                          <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary">{tower.name}</h4>
                          <p className="text-muted-foreground text-sm">{tower.description}</p>
                          <div className="mt-4 text-primary text-sm font-medium">Klik untuk melihat galeri foto 360° →</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Selected Tower Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedTower(null)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          ← Kembali ke pilihan tower
                        </button>
                        <h3 className="text-lg font-semibold text-foreground">{selectedTower}</h3>
                      </div>
                      
                      {/* Unit Area Navigation */}
                      <div className="relative">
                        <select 
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary z-50"
                        >
                          {unitAreas.map((area) => (
                            <option key={area.name} value={area.name}>
                              {area.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Selected Unit Area Info */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-1">Unit {selectedArea}</h4>
                      <p className="text-sm text-muted-foreground">
                        {unitAreas.find(area => area.name === selectedArea)?.description}
                      </p>
                    </div>
                    
                    {/* Tower Images Gallery */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {panoramaPhotos.length > 0 ? (
                        panoramaPhotos.map((photo) => (
                          <div key={photo.id} className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <img 
                              src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${photo.filename}`}
                              alt={photo.originalName}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.target.src = roomInterior;
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={roomInterior}
                            alt="Default room"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* 360 Tour for Selected Tower and Area */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Virtual Tour 360° - {selectedTower} ({selectedArea})
                      </h3>
                      <Suspense fallback={<div className="flex items-center justify-center h-64 bg-muted rounded-lg"><div className="text-muted-foreground">Loading virtual tour...</div></div>}>
                        <Tour360 
                          selectedTower={selectedTower} 
                          selectedArea={selectedArea}
                          onUnitsLoaded={(units) => {
                            const towerData = units.map(unit => ({
                              name: unit.namaUnit,
                              description: `${unit.tipeUnit} - ${unit.luas} m² - ${unit.lokasi}`
                            }));
                            setTowers(towerData);
                            
                            const uniqueTypes = [...new Set(units.map(unit => unit.tipeUnit))].filter(Boolean);
                            const areaData = uniqueTypes.map(type => ({
                              name: type,
                              description: `Unit ${type} dengan fasilitas modern`
                            }));
                            setUnitAreas(areaData);
                            
                            if (areaData.length > 0 && !selectedArea) {
                              setSelectedArea(areaData[0].name);
                            }
                          }}
                        />
                      </Suspense>
                      
                      {/* Navigation between areas */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {unitAreas.map((area) => (
                          <button
                            key={area.name}
                            onClick={() => setSelectedArea(area.name)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedArea === area.name
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {area.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Default content for other sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.images.map((image, index) => (
                  <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${title} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informasi Detail</h3>
                <p className="text-muted-foreground leading-relaxed">{content.description}</p>
              </div>

              {content.show360Tour && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Virtual Tour 360°</h3>
                  <Suspense fallback={<div className="flex items-center justify-center h-64 bg-muted rounded-lg"><div className="text-muted-foreground">Loading virtual tour...</div></div>}>
                    <Tour360 />
                  </Suspense>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Hubungi Sales
            </button>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
              Download Brosur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};