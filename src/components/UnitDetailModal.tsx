import { X, Eye } from 'lucide-react';

interface UnitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: any;
  onView360: () => void;
}

export const UnitDetailModal = ({ isOpen, onClose, unit, onView360 }: UnitDetailModalProps) => {
  if (!isOpen || !unit) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-background w-full max-w-2xl mx-4 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">{unit.namaUnit}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Spesifikasi Unit</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tipe:</span>
                  <span className="font-medium">{unit.tipeUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luas:</span>
                  <span className="font-medium">{unit.luas} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Lokasi:</span>
                  <span className="font-medium">{unit.lokasi}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Informasi Harga</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Harga Jual:</span>
                  <span className="font-bold text-primary">{formatCurrency(unit.hargaJual)}</span>
                </div>
                {unit.hargaSewa > 0 && (
                  <div className="flex justify-between">
                    <span>Harga Sewa:</span>
                    <span className="font-medium">{formatCurrency(unit.hargaSewa)}/bulan</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>DP Minimum:</span>
                  <span className="font-medium">{unit.dpMinimum}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={onView360}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Lihat 360°</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};