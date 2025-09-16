import { X, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import roomInterior from '@/assets/room-interior.jpg';

interface Tour360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTower: string;
  selectedArea: string;
  onBackToGallery: () => void;
}

export const Tour360Modal = ({ isOpen, onClose, selectedTower, selectedArea, onBackToGallery }: Tour360ModalProps) => {
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!isOpen || !selectedTower) return;

    const loadPhotos = async () => {
      try {
        // Get unit ID by tower name (simplified - you might need proper mapping)
        const unitId = selectedTower === 'Tower Kanaya' ? 2 : 1;
        const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/public/panoramas/${unitId}`);
        const result = await response.json();
        
        if (result.success && result.photos.length > 0) {
          const defaultPhoto = result.photos.find(photo => photo.isDefault);
          const firstPhoto = defaultPhoto || result.photos[0];
          setCurrentPhoto(firstPhoto);
          setPhotos(result.photos);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    };

    loadPhotos();
  }, [isOpen, selectedTower]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
      <div className="bg-background w-full h-full overflow-hidden">
        {/* Header with Navigation */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToGallery}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Kembali ke Galeri</span>
            </button>
            <div className="h-4 w-px bg-border"></div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedTower}</h2>
              <p className="text-sm text-muted-foreground">Unit {selectedArea}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 360 Photo Display */}
        <div className="relative h-[calc(100vh-80px)] bg-black">
          {currentPhoto ? (
            <img 
              src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${currentPhoto.filename}`}
              alt={currentPhoto.originalName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = roomInterior;
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading panorama...</div>
            </div>
          )}

          {/* Photo Info Overlay */}
          {currentPhoto && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
              <h4 className="font-medium">{String(currentPhoto.roomCategory || 'Room').replace('_', ' ')}</h4>
              <p className="text-sm text-white/80">{selectedTower}</p>
            </div>
          )}

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentPhoto(photo)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPhoto?.id === photo.id 
                      ? 'bg-white' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};