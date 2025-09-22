import React, { useState } from 'react';
import { LogOut, Settings, FileText, Image, Users, BarChart3, ChevronDown, ChevronRight, Building, Heart, HelpCircle, Phone, MapPin, MessageSquare, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MasterHarga } from './MasterHarga';
import UnitTourManager from './UnitTourManager';
import MediaManager from './MediaManager';

const menuItems = [
  { id: 'content', label: 'Konten', icon: FileText },
  { id: 'slideshow-cards', label: 'Slideshow Cards', icon: Image },
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
  const [slideshowCards, setSlideshowCards] = useState([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    order: 1
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showHotspotEditor, setShowHotspotEditor] = useState(false);
  const [hotspots, setHotspots] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [pendingHotspot, setPendingHotspot] = useState(null);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const { user, logout, authState } = useAuth();

  // Load data on component mount
  React.useEffect(() => {
    if (activeMenu === 'master-unit') {
      loadUnits();
    } else if (activeMenu === 'slideshow-cards') {
      loadSlideshowCards();
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      const result = text ? JSON.parse(text) : { success: false, error: 'Empty response' };
      
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
    
    // Handle deskripsi properly
    let deskripsi = '';
    if (unit.deskripsi) {
      if (typeof unit.deskripsi === 'string') {
        deskripsi = unit.deskripsi;
      } else if (unit.deskripsi.toString && typeof unit.deskripsi.toString === 'function') {
        deskripsi = unit.deskripsi.toString();
      } else {
        deskripsi = JSON.stringify(unit.deskripsi);
      }
    }
    
    setUnitForm({
      namaUnit: unit.namaUnit || '',
      lokasi: unit.lokasi || '',
      tipeUnit: unit.tipeUnit || 'Studio',
      tipe: unit.tipe || 'Apartemen',
      luas: unit.luas || '',
      deskripsi: deskripsi
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

  const loadSlideshowCards = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-cards', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setSlideshowCards(result.data);
      }
    } catch (error) {
      console.error('Error loading slideshow cards:', error);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCardForm({...cardForm, imageUrl: `https://dprkp.jakarta.go.id/api/jakhabitat/image/${result.filename}`});
        alert('Foto berhasil diupload!');
      } else {
        alert('Error upload: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Terjadi kesalahan saat upload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Upload file first if selected
      if (selectedFile) {
        await handleFileUpload(selectedFile);
      }
      
      const url = editingCard 
        ? `https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-cards/${editingCard.id}`
        : 'https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-cards';
      
      const method = editingCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify(cardForm),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(editingCard ? 'Card berhasil diupdate!' : 'Card berhasil ditambahkan!');
        setShowCardForm(false);
        setEditingCard(null);
        setCardForm({ title: '', description: '', imageUrl: '', order: 1 });
        setSelectedFile(null);
        loadSlideshowCards();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Terjadi kesalahan saat menyimpan card');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setCardForm({
      title: card.title || '',
      description: card.description || '',
      imageUrl: card.imageUrl || '',
      order: card.order || 1
    });
    setShowCardForm(true);
  };

  const handleDeleteCard = async (id) => {
    if (!confirm('Yakin ingin menghapus card ini?')) return;
    
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-cards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Card berhasil dihapus!');
        loadSlideshowCards();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Terjadi kesalahan saat menghapus card');
    }
  };

  const loadHotspots = async (cardId) => {
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-hotspots/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setHotspots(result.data || []);
      }
    } catch (error) {
      console.error('Error loading hotspots:', error);
    }
  };

  const handleImageClick = (e, card) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const type = prompt('Pilih tipe hotspot:\n1. Tulisan (ketik: text)\n2. Icon (ketik: icon)\n3. Link ke gambar lain (ketik: link)');
    
    if (type === 'text') {
      const text = prompt('Masukkan tulisan:');
      if (text) {
        const newHotspot = {
          cardId: card.id,
          x: Math.round(x),
          y: Math.round(y),
          text,
          type: 'text'
        };
        saveHotspot(newHotspot);
      }
    } else if (type === 'icon') {
      setPendingHotspot({
        cardId: card.id,
        x: Math.round(x),
        y: Math.round(y),
        type: 'icon'
      });
      setShowIconSelector(true);
    } else if (type === 'link') {
      setPendingHotspot({
        cardId: card.id,
        x: Math.round(x),
        y: Math.round(y),
        type: 'link'
      });
      setShowImageSelector(true);
    }
  };

  const saveHotspot = async (hotspot) => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-hotspots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify(hotspot),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Hotspot berhasil ditambahkan!');
        loadHotspots(hotspot.cardId);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving hotspot:', error);
      alert('Terjadi kesalahan saat menyimpan hotspot');
    }
  };

  const deleteHotspot = async (id) => {
    if (!confirm('Yakin ingin menghapus hotspot ini?')) return;
    
    try {
      const response = await fetch(`https://dprkp.jakarta.go.id/api/jakhabitat/slideshow-hotspots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Hotspot berhasil dihapus!');
        loadHotspots(selectedCard.id);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting hotspot:', error);
      alert('Terjadi kesalahan saat menghapus hotspot');
    }
  };

  const openHotspotEditor = (card) => {
    setSelectedCard(card);
    setShowHotspotEditor(true);
    loadHotspots(card.id);
    loadAvailableIcons();
  };

  const loadAvailableIcons = async () => {
    try {
      const response = await fetch('https://dprkp.jakarta.go.id/api/jakhabitat/icons', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setAvailableIcons(result.data || []);
      }
    } catch (error) {
      console.error('Error loading icons:', error);
    }
  };

  const selectIcon = (iconFilename) => {
    if (!pendingHotspot) return;
    
    const newHotspot = {
      ...pendingHotspot,
      iconUrl: `https://dprkp.jakarta.go.id/api/jakhabitat/image/${iconFilename}`,
      label: iconFilename
    };
    
    saveHotspot(newHotspot);
    setShowIconSelector(false);
    setPendingHotspot(null);
  };

  const selectImage = (cardId) => {
    if (!pendingHotspot) return;
    
    const newHotspot = {
      ...pendingHotspot,
      targetCardId: cardId,
      label: `Link ke card ${cardId}`
    };
    
    saveHotspot(newHotspot);
    setShowImageSelector(false);
    setPendingHotspot(null);
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
                    <UnitTourManager authState={authState} units={units} />
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
                            <option>Rusun</option>
                            <option>Rumah</option>
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

            {activeMenu === 'slideshow-cards' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Slideshow Cards</h2>
                  <button
                    onClick={() => setShowCardForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Tambah Card
                  </button>
                </div>
                
                {showCardForm && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingCard ? 'Edit Card' : 'Tambah Card Baru'}
                    </h3>
                    <form onSubmit={handleCardSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="Judul card"
                            value={cardForm.title}
                            onChange={(e) => setCardForm({...cardForm, title: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            placeholder="1"
                            value={cardForm.order}
                            onChange={(e) => setCardForm({...cardForm, order: parseInt(e.target.value)})}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gambar</label>
                          <div className="space-y-3">
                            <div>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                              <p className="text-xs text-gray-500 mt-1">Upload foto baru (JPG, PNG, max 5MB)</p>
                            </div>
                            <div className="text-center text-gray-500">atau</div>
                            <div>
                              <input 
                                type="url" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                placeholder="https://example.com/image.jpg"
                                value={cardForm.imageUrl}
                                onChange={(e) => setCardForm({...cardForm, imageUrl: e.target.value})}
                              />
                              <p className="text-xs text-gray-500 mt-1">Masukkan URL gambar</p>
                            </div>
                            {cardForm.imageUrl && (
                              <div className="mt-2">
                                <img src={cardForm.imageUrl} alt="Preview" className="h-32 w-48 object-cover rounded border" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                          <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                            rows={3} 
                            placeholder="Deskripsi card..."
                            value={cardForm.description}
                            onChange={(e) => setCardForm({...cardForm, description: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button 
                          type="submit"
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                          disabled={loading || uploading}
                        >
                          {uploading ? 'Mengupload...' : loading ? 'Menyimpan...' : (editingCard ? 'Update' : 'Simpan')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCardForm(false);
                            setEditingCard(null);
                            setCardForm({ title: '', description: '', imageUrl: '', order: 1 });
                            setSelectedFile(null);
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {slideshowCards.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                              Belum ada data card
                            </td>
                          </tr>
                        ) : (
                          slideshowCards.map((card) => (
                            <tr key={card.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.order}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.title}</td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{card.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <img src={card.imageUrl} alt={card.title} className="h-12 w-20 object-cover rounded" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleEditCard(card)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => openHotspotEditor(card)}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Hotspot
                                </button>
                                <button 
                                  onClick={() => handleDeleteCard(card.id)}
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

            {/* Hotspot Editor Modal */}
            {showHotspotEditor && selectedCard && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Editor Hotspot - {selectedCard.title}</h3>
                      <button
                        onClick={() => setShowHotspotEditor(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Image Editor */}
                      <div>
                        <h4 className="font-medium mb-2">Klik pada gambar untuk menambah hotspot:</h4>
                        <div className="relative border rounded-lg overflow-hidden">
                          <img 
                            src={selectedCard.imageUrl} 
                            alt={selectedCard.title}
                            className="w-full h-auto cursor-crosshair"
                            onClick={(e) => handleImageClick(e, selectedCard)}
                          />
                          {/* Render existing hotspots */}
                          {hotspots.map((hotspot, index) => (
                            <div
                              key={index}
                              className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white text-xs font-bold"
                              style={{ left: `${hotspot.x}px`, top: `${hotspot.y}px` }}
                              title={hotspot.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Hapus hotspot "${hotspot.label}"?`)) {
                                  deleteHotspot(hotspot.id);
                                }
                              }}
                            >
                              {index + 1}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Klik pada gambar untuk menambah hotspot baru. Klik pada hotspot yang ada untuk menghapus.
                        </p>
                      </div>
                      
                      {/* Hotspot List */}
                      <div>
                        <h4 className="font-medium mb-2">Daftar Hotspot ({hotspots.length}):</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {hotspots.length === 0 ? (
                            <p className="text-gray-500 text-sm">Belum ada hotspot</p>
                          ) : (
                            hotspots.map((hotspot, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{hotspot.label}</div>
                                    <div className="text-xs text-gray-500">Posisi: ({hotspot.x}, {hotspot.y})</div>
                                    <div className="text-xs text-gray-500">Link: {hotspot.href}</div>
                                    <div className="text-xs text-gray-500">Icon: {hotspot.icon}</div>
                                  </div>
                                  <button
                                    onClick={() => deleteHotspot(hotspot.id)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setShowHotspotEditor(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Icon Selector Modal */}
            {showIconSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Pilih Icon</h3>
                      <button
                        onClick={() => {
                          setShowIconSelector(false);
                          setPendingHotspot(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {availableIcons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Belum ada icon yang tersedia. Upload icon terlebih dahulu di menu Media.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                        {availableIcons.map((icon, index) => (
                          <div 
                            key={index}
                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 border-2 border-transparent hover:border-blue-500 transition-all"
                            onClick={() => selectIcon(icon.filename)}
                          >
                            <img
                              src={`https://dprkp.jakarta.go.id/api/jakhabitat/image/${icon.filename}`}
                              alt={icon.originalName}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          setShowIconSelector(false);
                          setPendingHotspot(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Image Selector Modal */}
            {showImageSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Pilih Gambar Tujuan</h3>
                      <button
                        onClick={() => {
                          setShowImageSelector(false);
                          setPendingHotspot(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {slideshowCards.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Belum ada card slideshow yang tersedia.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {slideshowCards.filter(card => card.id !== selectedCard?.id).map((card) => (
                          <div 
                            key={card.id}
                            className="cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden transition-all"
                            onClick={() => selectImage(card.id)}
                          >
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2">
                              <div className="font-medium text-sm">{card.title}</div>
                              <div className="text-xs text-gray-500">{card.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          setShowImageSelector(false);
                          setPendingHotspot(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'master-harga' && <MasterHarga />}

            {activeMenu === 'media' && (
              <MediaManager authState={authState} />
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