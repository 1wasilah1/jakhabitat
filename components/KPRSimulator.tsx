import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Info } from 'lucide-react';

const KPRSimulator = () => {
  const [step, setStep] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [units, setUnits] = useState([]);
  const [panoramaProjects, setPanoramaProjects] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pekerjaan: 'Profesional',
    usia: 30,
    gaji: 8000000,
    wilayah: '',
    tipeUnit: '',
    hargaProperti: 500000000,
    downPayment: 20,
    jangkaWaktu: 15,
    bunga: '5.5% - Fixed 2 Tahun'
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateLoan = () => {
    const principal = formData.hargaProperti * (1 - formData.downPayment / 100);
    const monthlyRate = 0.0428 / 12;
    const numPayments = formData.jangkaWaktu * 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return {
      principal,
      monthlyPayment,
      downPaymentAmount: formData.hargaProperti * (formData.downPayment / 100)
    };
  };

  const loan = calculateLoan();

  useEffect(() => {
    Promise.all([
      fetch('/api/units').then(res => res.json()),
      fetch('/api/panorama/projects').then(res => res.json())
    ])
    .then(([unitsData, panoramaData]) => {
      setUnits(unitsData.units || []);
      setPanoramaProjects(panoramaData.projects || []);
    })
    .catch(err => console.error('Error loading data:', err));
  }, []);

  const getSamawaUnits = () => {
    const samawa = units.find(unit => unit.name === 'Tower Samawa');
    return samawa ? samawa.types : [];
  };

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-lg overflow-hidden">
        <div className="bg-gray-900 text-white p-4 rounded-t-3xl">
          <div className="bg-white/10 text-white px-4 py-2 rounded-lg mb-4">
            <div className="text-sm">Langkah 1/2</div>
            <div className="font-semibold">Masukan Data Pendukung</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pekerjaan</label>
            <div className="relative">
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({...formData, pekerjaan: e.target.value})}
              >
                <option>Profesional</option>
                <option>Karyawan</option>
                <option>Wiraswasta</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Usia (Tahun)</label>
            <div className="relative">
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
                value={formData.usia}
                onChange={(e) => setFormData({...formData, usia: parseInt(e.target.value)})}
              >
                {Array.from({length: 40}, (_, i) => i + 21).map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Rentang Gaji</span>
              <span className="text-gray-900 font-semibold text-lg">
                {formatRupiah(formData.gaji)}
              </span>
            </div>
            <input 
              type="range" 
              min="3000000" 
              max="25000000" 
              step="1000000"
              value={formData.gaji}
              onChange={(e) => setFormData({...formData, gaji: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 Jt</span>
              <span>25 Jt</span>
            </div>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full bg-gray-900 text-white py-4 rounded-full font-semibold text-lg"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-t-3xl shadow-lg overflow-hidden">
      <div className="bg-gray-900 text-white p-4 rounded-t-3xl">
        <div className="bg-white/10 text-white px-4 py-2 rounded-lg mb-4 flex items-center">
          <ChevronLeft 
            className="h-5 w-5 mr-2 cursor-pointer" 
            onClick={() => setStep(1)}
          />
          <div>
            <div className="text-sm">Langkah 2/2</div>
            <div className="font-semibold">Hitung dan Ajukan</div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Wilayah</label>
            <div className="relative">
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
                value={formData.wilayah}
                onChange={(e) => setFormData({...formData, wilayah: e.target.value})}
              >
                <option value="">Semua Lokasi</option>
                {[...new Set([
                  ...units.filter(u => u.location).map(u => u.location),
                  ...panoramaProjects.filter(p => p.location).map(p => p.location)
                ])].sort().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Tipe Unit</label>
            <div className="relative">
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
                value={formData.tipeUnit}
                onChange={(e) => setFormData({...formData, tipeUnit: e.target.value})}
              >
                <option value="">Semua Tipe Unit</option>
                {[...new Set([
                  ...units.flatMap(u => u.types?.map(t => t.name) || []),
                  ...panoramaProjects.filter(p => p.unitType).map(p => p.unitType)
                ])].sort().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Jangka Waktu</span>
              <span className="text-gray-900 font-semibold text-lg">{formData.jangkaWaktu} Tahun</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="25" 
              value={formData.jangkaWaktu}
              onChange={(e) => setFormData({...formData, jangkaWaktu: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 Tahun</span>
              <span>25 Tahun</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Down Payment</span>
              <span className="text-gray-900 font-semibold text-lg">{formData.downPayment}%</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="50" 
              step="5"
              value={formData.downPayment}
              onChange={(e) => setFormData({...formData, downPayment: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="w-80 bg-gray-100 p-6">
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-gray-600 mb-2">Lengkapi Parameter</div>
              <div className="font-semibold text-gray-800">dan klik Cari</div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => {
                // Combine units and panorama projects
                const samawaUnits = getSamawaUnits();
                const filteredPanorama = panoramaProjects.filter(p => {
                  const hasUnitType = p.unitType && p.unitType.trim() !== '';
                  const matchLocation = !formData.wilayah || (p.location && p.location.toLowerCase().includes(formData.wilayah.toLowerCase()));
                  const matchType = !formData.tipeUnit || (p.unitType && p.unitType === formData.tipeUnit);
                  return hasUnitType && matchLocation && matchType;
                });
                
                const calculateInstallment = (price, interest, years, dpPercent = formData.downPayment) => {
                  const monthlyRate = (interest || 5.5) / 100 / 12;
                  const numPayments = years * 12;
                  const principal = price * (1 - dpPercent / 100);
                  const monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                 (Math.pow(1 + monthlyRate, numPayments) - 1);
                  return new Intl.NumberFormat('id-ID').format(Math.round(monthly));
                };
                
                const unitResults = [];
                
                const panoramaResults = filteredPanorama.map(project => ({
                  id: project.id,
                  name: project.name,
                  type: project.unitType || 'Unit',
                  size: '-',
                  price: project.price || 150000000,
                  location: project.location,
                  installments: {
                    '5': calculateInstallment(project.price || 150000000, project.interest, 5),
                    '10': calculateInstallment(project.price || 150000000, project.interest, 10),
                    '15': calculateInstallment(project.price || 150000000, project.interest, 15),
                    '20': calculateInstallment(project.price || 150000000, project.interest, 20),
                    'custom': calculateInstallment(project.price || 150000000, project.interest, formData.jangkaWaktu)
                  }
                }));
                
                const allResults = [...panoramaResults];
                setSearchResults(allResults);
              }}
              className="w-full bg-gray-900 text-white py-3 rounded-full font-semibold"
            >
              Cari
            </button>
          </div>
        </div>
      </div>
      
      {searchResults !== null && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          {searchResults.length > 0 ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Unit yang Tersedia</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((unit) => (
                  <div key={unit.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                        <p className="text-sm text-gray-600">{unit.type}{unit.size !== '-' ? ` - ${unit.size}m²` : ''}</p>
                        {unit.location && <p className="text-xs text-gray-500">{unit.location}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatRupiah(unit.price)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedUnit(unit);
                        setShowModal(true);
                      }}
                      className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg text-sm"
                    >
                      Lihat Detail
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2 text-gray-600">Unit yang anda cari belum ada</h3>
              <p className="text-gray-500">Coba ubah kriteria pencarian Anda</p>
            </div>
          )}
        </div>
      )}
      
      {showModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Detail Unit {selectedUnit.name}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tipe: {selectedUnit.type}</p>
                <p className="text-sm text-gray-600">Luas: {selectedUnit.size}m²</p>
                <p className="text-lg font-semibold text-gray-900">{formatRupiah(selectedUnit.price)}</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-medium text-gray-700 mb-3">SIMULASI ANGSURAN (Bunga 5.5% Fixed)</p>
                <div className="space-y-2">
                  <div className="flex justify-between bg-blue-50 p-2 rounded">
                    <span className="text-blue-700 font-medium">{formData.jangkaWaktu} Tahun (Pilihan Anda):</span>
                    <span className="font-bold text-blue-700">Rp {selectedUnit.installments['custom']}/bulan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">5 Tahun:</span>
                    <span className="font-medium">Rp {selectedUnit.installments['5']}/bulan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">10 Tahun:</span>
                    <span className="font-medium">Rp {selectedUnit.installments['10']}/bulan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">15 Tahun:</span>
                    <span className="font-medium">Rp {selectedUnit.installments['15']}/bulan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">20 Tahun:</span>
                    <span className="font-medium">Rp {selectedUnit.installments['20']}/bulan</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">DP {formData.downPayment}%: {formatRupiah(selectedUnit.price * (formData.downPayment / 100))}</p>
                <p className="text-sm text-gray-600">Jumlah Pinjaman: {formatRupiah(selectedUnit.price * (1 - formData.downPayment / 100))}</p>
                <p className="text-xs text-gray-500 mt-1">Gaji minimum yang disarankan: {formatRupiah(parseInt(selectedUnit.installments['custom'].replace(/[^0-9]/g, '')) * 3)}</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowModal(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Trigger panorama render for this unit
                    if (selectedUnit.id && typeof window !== 'undefined') {
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('renderPanorama', { 
                          detail: { projectId: selectedUnit.id } 
                        }));
                      }, 500);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  Preview Unit
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPRSimulator;