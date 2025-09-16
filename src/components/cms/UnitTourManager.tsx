import React, { useState, useEffect } from 'react';
import { Image, Eye, Trash2 } from 'lucide-react';

const UnitTourManager = ({ authState, units }) => {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [panoramas, setPanoramas] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPanorama, setSelectedPanorama] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allUnits, setAllUnits] = useState([]);

  useEffect(() => {
    loadPanoramas();
    loadUnits();
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
        setAllUnits(result.data);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const loadPanoramas = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/panoramas', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setPanoramas(result.photos);
      }
    } catch (error) {
      console.error('Error loading panoramas:', error);
    }
  };

  const handleUpload = async (files) => {
    if (!selectedUnit) {
      alert('Pilih unit terlebih dahulu');
      return;
    }
    if (!selectedCategory) {
      alert('Pilih kategori ruangan terlebih dahulu');
      return;
    }

    setLoading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('panorama', file);
        formData.append('unitId', selectedUnit);
        formData.append('category', selectedCategory);
        
        const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/upload/panorama', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          console.log('Upload success:', result);
        }
      }
      
      alert('Panorama berhasil diupload!');
      loadPanoramas();
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus panorama ini?')) return;
    
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/panoramas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Panorama berhasil dihapus!');
        loadPanoramas();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus panorama');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Upload Panorama 360°</h3>
      
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Unit</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                required
              >
                <option value="">Pilih Unit</option>
                {allUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.namaUnit} - {unit.tipeUnit} - {unit.tipe} ({unit.luas} m²) - {unit.lokasi}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Ruangan</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="lorong">Lorong</option>
                <option value="kamar_1">Kamar 1</option>
                <option value="kamar_2">Kamar 2</option>
                <option value="kamar_3">Kamar 3</option>
                <option value="kamar_4">Kamar 4</option>
                <option value="kamar_5">Kamar 5</option>
                <option value="kamar_6">Kamar 6</option>
                <option value="kamar_7">Kamar 7</option>
                <option value="kamar_8">Kamar 8</option>
                <option value="kamar_mandi">Kamar Mandi</option>
                <option value="balkon">Balkon</option>
                <option value="dapur">Dapur</option>
                <option value="ruang_tamu">Ruang Tamu</option>
                <option value="lantai_1">Lantai 1</option>
                <option value="lantai_2">Lantai 2</option>
                <option value="lantai_3">Lantai 3</option>
                <option value="lantai_4">Lantai 4</option>
                <option value="lantai_5">Lantai 5</option>
                <option value="lantai_6">Lantai 6</option>
                <option value="lantai_7">Lantai 7</option>
                <option value="kamar_anak">Kamar Anak</option>
                <option value="playground">Playground</option>
                <option value="lobby">Lobby</option>
                <option value="lift">Lift</option>
              </select>
              {selectedUnit && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  {(() => {
                    const unit = allUnits.find(u => u.id == selectedUnit);
                    return unit ? (
                      <div className="text-sm">
                        <div className="font-medium text-blue-900">{String(unit.namaUnit || '')}</div>
                        <div className="text-blue-700 mt-1">
                          <span className="inline-block mr-4">Tipe: {String(unit.tipeUnit || '')}</span>
                          <span className="inline-block mr-4">Kategori: {String(unit.tipe || '')}</span>
                          <span className="inline-block mr-4">Luas: {String(unit.luas || '')} m²</span>
                        </div>
                        <div className="text-blue-600 mt-1">Lokasi: {String(unit.lokasi || '')}</div>
                        {unit.deskripsi && <div className="text-blue-600 mt-1 text-xs">{String(unit.deskripsi)}</div>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="panorama-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload gambar panorama 360°
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PNG, JPG hingga 10MB
                  </span>
                </label>
                <input
                  id="panorama-upload"
                  name="panorama-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      handleUpload(Array.from(files));
                    }
                  }}
                />
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  onClick={() => document.getElementById('panorama-upload')?.click()}
                  disabled={!selectedUnit || !selectedCategory || loading}
                >
                  {loading ? 'Uploading...' : 'Pilih File'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Records Table */}
        <div>
          <h4 className="text-md font-medium mb-3">Panorama yang sudah diupload:</h4>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit & Detail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {panoramas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Belum ada panorama yang diupload
                    </td>
                  </tr>
                ) : (
                  panoramas.map((panorama) => (
                    <tr key={panorama.id}>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{String(panorama.unitName || 'N/A')}</div>
                        <div className="text-xs text-gray-500">
                          {panorama.tipeUnit ? `${String(panorama.tipeUnit)} | ` : ''}
                          {panorama.luas ? `${String(panorama.luas)} m² | ` : ''}
                          {String(panorama.lokasi || 'Lokasi tidak tersedia')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {String(panorama.roomCategory || panorama.category || 'N/A').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {String(panorama.originalName || '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {panorama.fileSize ? `${Math.round(Number(panorama.fileSize) / 1024)} KB` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {panorama.createdAt ? new Date(panorama.createdAt).toLocaleDateString('id-ID') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedPanorama(panorama);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="h-4 w-4 inline" /> Detail
                        </button>
                        <button 
                          onClick={() => handleDelete(panorama.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPanorama && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Panorama</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Unit:</strong> {String(selectedPanorama.unitName || 'N/A')}
                </div>
                <div>
                  <strong>Filename:</strong> {String(selectedPanorama.originalName || '')}
                </div>
                <div>
                  <strong>Size:</strong> {selectedPanorama.fileSize ? `${Math.round(Number(selectedPanorama.fileSize) / 1024)} KB` : 'N/A'}
                </div>
                <div>
                  <strong>Upload Date:</strong> {selectedPanorama.createdAt ? new Date(selectedPanorama.createdAt).toLocaleString('id-ID') : 'N/A'}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Preview:</h4>
                <img 
                  src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${selectedPanorama.filename}`}
                  alt={selectedPanorama.originalName}
                  className="w-full h-64 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                  }}
                />
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

export default UnitTourManager;