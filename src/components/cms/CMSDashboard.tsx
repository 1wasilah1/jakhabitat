import { useState } from 'react';
import { LogOut, Settings, FileText, Image, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { id: 'content', label: 'Konten', icon: FileText },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'users', label: 'Pengguna', icon: Users },
  { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export const CMSDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('content');
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
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        activeMenu === item.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Konten</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <p className="text-gray-600">
                    Kelola konten website Jakhabitat di sini. Fitur ini akan dikembangkan lebih lanjut.
                  </p>
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