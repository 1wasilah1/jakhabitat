import { X, ArrowLeft, Calculator, Home, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTower: string;
  selectedArea: string;
  onBackToUnit: () => void;
}

export const PriceModal = ({ isOpen, onClose, selectedTower, selectedArea, onBackToUnit }: PriceModalProps) => {
  const [priceData, setPriceData] = useState(null);
  const [simulationData, setSimulationData] = useState({
    downPayment: 20,
    loanTerm: 15,
    interestRate: 6.5
  });
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const loadPriceData = async () => {
      try {
        // Get unit data first
        const unitsResponse = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/public/master-unit');
        const unitsResult = await unitsResponse.json();
        
        if (unitsResult.success) {
          const unit = unitsResult.data.find(u => u.namaUnit === selectedTower);
          if (unit) {
            // Load price data for this unit
            const priceResponse = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/public/harga/${unit.id}`);
            const priceResult = await priceResponse.json();
            
            if (priceResult.success) {
              setPriceData(priceResult.data);
            } else {
              // Fallback price data
              setPriceData({
                hargaJual: unit.luas * 25000000, // 25jt per m2
                biayaAdmin: 5000000,
                biayaNotaris: 3000000,
                biayaPPN: unit.luas * 25000000 * 0.11,
                totalBiaya: (unit.luas * 25000000) + 5000000 + 3000000 + (unit.luas * 25000000 * 0.11)
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading price data:', error);
      }
    };

    loadPriceData();
  }, [isOpen, selectedTower]);

  // Calculate monthly payment
  useEffect(() => {
    if (!priceData) return;

    const principal = priceData.totalBiaya * (1 - simulationData.downPayment / 100);
    const monthlyRate = simulationData.interestRate / 100 / 12;
    const numPayments = simulationData.loanTerm * 12;
    
    const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    setMonthlyPayment(monthly);
  }, [priceData, simulationData]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-70">
      <div className="bg-background w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToUnit}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Kembali ke Unit</span>
            </button>
            <div className="h-4 w-px bg-border"></div>
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Harga & Simulasi Cicilan
              </h2>
              <p className="text-sm text-muted-foreground">{selectedTower} - Unit {selectedArea}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {priceData ? (
            <>
              {/* Price Breakdown */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Rincian Harga
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Harga Jual:</span>
                      <span className="font-medium">{formatCurrency(priceData.hargaJual)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya Admin:</span>
                      <span className="font-medium">{formatCurrency(priceData.biayaAdmin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya Notaris:</span>
                      <span className="font-medium">{formatCurrency(priceData.biayaNotaris)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PPN (11%):</span>
                      <span className="font-medium">{formatCurrency(priceData.biayaPPN)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center p-4 bg-primary/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Harga</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(priceData.totalBiaya)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Simulasi Cicilan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Uang Muka (%)</label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={simulationData.downPayment}
                      onChange={(e) => setSimulationData(prev => ({
                        ...prev,
                        downPayment: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10%</span>
                      <span className="font-medium">{simulationData.downPayment}%</span>
                      <span>50%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Jangka Waktu (Tahun)</label>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={simulationData.loanTerm}
                      onChange={(e) => setSimulationData(prev => ({
                        ...prev,
                        loanTerm: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5 thn</span>
                      <span className="font-medium">{simulationData.loanTerm} thn</span>
                      <span>25 thn</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Suku Bunga (%)</label>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      step="0.1"
                      value={simulationData.interestRate}
                      onChange={(e) => setSimulationData(prev => ({
                        ...prev,
                        interestRate: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>3%</span>
                      <span className="font-medium">{simulationData.interestRate}%</span>
                      <span>12%</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg border text-center">
                    <p className="text-sm text-muted-foreground mb-1">Uang Muka</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(priceData.totalBiaya * simulationData.downPayment / 100)}
                    </p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border text-center">
                    <p className="text-sm text-muted-foreground mb-1">Jumlah Pinjaman</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(priceData.totalBiaya * (1 - simulationData.downPayment / 100))}
                    </p>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border text-center">
                    <p className="text-sm text-muted-foreground mb-1">Cicilan per Bulan</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(monthlyPayment)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Schedule Preview */}
              <div className="bg-background p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Jadwal Pembayaran (5 Tahun Pertama)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tahun</th>
                        <th className="text-right p-2">Cicilan/Bulan</th>
                        <th className="text-right p-2">Total/Tahun</th>
                        <th className="text-right p-2">Sisa Pinjaman</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map(year => {
                        const remainingBalance = priceData.totalBiaya * (1 - simulationData.downPayment / 100) * 
                          Math.pow(1 + simulationData.interestRate / 100 / 12, (year - 1) * 12) - 
                          monthlyPayment * ((Math.pow(1 + simulationData.interestRate / 100 / 12, (year - 1) * 12) - 1) / (simulationData.interestRate / 100 / 12));
                        
                        return (
                          <tr key={year} className="border-b">
                            <td className="p-2 font-medium">Tahun {year}</td>
                            <td className="p-2 text-right">{formatCurrency(monthlyPayment)}</td>
                            <td className="p-2 text-right">{formatCurrency(monthlyPayment * 12)}</td>
                            <td className="p-2 text-right">{formatCurrency(Math.max(0, remainingBalance))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="flex-1 min-w-[200px] px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Konsultasi dengan Sales
                </button>
                <button className="flex-1 min-w-[200px] px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
                  Download Simulasi
                </button>
                <button 
                  onClick={onBackToUnit}
                  className="flex-1 min-w-[200px] px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Lihat Unit Lagi
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading price data...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};