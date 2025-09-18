import { X, Eye, DollarSign, Calculator } from 'lucide-react';
import { useState, Suspense, lazy, useEffect } from 'react';
import buildingExterior from '@/assets/building-exterior.jpg';
import roomInterior from '@/assets/room-interior.jpg';
import { Tour360Modal } from './Tour360Modal';
import { PriceModal } from './PriceModal';

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
  const [show360Modal, setShow360Modal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [simulationInputs, setSimulationInputs] = useState({
    salary: 0,
    term: 15,
    otherLoans: 0,
    location: ''
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [recommendedUnits, setRecommendedUnits] = useState([]);
  const [salaryInput, setSalaryInput] = useState('');
  const [otherLoansInput, setOtherLoansInput] = useState('');
  const [allUnits, setAllUnits] = useState([]);
  
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
          
          // Get unique unit types for tabs
          const uniqueTypes = [...new Set(result.data.map(unit => unit.tipeUnit))].filter(Boolean);
          const areaData = uniqueTypes.map(type => ({
            name: type,
            description: `Unit ${type} dengan fasilitas modern`
          }));
          setUnitAreas(areaData);
          
          // Set first area as default
          if (areaData.length > 0 && !selectedArea) {
            setSelectedArea(areaData[0].name);
          }
          
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
    loadAllUnits();
  }, [isOpen, sectionId]);
  
  // Load all units from master harga API
  const loadAllUnits = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/public/master-harga');
      const result = await response.json();
      if (result.success) {
        setAllUnits(result.data);
      }
    } catch (error) {
      console.error('Error loading all units:', error);
    }
  };
  
  // Calculate loan simulation and find recommended units
  useEffect(() => {
    if (simulationInputs.salary > 0) {
      const maxInstallmentRatio = 0.3; // 30% of salary
      const interestRate = 0.065; // 6.5% annual
      
      const availableIncome = simulationInputs.salary * maxInstallmentRatio - simulationInputs.otherLoans;
      
      if (availableIncome > 0) {
        // Calculate maximum loan amount with 6.5% interest
        const monthlyRate = interestRate / 12;
        const numPayments = simulationInputs.term * 12;
        const maxLoan = availableIncome * ((Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
        
        // Calculate with 5% interest
        const interestRate5 = 0.05;
        const monthlyRate5 = interestRate5 / 12;
        const maxLoan5 = availableIncome * ((Math.pow(1 + monthlyRate5, numPayments) - 1) / (monthlyRate5 * Math.pow(1 + monthlyRate5, numPayments)));
        
        // Assume 20% down payment
        const maxPrice = maxLoan / 0.8;
        const maxPrice5 = maxLoan5 / 0.8;
        
        setSimulationResult({
          maxInstallment: availableIncome,
          maxPrice: maxPrice,
          maxPriceWith5Percent: maxPrice5,
          installmentWith5Percent: availableIncome,
          affordable: maxPrice >= 500000000 // 500M minimum
        });
        
        // Find recommended units
        const pricePerSqm = 25000000; // 25M per m2
        let filteredTowers = towers;
        
        // Filter by location if specified
        if (simulationInputs.location) {
          filteredTowers = towers.filter(tower => 
            tower.name.toLowerCase().includes(simulationInputs.location.toLowerCase())
          );
        }
        
        // Create unit recommendations with estimated prices
        const recommendations = filteredTowers.map(tower => {
          // Extract unit info from description
          const match = tower.description.match(/(\d+)\s*m²/);
          const luas = match ? parseInt(match[1]) : 45; // default 45m2
          const estimatedPrice = luas * pricePerSqm;
          const estimatedInstallment = (estimatedPrice * 0.8 * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
          
          return {
            namaUnit: tower.name,
            tipeUnit: tower.description.split(' - ')[0] || '1 BR',
            luas: luas,
            lokasi: simulationInputs.location || 'Jakarta',
            estimatedPrice: estimatedPrice,
            estimatedInstallment: estimatedInstallment
          };
        }).filter(unit => unit.estimatedPrice <= maxPrice).slice(0, 3);
        
        setRecommendedUnits(recommendations);
      } else {
        setSimulationResult({
          maxInstallment: 0,
          maxPrice: 0,
          affordable: false
        });
        setRecommendedUnits([]);
      }
    } else {
      setRecommendedUnits([]);
    }
  }, [simulationInputs, towers]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatInputCurrency = (value) => {
    if (!value) return '';
    const number = parseInt(value.replace(/\D/g, ''));
    return new Intl.NumberFormat('id-ID').format(number);
  };
  
  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseInt(value.replace(/\D/g, '')) || 0;
  };
  
  const handleSalaryChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrency(rawValue);
    setSalaryInput(formatInputCurrency(rawValue));
    setSimulationInputs(prev => ({...prev, salary: numericValue}));
  };
  
  const handleOtherLoansChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrency(rawValue);
    setOtherLoansInput(formatInputCurrency(rawValue));
    setSimulationInputs(prev => ({...prev, otherLoans: numericValue}));
  };
  
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
                  {/* Loan Simulation & Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Loan Simulation Form */}
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg border">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Simulasi Cicilan Cepat
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Salary Input */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Gaji Bulanan</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                            <input
                              type="text"
                              value={salaryInput}
                              placeholder="15.000.000"
                              className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              onChange={handleSalaryChange}
                            />
                          </div>
                        </div>
                        
                        {/* Loan Term */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Tenor (Tahun)</label>
                          <select 
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={(e) => setSimulationInputs(prev => ({...prev, term: parseInt(e.target.value)}))}
                          >
                            <option value="5">5 Tahun</option>
                            <option value="10">10 Tahun</option>
                            <option value="15" selected>15 Tahun</option>
                            <option value="20">20 Tahun</option>
                            <option value="25">25 Tahun</option>
                          </select>
                        </div>
                        
                        {/* Other Loans */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Cicilan Lain (Opsional)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                            <input
                              type="text"
                              value={otherLoansInput}
                              placeholder="2.000.000"
                              className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              onChange={handleOtherLoansChange}
                            />
                          </div>
                        </div>
                        
                        {/* Location Preference */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Lokasi Pilihan</label>
                          <select 
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={(e) => setSimulationInputs(prev => ({...prev, location: e.target.value}))}
                          >
                            <option value="">Semua Lokasi</option>
                            <option value="Jakarta">Jakarta</option>
                            <option value="Bogor">Bogor</option>
                            <option value="Depok">Depok</option>
                            <option value="Tangerang">Tangerang</option>
                            <option value="Bekasi">Bekasi</option>
                          </select>
                        </div>
                        
                        {/* Results */}
                        {simulationResult && (
                          <div className="mt-6 space-y-4">
                            <div className="p-4 bg-background rounded-lg border">
                              <h4 className="font-semibold mb-3">Hasil Simulasi:</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Maksimal Cicilan:</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(simulationResult.maxInstallment)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Maksimal Harga Unit:</span>
                                  <span className="font-medium text-primary">
                                    {formatCurrency(simulationResult.maxPrice)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <span className={`font-medium ${
                                    simulationResult.affordable ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {simulationResult.affordable ? 'Terjangkau' : 'Perlu Penyesuaian'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Unit Recommendations */}
                            {recommendedUnits.length > 0 && (
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-semibold mb-3 text-green-800">Unit yang Cocok:</h4>
                                <div className="space-y-2">
                                  {recommendedUnits.map((unit, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                      <div>
                                        <div className="font-medium text-sm">{unit.namaUnit}</div>
                                        <div className="text-xs text-gray-600">
                                          {unit.tipeUnit} • {unit.luas}m² • {unit.lokasi}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium text-green-600">
                                          {formatCurrency(unit.estimatedPrice)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          ~{formatCurrency(unit.estimatedInstallment)}/bln
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            

                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Matching Property Prices */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Harga Properti yang Cocok</h3>
                      
                      {simulationInputs.salary > 0 ? (
                        <div className="space-y-4">
                          {/* Input Summary */}
                          <div className="p-4 bg-muted/50 rounded-lg border">
                            <h4 className="font-medium mb-3">Berdasarkan Input Anda:</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Gaji Bulanan:</span>
                                <span className="font-medium">{formatCurrency(simulationInputs.salary)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tenor:</span>
                                <span className="font-medium">{simulationInputs.term} Tahun</span>
                              </div>
                              {simulationInputs.otherLoans > 0 && (
                                <div className="flex justify-between">
                                  <span>Cicilan Lain:</span>
                                  <span className="font-medium">{formatCurrency(simulationInputs.otherLoans)}</span>
                                </div>
                              )}
                              {simulationInputs.location && (
                                <div className="flex justify-between">
                                  <span>Lokasi:</span>
                                  <span className="font-medium">{simulationInputs.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Property Options */}
                          {simulationResult && (
                            <div className="space-y-3">
                              {/* Conservative Option */}
                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-green-800">Pilihan Konservatif</h4>
                                    <p className="text-sm text-green-600">70% dari kemampuan maksimal</p>
                                  </div>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                    Aman
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Harga Properti:</span>
                                    <span className="font-bold text-green-700">
                                      {formatCurrency(simulationResult.maxPrice * 0.7)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cicilan Bulanan:</span>
                                    <span className="font-medium">
                                      {formatCurrency(simulationResult.maxInstallment * 0.7)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Uang Muka (20%):</span>
                                    <span className="font-medium">
                                      {formatCurrency(simulationResult.maxPrice * 0.7 * 0.2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Optimal Option */}
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-blue-800">Pilihan Optimal</h4>
                                    <p className="text-sm text-blue-600">85% dari kemampuan maksimal</p>
                                  </div>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                    Ideal
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Harga Properti:</span>
                                    <span className="font-bold text-blue-700">
                                      {formatCurrency(simulationResult.maxPrice * 0.85)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cicilan Bulanan:</span>
                                    <span className="font-medium">
                                      {formatCurrency(simulationResult.maxInstallment * 0.85)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Uang Muka (20%):</span>
                                    <span className="font-medium">
                                      {formatCurrency(simulationResult.maxPrice * 0.85 * 0.2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Maximum Option */}
                              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-orange-800">Pilihan Maksimal</h4>
                                    <p className="text-sm text-orange-600">100% kemampuan maksimal</p>
                                  </div>
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                                    Berisiko
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Harga Properti:</span>
                                    <span className="font-bold text-orange-700">
                                      {formatCurrency(simulationResult.maxPrice)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cicilan Bulanan:</span>
                                    <span className="font-medium">
                                      {formatCurrency(simulationResult.maxInstallment)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Uang Muka (20%):</span>
                                    <span className="font-medium">
                                      {formatCurrency(simulationResult.maxPrice * 0.2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Available Units from Master Harga API */}
                              {allUnits.length > 0 && (
                                <div className="p-4 bg-background rounded-lg border">
                                  <h4 className="font-semibold mb-3">Unit yang Tersedia:</h4>
                                  <div className="space-y-2">
                                    {allUnits.filter(unit => {
                                      const locationMatch = !simulationInputs.location || 
                                        (unit.lokasi && unit.lokasi.toLowerCase().includes(simulationInputs.location.toLowerCase()));
                                      return unit.hargaJual <= simulationResult.maxPrice && locationMatch;
                                    }).sort((a, b) => a.hargaJual - b.hargaJual)
                                      .slice(0, 4).map((unit, index) => {
                                      const monthlyRate = 0.065 / 12;
                                      const numPayments = simulationInputs.term * 12;
                                      const installment = (unit.hargaJual * 0.8 * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
                                      
                                      return (
                                        <div key={unit.id} className="flex justify-between items-center p-3 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                                          <div className="flex-1">
                                            <div className="font-medium text-sm">{unit.namaUnit}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {unit.tipeUnit} • {unit.luas}m² • {unit.lokasi}
                                            </div>
                                            <div className="text-xs text-green-600 mt-1">
                                              ~{formatCurrency(installment)}/bulan
                                            </div>
                                          </div>
                                          <div className="text-right ml-3">
                                            <div className="text-sm font-bold text-primary">
                                              {formatCurrency(unit.hargaJual)}
                                            </div>
                                            <button 
                                              onClick={() => setSelectedTower(unit.namaUnit)}
                                              className="text-xs text-primary hover:underline mt-1"
                                            >
                                              Lihat Unit
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  {allUnits.filter(unit => {
                                    const locationMatch = !simulationInputs.location || 
                                      (unit.lokasi && unit.lokasi.toLowerCase().includes(simulationInputs.location.toLowerCase()));
                                    return unit.hargaJual <= simulationResult.maxPrice && locationMatch;
                                  }).length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground text-sm">
                                      <p>Tidak ada unit yang sesuai budget</p>
                                      <p className="text-xs mt-1">Coba tingkatkan gaji atau perpanjang tenor</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Masukkan gaji untuk melihat harga yang cocok</p>
                          <p className="text-sm mt-1">Simulasi akan muncul otomatis</p>
                        </div>
                      )}
                    </div>
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
                      
                      {/* Unit Area Navigation & Price Button */}
                      <div className="flex items-center gap-2">
                        <select 
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {unitAreas.map((area) => (
                            <option key={area.name} value={area.name}>
                              {area.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowPriceModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-medium">Lihat Harga</span>
                        </button>
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

                    {/* Photo Gallery with 360 Button */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Galeri Foto - {selectedTower}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Lihat foto-foto unit apartemen dari berbagai sudut
                          </p>
                        </div>
                        <button
                          onClick={() => setShow360Modal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Lihat 360°</span>
                        </button>
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
      
      {/* 360 Tour Modal */}
      <Tour360Modal 
        isOpen={show360Modal}
        onClose={() => setShow360Modal(false)}
        selectedTower={selectedTower}
        selectedArea={selectedArea}
        onBackToGallery={() => setShow360Modal(false)}
      />
      
      {/* Price Modal */}
      <PriceModal 
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        selectedTower={selectedTower}
        selectedArea={selectedArea}
        onBackToUnit={() => setShowPriceModal(false)}
      />
    </div>
  );
};