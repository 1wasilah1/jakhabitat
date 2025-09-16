import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MasterHarga = () => {
  const [units, setUnits] = useState([]);
  const [hargaList, setHargaList] = useState([]);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCicilan, setManualCicilan] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHarga, setSelectedHarga] = useState(null);
  const [priceForm, setPriceForm] = useState({
    unitId: '',
    hargaJual: '',
    hargaSewa: '',
    dpMinimum: 20,
    bungaTahunan: 12,
    cicilan5th: '',
    cicilan7th: '',
    cicilan10th: '',
    cicilan11th: '',
    cicilan15th: '',
    cicilan20th: '',
    cicilan25th: '',
    cicilan30th: '',
    diskon: 0,
    tanggalMulai: '',
    tanggalBerakhir: '',
    keterangan: '',
    status: 'Aktif'
  });
  
  const { authState } = useAuth();

  // Calculate cicilan automatically based on harga jual, DP, and bunga
  const calculateCicilan = () => {
    const hargaJual = parseFloat(priceForm.hargaJual) || 0;
    const bungaTahunan = parseFloat(priceForm.bungaTahunan) || 5;
    
    if (hargaJual <= 0) return;
    
    const P = hargaJual; // DP = 0, so P = harga unit
    const i = bungaTahunan / 100 / 12; // Monthly interest rate
    
    const tenors = [5, 7, 10, 11, 15, 20, 25, 30];
    const cicilanFields = ['cicilan5th', 'cicilan7th', 'cicilan10th', 'cicilan11th', 'cicilan15th', 'cicilan20th', 'cicilan25th', 'cicilan30th'];
    
    const newCicilan = {};
    
    tenors.forEach((tahun, index) => {
      const n = tahun * 12; // Total months
      // Formula: Angsuran = (P × i) / (1 - (1 + i)^(-n))
      const numerator = P * i;
      const denominator = 1 - Math.pow(1 + i, -n);
      const cicilan = numerator / denominator;
      newCicilan[cicilanFields[index]] = Math.round(cicilan);
    });
    
    setPriceForm(prev => ({ ...prev, ...newCicilan }));
  };

  useEffect(() => {
    loadUnits();
    loadHarga();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/master-unit', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setUnits(result.data);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const loadHarga = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/master-harga', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setHargaList(result.data);
      }
    } catch (error) {
      console.error('Error loading harga:', error);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingPrice 
        ? `https://dprkp.jakarta.go.id/api/jakhabitat/master-harga/${editingPrice.id}`
        : 'https://dprkp.jakarta.go.id/api/jakhabitat/master-harga';
      
      const method = editingPrice ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify(priceForm),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(editingPrice ? 'Harga berhasil diupdate!' : 'Harga berhasil ditambahkan!');
        setShowPriceForm(false);
        setEditingPrice(null);
        setPriceForm({
          unitId: '',
          hargaJual: '',
          hargaSewa: '',
          dpMinimum: 20,
          bungaTahunan: 12,
          cicilan5th: '',
          cicilan7th: '',
          cicilan10th: '',
          cicilan11th: '',
          cicilan15th: '',
          cicilan20th: '',
          cicilan25th: '',
          cicilan30th: '',
          diskon: 0,
          tanggalMulai: '',
          tanggalBerakhir: '',
          keterangan: '',
          status: 'Aktif'
        });
        loadHarga();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving harga:', error);
      alert('Terjadi kesalahan saat menyimpan harga');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (harga) => {
    setEditingPrice(harga);
    setPriceForm({
      unitId: harga.unitId,
      hargaJual: harga.hargaJual,
      hargaSewa: harga.hargaSewa || '',
      dpMinimum: harga.dpMinimum,
      bungaTahunan: harga.bungaTahunan,
      cicilan5th: harga.cicilan5th || '',
      cicilan7th: harga.cicilan7th || '',
      cicilan10th: harga.cicilan10th || '',
      cicilan11th: harga.cicilan11th || '',
      cicilan15th: harga.cicilan15th || '',
      cicilan20th: harga.cicilan20th || '',
      cicilan25th: harga.cicilan25th || '',
      cicilan30th: harga.cicilan30th || '',
      diskon: harga.diskon || 0,
      tanggalMulai: harga.tanggalMulai || '',
      tanggalBerakhir: harga.tanggalBerakhir || '',
      keterangan: harga.keterangan || '',
      status: harga.status
    });
    setShowPriceForm(true);
  };

  const handleDeletePrice = async (id) => {
    if (!confirm('Yakin ingin menghapus harga ini?')) return;
    
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/master-harga/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Harga berhasil dihapus!');
        loadHarga();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting harga:', error);
      alert('Terjadi kesalahan saat menghapus harga');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Master Harga</h2>
        <button
          onClick={() => setShowPriceForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Set Harga
        </button>
      </div>
      
      {showPriceForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingPrice ? 'Edit Harga' : 'Set Harga Unit'}
          </h3>
          <form onSubmit={handlePriceSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Unit</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={priceForm.unitId}
                  onChange={(e) => setPriceForm({...priceForm, unitId: e.target.value})}
                  required
                >
                  <option value="">Pilih Unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.namaUnit} - {unit.tipeUnit} ({unit.luas} m²) - {unit.lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Luas Unit</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" 
                  value={units.find(u => u.id == priceForm.unitId)?.luas ? `${units.find(u => u.id == priceForm.unitId).luas} m²` : ''} 
                  disabled 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  placeholder="500000000"
                  value={priceForm.hargaJual}
                  onChange={(e) => setPriceForm({...priceForm, hargaJual: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Harga Sewa/Bulan</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  placeholder="5000000"
                  value={priceForm.hargaSewa}
                  onChange={(e) => setPriceForm({...priceForm, hargaSewa: e.target.value})}
                />
              </div>
              
              {/* Skema Cicilan */}
              <div className="md:col-span-3">
                <h4 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">Skema Cicilan Multi Tenor</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DP Minimum (%)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" 
                        placeholder="0" 
                        value="0"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">DP = Rp 0 (sesuai rumus)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bunga Tahunan (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                        placeholder="5"
                        value={priceForm.bungaTahunan}
                        onChange={(e) => setPriceForm({...priceForm, bungaTahunan: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-800">Cicilan per Tenor:</h5>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={manualCicilan}
                          onChange={(e) => {
                            setManualCicilan(e.target.checked);
                            if (!e.target.checked) {
                              setTimeout(() => calculateCicilan(), 100);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Input Manual</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">5 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="4504186"
                          value={priceForm.cicilan5th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan5th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">7 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="3373481"
                          value={priceForm.cicilan7th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan7th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">10 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="2531572"
                          value={priceForm.cicilan10th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan10th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">11 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="2354456"
                          value={priceForm.cicilan11th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan11th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">15 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="1875000"
                          value={priceForm.cicilan15th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan15th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">20 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="1575182"
                          value={priceForm.cicilan20th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan20th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">25 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="1350000"
                          value={priceForm.cicilan25th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan25th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">30 Tahun</label>
                        <input 
                          type="number" 
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${!manualCicilan ? 'bg-gray-100' : ''}`}
                          placeholder="1200000"
                          value={priceForm.cicilan30th}
                          onChange={(e) => setPriceForm({...priceForm, cicilan30th: e.target.value})}
                          disabled={!manualCicilan}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diskon (%)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  placeholder="10" 
                  min="0" 
                  max="100"
                  value={priceForm.diskon}
                  onChange={(e) => setPriceForm({...priceForm, diskon: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={priceForm.tanggalMulai}
                  onChange={(e) => setPriceForm({...priceForm, tanggalMulai: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Berakhir</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={priceForm.tanggalBerakhir}
                  onChange={(e) => setPriceForm({...priceForm, tanggalBerakhir: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                  rows={2} 
                  placeholder="Promo spesial..."
                  value={priceForm.keterangan}
                  onChange={(e) => setPriceForm({...priceForm, keterangan: e.target.value})}
                ></textarea>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : (editingPrice ? 'Update' : 'Simpan')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPriceForm(false);
                  setEditingPrice(null);
                  setPriceForm({
                    unitId: '',
                    hargaJual: '',
                    hargaSewa: '',
                    dpMinimum: 20,
                    bungaTahunan: 12,
                    cicilan5th: '',
                    cicilan7th: '',
                    cicilan10th: '',
                    cicilan11th: '',
                    cicilan15th: '',
                    cicilan20th: '',
                    cicilan25th: '',
                    cicilan30th: '',
                    diskon: 0,
                    tanggalMulai: '',
                    tanggalBerakhir: '',
                    keterangan: '',
                    status: 'Aktif'
                  });
                  setManualCicilan(false);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit & Luas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skema Cicilan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hargaList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Belum ada data harga
                  </td>
                </tr>
              ) : (
                hargaList.map((harga) => (
                  <tr key={harga.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>{harga.namaUnit} - {harga.tipeUnit}</div>
                      <div className="text-xs text-gray-500">{harga.luas} m²</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {parseInt(harga.hargaJual).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {harga.cicilan5th && <div>5 th: Rp {parseInt(harga.cicilan5th).toLocaleString('id-ID')}</div>}
                      {harga.cicilan7th && <div>7 th: Rp {parseInt(harga.cicilan7th).toLocaleString('id-ID')}</div>}
                      {harga.cicilan10th && <div>10 th: Rp {parseInt(harga.cicilan10th).toLocaleString('id-ID')}</div>}
                      {harga.cicilan11th && <div>11 th: Rp {parseInt(harga.cicilan11th).toLocaleString('id-ID')}</div>}
                      {harga.cicilan20th && <div>20 th: Rp {parseInt(harga.cicilan20th).toLocaleString('id-ID')}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        harga.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {harga.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedHarga(harga);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => handleEditPrice(harga)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePrice(harga.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && selectedHarga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Simulasi Cicilan</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedHarga.namaUnit} - {selectedHarga.tipeUnit}</h4>
                <p className="text-sm text-gray-600">Luas: {selectedHarga.luas} m² | Lokasi: {selectedHarga.lokasi}</p>
                <p className="text-lg font-semibold mt-2">Harga: Rp {parseInt(selectedHarga.hargaJual).toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-600">Bunga: {selectedHarga.bungaTahunan}% per tahun</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { tenor: 5, cicilan: selectedHarga.cicilan5th },
                  { tenor: 7, cicilan: selectedHarga.cicilan7th },
                  { tenor: 10, cicilan: selectedHarga.cicilan10th },
                  { tenor: 11, cicilan: selectedHarga.cicilan11th },
                  { tenor: 15, cicilan: selectedHarga.cicilan15th },
                  { tenor: 20, cicilan: selectedHarga.cicilan20th },
                  { tenor: 25, cicilan: selectedHarga.cicilan25th },
                  { tenor: 30, cicilan: selectedHarga.cicilan30th }
                ].filter(item => item.cicilan > 0).map(item => {
                  const totalBayar = item.cicilan * item.tenor * 12;
                  const totalBunga = totalBayar - selectedHarga.hargaJual;
                  
                  return (
                    <div key={item.tenor} className="border rounded-lg p-3">
                      <h5 className="font-medium text-center mb-2">{item.tenor} Tahun</h5>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Cicilan/bulan:</span>
                          <span className="font-medium">Rp {parseInt(item.cicilan).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total bayar:</span>
                          <span>Rp {totalBayar.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total bunga:</span>
                          <span className="text-red-600">Rp {totalBunga.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};