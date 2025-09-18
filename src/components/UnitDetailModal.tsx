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
    <div className="fixed inset-0 bg-background z-[60]" onClick={onClose}>
      <div className="w-full h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-2"
          >
            ← Kembali ke Daftar Unit
          </button>
          <h2 className="text-2xl font-bold text-foreground">{unit.namaUnit}</h2>
        </div>
        
        <div className="p-6 space-y-6">
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
          
          <div className="flex justify-center pt-4">
            <button
              onClick={onView360}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span className="font-medium">Lihat 360°</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};