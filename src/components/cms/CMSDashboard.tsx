import React, { useState } from 'react';
import { LogOut, Settings, FileText, Image, Users, BarChart3, ChevronDown, ChevronRight, Building, Heart, HelpCircle, Phone, MapPin, MessageSquare, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MasterHarga } from './MasterHarga';

const menuItems = [
  { id: 'content', label: 'Konten', icon: FileText },
  { id: 'master-unit', label: 'Master Unit', icon: Building },
  { id: 'master-harga', label: 'Master Harga', icon: BarChart3 },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

const contentSubmenus = [
  { id: 'htm', label: 'HTM Info', icon: HelpCircle },
  { id: 'contact', label: 'Kontak', icon: Phone },
  { id: 'location', label: 'Lokasi', icon: MapPin },
  { id: 'brochure', label: 'E-Brochure', icon: FileText },
  { id: 'register', label: 'Cara Daftar', icon: ClipboardList },
  { id: 'faq', label: 'FAQ', icon: MessageSquare },
  { id: 'benefits', label: 'Benefits', icon: Heart },
  { id: 'unit-tour', label: 'Unit & Tour', icon: Building },
];

export const CMSDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('content');
  const [activeSubmenu, setActiveSubmenu] = useState('');
  const [contentExpanded, setContentExpanded] = useState(false);
  const [units, setUnits] = useState([]);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    namaUnit: '',
    lokasi: '',
    tipeUnit: 'Studio',
    tipe: 'Apartemen',
    luas: '',
    deskripsi: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const { user, logout, authState } = useAuth();

  // Load units on component mount
  React.useEffect(() => {
    if (activeMenu === 'master-unit') {
      loadUnits();
    }
  }, [activeMenu]);

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

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingUnit 
        ? `https://dprkp.jakarta.go.id/api/jakhabitat/master-unit/${editingUnit.id}`
        : 'https://dprkp.jakarta.go.id/api/jakhabitat/master-unit';
      
      const method = editingUnit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify(unitForm),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(editingUnit ? 'Unit berhasil diupdate!' : 'Unit berhasil ditambahkan!');
        setShowUnitForm(false);
        setEditingUnit(null);
        setUnitForm({
          namaUnit: '',
          lokasi: '',
          tipeUnit: 'Studio',
          tipe: 'Apartemen',
          luas: '',
          deskripsi: ''
        });
        loadUnits();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving unit:', error);
      alert('Terjadi kesalahan saat menyimpan unit');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitForm({
      namaUnit: unit.namaUnit,
      lokasi: unit.lokasi,
      tipeUnit: unit.tipeUnit,
      tipe: unit.tipe,
      luas: unit.luas,
      deskripsi: unit.deskripsi || ''
    });
    setShowUnitForm(true);
  };

  const handleDeleteUnit = async (id) => {
    if (!confirm('Yakin ingin menghapus unit ini?')) return;
    
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/master-unit/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Unit berhasil dihapus!');
        loadUnits();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Terjadi kesalahan saat menghapus unit');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src={`${import.meta.env.BASE_URL}JAKHABITAT-LOGO-01.png`}
                alt="Jakhabitat Logo"
                className="h-8 w-auto"
              />
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                CMS Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Selamat datang, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isContent = item.id === 'content';
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveMenu(item.id);
                        if (isContent) {
                          setContentExpanded(!contentExpanded);
                        } else {
                          setContentExpanded(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md ${
                        activeMenu === item.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </div>
                      {isContent && (
                        contentExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Content Submenu */}
                    {isContent && contentExpanded && (
                      <ul className="mt-2 ml-8 space-y-1">
                        {contentSubmenus.map((submenu) => {
                          const SubIcon = submenu.icon;
                          return (
                            <li key={submenu.id}>
                              <button
                                onClick={() => setActiveSubmenu(submenu.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                                  activeSubmenu === submenu.id
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                              >
                                <SubIcon className="h-4 w-4 mr-2" />
                                {submenu.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeMenu === 'content' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {activeSubmenu ? contentSubmenus.find(s => s.id === activeSubmenu)?.label : 'Manajemen Konten'}
                </h2>
                <div className="bg-white rounded-lg shadow p-6">
                  {!activeSubmenu ? (
                    <p className="text-gray-600">
                      Pilih submenu di sidebar untuk mengelola konten spesifik.
                    </p>
                  ) : activeSubmenu === 'unit-tour' ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Upload Panorama 360°</h3>
                      <div className="space-y-6">
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
                                    Array.from(files).forEach(file => {
                                      const formData = new FormData();
                                      formData.append('panorama', file);
                                      
                                      fetch('https://dprkp.jakarta.go.id/api/jakhabitat/upload/panorama', {
                                        method: 'POST',
                                        headers: {
                                          'Authorization': `Bearer ${authState.accessToken}`,
                                        },
                                        body: formData,
                                      })
                                      .then(response => {
                                        if (!response.ok) {
                                          throw new Error(`HTTP error! status: ${response.status}`);
                                        }
                                        const contentType = response.headers.get('content-type');
                                        if (!contentType || !contentType.includes('application/json')) {
                                          throw new Error('Server tidak mengembalikan JSON response. Endpoint mungkin belum tersedia.');
                                        }
                                        return response.json();
                                      })
                                      .then(data => {
                                        console.log('Upload success:', data);
                                        alert('Panorama berhasil diupload!');
                                      })
                                      .catch(error => {
                                        console.error('Upload error:', error);
                                        if (error.message.includes('Failed to fetch')) {
                                          alert('Server tidak dapat diakses. Pastikan server backend berjalan di port 6000.');
                                        } else {
                                          alert(`Upload gagal: ${error.message}`);
                                        }
                                      });
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div className="mt-4">
                              <button
                                type="button"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                onClick={() => document.getElementById('panorama-upload')?.click()}
                              >
                                Pilih File
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-md font-medium mb-3">Panorama yang sudah diupload:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Photos will be loaded from database */}
                            <div className="text-gray-500 text-sm col-span-full text-center py-4">
                              Memuat foto dari database...
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-4">
                        Kelola konten untuk bagian {contentSubmenus.find(s => s.id === activeSubmenu)?.label}.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4}></textarea>
                        </div>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                          Simpan Perubahan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'master-unit' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Master Unit</h2>
                  <button
                    onClick={() => setShowUnitForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Tambah Unit
                  </button>
                </div>
                
                {showUnitForm && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingUnit ? 'Edit Unit' : 'Tambah Unit Baru'}
                    </h3>
                    <form onSubmit={handleUnitSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Unit</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="Tower Kanaya"
                            value={unitForm.namaUnit}
                            onChange={(e) => setUnitForm({...unitForm, namaUnit: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="Jakarta Barat"
                            value={unitForm.lokasi}
                            onChange={(e) => setUnitForm({...unitForm, lokasi: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Unit</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={unitForm.tipeUnit}
                            onChange={(e) => setUnitForm({...unitForm, tipeUnit: e.target.value})}
                          >
                            <option>Studio</option>
                            <option>1 BR</option>
                            <option>2 BR</option>
                            <option>3 BR</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={unitForm.tipe}
                            onChange={(e) => setUnitForm({...unitForm, tipe: e.target.value})}
                          >
                            <option>Apartemen</option>
                            <option>Rumah</option>
                            <option>Ruko</option>
                            <option>Kantor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Luas (m²)</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="45"
                            value={unitForm.luas}
                            onChange={(e) => setUnitForm({...unitForm, luas: e.target.value})}
                            required
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                          <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            rows={3} 
                            placeholder="Deskripsi unit..."
                            value={unitForm.deskripsi}
                            onChange={(e) => setUnitForm({...unitForm, deskripsi: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button 
                          type="submit"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? 'Menyimpan...' : (editingUnit ? 'Update' : 'Simpan')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUnitForm(false);
                            setEditingUnit(null);
                            setUnitForm({
                              namaUnit: '',
                              lokasi: '',
                              tipeUnit: 'Studio',
                              tipe: 'Apartemen',
                              luas: '',
                              deskripsi: ''
                            });
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Unit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Unit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Luas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {units.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              Belum ada data unit
                            </td>
                          </tr>
                        ) : (
                          units.map((unit) => (
                            <tr key={unit.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.namaUnit}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.lokasi}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.tipeUnit}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.tipe}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.luas} m²</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleEditUnit(unit)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteUnit(unit.id)}
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
              </div>
            )}

            {activeMenu === 'master-harga' && <MasterHarga />}

            {activeMenu === 'media' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Media</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">
                    Upload dan kelola gambar, video, dan file media lainnya.
                  </p>
                </div>
              </div>
            )}

            {activeMenu === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pengguna</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Informasi Pengguna Aktif</h3>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <p><strong>ID:</strong> {user?.id}</p>
                      <p><strong>Username:</strong> {user?.username}</p>
                      <p><strong>Nama:</strong> {user?.name || 'Tidak tersedia'}</p>
                      <p><strong>Email:</strong> {user?.email || 'Tidak tersedia'}</p>
                      <p><strong>Role:</strong> {user?.role || 'Tidak tersedia'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'analytics' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analitik</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">
                    Lihat statistik pengunjung dan performa website.
                  </p>
                </div>
              </div>
            )}

            {activeMenu === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">
                    Konfigurasi pengaturan sistem dan website.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};