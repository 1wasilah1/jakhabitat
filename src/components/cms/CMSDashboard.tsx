import { useState } from 'react';
import { LogOut, Settings, FileText, Image, Users, BarChart3, ChevronDown, ChevronRight, Building, Heart, HelpCircle, Phone, MapPin, MessageSquare, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const { user, logout } = useAuth();

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Unit</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Tower Kanaya" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Jakarta Barat" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Unit</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>Studio</option>
                          <option>1 BR</option>
                          <option>2 BR</option>
                          <option>3 BR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>Apartemen</option>
                          <option>Rumah</option>
                          <option>Ruko</option>
                          <option>Kantor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Luas (m²)</label>
                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="45" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                        <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} placeholder="Deskripsi unit..."></textarea>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        {editingUnit ? 'Update' : 'Simpan'}
                      </button>
                      <button
                        onClick={() => {
                          setShowUnitForm(false);
                          setEditingUnit(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
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
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tower Kanaya</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jakarta Barat</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 BR</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Apartemen</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45 m²</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Hapus</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tower Melati</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jakarta Pusat</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 BR</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Apartemen</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">36 m²</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Hapus</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'master-harga' && (
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Unit</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value="kanaya">Tower Kanaya - 2BR (45 m²) - Jakarta Barat</option>
                          <option value="melati">Tower Melati - 1BR (36 m²) - Jakarta Pusat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Luas Unit</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" value="45 m²" disabled />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual <span className="text-red-500">*</span></label>
                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="500000000" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Harga Sewa/Bulan</label>
                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="5000000" />
                      </div>
                      
                      {/* Skema Cicilan */}
                      <div className="md:col-span-3">
                        <h4 className="text-md font-semibold text-gray-900 mb-3 border-t pt-4">Skema Cicilan Multi Tenor</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">DP Minimum (%)</label>
                              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="20" min="0" max="100" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Bunga Tahunan (%)</label>
                              <input type="number" step="0.1" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="12" />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-800">Cicilan per Tenor:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">5 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="4504186" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">7 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="3373481" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">10 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="2531572" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">11 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="2354456" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">15 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="1875000" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">20 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="1575182" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">25 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="1350000" />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">30 Tahun</label>
                                <input type="number" className="w-full px-2 py-1 text-sm border border-gray-300 rounded" placeholder="1200000" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diskon (%)</label>
                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="10" min="0" max="100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Berakhir</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                        <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} placeholder="Promo spesial..."></textarea>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                        {editingPrice ? 'Update' : 'Simpan'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPriceForm(false);
                          setEditingPrice(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
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
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div>Tower Kanaya - 2BR</div>
                            <div className="text-xs text-gray-500">36,00 m²</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp 416.583.000</td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            <div>5 th: Rp 7.861.435</div>
                            <div>7 th: Rp 5.887.946</div>
                            <div>10 th: Rp 4.418.509</div>
                            <div>11 th: Rp 4.109.378</div>
                            <div>20 th: Rp 2.749.263</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Aktif
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Hapus</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div>Tower Melati - Studio</div>
                            <div className="text-xs text-gray-500">23,40 m²</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp 238.680.000</td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            <div>5 th: Rp 4.504.186</div>
                            <div>7 th: Rp 3.373.481</div>
                            <div>10 th: Rp 2.531.572</div>
                            <div>11 th: Rp 2.354.456</div>
                            <div>20 th: Rp 1.575.182</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Promo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Hapus</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div>Tower Mawar - 1BR</div>
                            <div className="text-xs text-gray-500">24,50 m²</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp 249.900.000</td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            <div>5 th: Rp 4.715.921</div>
                            <div>7 th: Rp 3.532.064</div>
                            <div>10 th: Rp 2.650.577</div>
                            <div>11 th: Rp 2.465.136</div>
                            <div>20 th: Rp 1.649.229</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Aktif
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Hapus</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

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