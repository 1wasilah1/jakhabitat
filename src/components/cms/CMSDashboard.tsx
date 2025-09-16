import { useState } from 'react';
import { LogOut, Settings, FileText, Image, Users, BarChart3, ChevronDown, ChevronRight, Building, Heart, HelpCircle, Phone, MapPin, MessageSquare, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { id: 'content', label: 'Konten', icon: FileText },
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
                                      
                                      fetch('http://localhost:6000/api/upload/panorama', {
                                        method: 'POST',
                                        body: formData,
                                      })
                                      .then(response => response.json())
                                      .then(data => {
                                        console.log('Upload success:', data);
                                        alert('Panorama berhasil diupload!');
                                      })
                                      .catch(error => {
                                        console.error('Upload error:', error);
                                        alert('Upload gagal!');
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