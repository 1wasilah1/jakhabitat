import React, { useEffect, useRef, useState } from 'react';
import whiteLogo from '/JAKHABITAT-LOGO putih-01.png';
import LayerViewer from '../components/LayerViewer';
import ProgramHTMSection from '../components/ProgramHTMSection';
import SyaratSection from '../components/SyaratSection';
import DownloadSection from '../components/DownloadSection';

type PieceConfig = {
  clipPath: string;
  initialTransform: string;
  finalTransform: string;
  delay: string;
};

const HERO_PIECES: PieceConfig[] = [
  {
    clipPath: 'inset(0% 66.666% 66.666% 0%)',
    initialTransform: 'translate3d(-140%, -140%, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0s',
  },
  {
    clipPath: 'inset(0% 33.333% 66.666% 33.333%)',
    initialTransform: 'translate3d(0, -140%, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.08s',
  },
  {
    clipPath: 'inset(0% 0% 66.666% 66.666%)',
    initialTransform: 'translate3d(140%, -140%, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.16s',
  },
  {
    clipPath: 'inset(33.333% 66.666% 33.333% 0%)',
    initialTransform: 'translate3d(-140%, 0, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.24s',
  },
  {
    clipPath: 'inset(33.333% 33.333% 33.333% 33.333%)',
    initialTransform: 'translate3d(0, 0, 0) scale(0.6)',
    finalTransform: 'translate3d(0, 0, 0) scale(1)',
    delay: '0.32s',
  },
  {
    clipPath: 'inset(33.333% 0% 33.333% 66.666%)',
    initialTransform: 'translate3d(140%, 0, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.4s',
  },
  {
    clipPath: 'inset(66.666% 66.666% 0% 0%)',
    initialTransform: 'translate3d(-140%, 140%, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.48s',
  },
  {
    clipPath: 'inset(66.666% 33.333% 0% 33.333%)',
    initialTransform: 'translate3d(0, 140%, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.56s',
  },
  {
    clipPath: 'inset(66.666% 0% 0% 66.666%)',
    initialTransform: 'translate3d(140%, 140%, 0)',
    finalTransform: 'translate3d(0, 0, 0)',
    delay: '0.64s',
  },
];

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Program HTM', href: '#program-htm' },
  { label: 'Syarat', href: '#syarat' },
  { label: 'Download', href: '#download' },
  { label: 'Kontak', href: '#kontak' },
  { label: 'FAQ', href: '#faq' },
] as const;

const Landing: React.FC = () => {
  const [navState, setNavState] = useState('semi-transparent');
  const [piecesReady, setPiecesReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [hoveredArea, setHoveredArea] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [formData, setFormData] = useState({ salary: '', location: '', tenor: '' });
  const [isPanoramaMode, setIsPanoramaMode] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const panoramaRef = useRef<HTMLElement | null>(null);
  const mapsRef = useRef<HTMLElement | null>(null);
  
  // Sample units data for each area
  const areaUnits = {
    'Jakarta Pusat': [
      { name: 'Menteng Residence', type: '2BR', price: 'Rp 3.2M' },
      { name: 'Thamrin Tower', type: '1BR', price: 'Rp 2.8M' },
      { name: 'Sudirman Suite', type: '3BR', price: 'Rp 4.5M' }
    ],
    'Jakarta Utara': [
      { name: 'Kelapa Gading Plaza', type: '2BR', price: 'Rp 2.9M' },
      { name: 'Pantai Indah Kapuk', type: '1BR', price: 'Rp 2.5M' },
      { name: 'Ancol Bay View', type: '2BR', price: 'Rp 3.1M' }
    ],
    'Jakarta Barat': [
      { name: 'Kebon Jeruk Residence', type: '1BR', price: 'Rp 2.3M' },
      { name: 'Grogol Tower', type: '2BR', price: 'Rp 2.7M' },
      { name: 'Taman Sari Suite', type: '3BR', price: 'Rp 3.8M' }
    ],
    'Jakarta Selatan': [
      { name: 'Kemang Village', type: '2BR', price: 'Rp 3.5M' },
      { name: 'Pondok Indah Mall', type: '1BR', price: 'Rp 2.9M' },
      { name: 'Senayan Residence', type: '3BR', price: 'Rp 5.2M' }
    ],
    'Jakarta Timur': [
      { name: 'Cakung Residence', type: '1BR', price: 'Rp 2.1M' },
      { name: 'Klender Tower', type: '2BR', price: 'Rp 2.4M' },
      { name: 'Rawamangun Suite', type: '2BR', price: 'Rp 2.6M' }
    ],
    'Kepulauan Seribu': [
      { name: 'Pulau Pramuka Resort', type: 'Villa', price: 'Rp 4.8M' },
      { name: 'Tidung Island View', type: 'Villa', price: 'Rp 5.1M' }
    ]
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setPiecesReady(true), 80);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const updateNavMetrics = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
      updateNavMetrics();
    };

    updateNavMetrics();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current || !panoramaRef.current || !mapsRef.current) {
        return;
      }

      const navHeight = navRef.current.offsetHeight;
      const scrollPosition = window.scrollY + navHeight;
      
      // Get section positions
      const panoramaTop = panoramaRef.current.getBoundingClientRect().top + window.scrollY;
      const panoramaBottom = panoramaTop + panoramaRef.current.offsetHeight;
      const mapsTop = mapsRef.current.getBoundingClientRect().top + window.scrollY;
      const mapsBottom = mapsTop + mapsRef.current.offsetHeight;
      
      // Determine nav state based on current section
      const inPanoramaSection = scrollPosition >= panoramaTop && scrollPosition <= panoramaBottom;
      const inMapsSection = scrollPosition >= mapsTop && scrollPosition <= mapsBottom;
      
      if (inPanoramaSection) {
        setNavState('semi-transparent');
      } else if (inMapsSection) {
        setNavState('transparent');
      } else {
        setNavState('normal');
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        ref={navRef}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out text-white ${
          isPanoramaMode ? '-top-24 opacity-0' : 'top-0 opacity-100'
        } ${
          navState === 'transparent' ? 'bg-transparent shadow-none' :
          navState === 'semi-transparent' ? 'bg-gray-800/50 shadow-md' :
          'bg-gray-900 shadow-lg'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-0">
          <a href="/" className="flex items-center py-0" aria-label="Beranda Jakhabitat">
            <img src={whiteLogo} alt="Jakhabitat" className="h-16 w-auto md:h-24" />
          </a>
          <button
            type="button"
            className="ml-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition md:hidden focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              aria-hidden="true"
              className={`h-6 w-6 transition-transform duration-300 ${
                isMenuOpen ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6.75C4 5.23122 5.23122 4 6.75 4h10.5C18.7688 4 20 5.23122 20 6.75v5.25c0 1.5188-1.2312 2.75-2.75 2.75h-6.086a1.25 1.25 0 00-.884.366l-2.93 2.93c-.786.786-2.133.229-2.133-.884V14.75C5.23122 14.75 4 13.5188 4 12V6.75z" />
              <path d="M8.75 8.75h6.5M8.75 11.25h3.5" />
            </svg>
          </button>
          <ul className={`hidden items-center space-x-6 list-none text-[11px] font-medium uppercase tracking-[0.35em] md:flex`}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="transition duration-200 hover:font-bold hover:text-gray-100">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`md:hidden transition-max-height duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[calc(100vh-6rem)]' : 'max-h-0'
          } overflow-hidden border-t border-white/10 bg-black/70`}
        >
          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto px-6 py-6">
            <ul className="flex flex-col space-y-4 text-sm font-medium uppercase tracking-[0.25em]">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="block w-full border-b border-white/10 pb-3 transition duration-200 hover:font-bold hover:text-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* 360 Object Viewer Section */}
      <section
        ref={panoramaRef}
        id="panorama"
        className="relative min-h-screen"
      >
        <LayerViewer onModeChange={setIsPanoramaMode} />
      </section>

      {/* Unit Search Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Temukan Unit yang Tepat untuk Anda</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Gunakan filter di bawah ini untuk menemukan unit HTM Jakhabitat yang sesuai dengan kemampuan finansial dan preferensi lokasi Anda.</p>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Rentang Gaji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Gaji Bulanan</label>
                <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              >
                <option value="">Pilih rentang gaji</option>
                  <option value="4-6">Rp 4 - 6 juta</option>
                  <option value="6-8">Rp 6 - 8 juta</option>
                  <option value="8-10">Rp 8 - 10 juta</option>
                  <option value="10-12">Rp 10 - 12 juta</option>
                  <option value="12-15">Rp 12 - 15 juta</option>
                </select>
              </div>
              
              {/* Lokasi Preferensi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Preferensi</label>
                <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Pilih lokasi</option>
                  <option value="jakarta-pusat">Jakarta Pusat</option>
                  <option value="jakarta-utara">Jakarta Utara</option>
                  <option value="jakarta-barat">Jakarta Barat</option>
                  <option value="jakarta-selatan">Jakarta Selatan</option>
                  <option value="jakarta-timur">Jakarta Timur</option>
                </select>
              </div>
              
              {/* Tenor Cicilan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenor Cicilan</label>
                <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.tenor}
                onChange={(e) => setFormData({...formData, tenor: e.target.value})}
              >
                <option value="">Pilih tenor</option>
                  <option value="5">5 tahun</option>
                  <option value="10">10 tahun</option>
                  <option value="15">15 tahun</option>
                  <option value="20">20 tahun</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button 
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  formData.salary && formData.location && formData.tenor
                    ? 'bg-gray-900 hover:bg-gray-800 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!formData.salary || !formData.location || !formData.tenor}
                onClick={() => setShowRecommendationModal(true)}
              >
                Cari Unit Sesuai Budget
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation Modal */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-xl">
            <div className="p-8 flex-shrink-0">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Rekomendasi Unit untuk Anda</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Berdasarkan kriteria yang Anda pilih, berikut adalah unit HTM Jakhabitat yang sesuai dengan kemampuan finansial Anda.</p>
              </div>
              
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Kriteria Pencarian Anda:</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-sm text-gray-600">Rentang Gaji:</span>
                    <div className="font-medium text-gray-900">{formData.salary === '4-6' ? 'Rp 4 - 6 juta' : formData.salary === '6-8' ? 'Rp 6 - 8 juta' : formData.salary === '8-10' ? 'Rp 8 - 10 juta' : formData.salary === '10-12' ? 'Rp 10 - 12 juta' : 'Rp 12 - 15 juta'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Lokasi Preferensi:</span>
                    <div className="font-medium text-gray-900">{formData.location === 'jakarta-pusat' ? 'Jakarta Pusat' : formData.location === 'jakarta-utara' ? 'Jakarta Utara' : formData.location === 'jakarta-barat' ? 'Jakarta Barat' : formData.location === 'jakarta-selatan' ? 'Jakarta Selatan' : 'Jakarta Timur'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tenor Cicilan:</span>
                    <div className="font-medium text-gray-900">{formData.tenor} tahun</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg flex-1 flex flex-col">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
                  <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <div className="col-span-2">Nama Unit</div>
                    <div>Luas</div>
                    <div>Harga</div>
                    <div>Cicilan</div>
                    <div>Aksi</div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
                  <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-semibold text-gray-900">Studio TB Simatupang</div>
                        <div className="text-sm text-gray-600">2 menit ke MRT</div>
                      </div>
                      <div className="text-sm text-gray-900">24 m² • 1BR</div>
                      <div className="text-sm font-semibold text-gray-900">Rp 450 juta</div>
                      <div className="text-sm font-medium text-gray-900">Rp 2.6 juta/bulan</div>
                      <div>
                        <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium transition-colors">
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-medium text-gray-900">1BR Kemang Residence</div>
                        <div className="text-sm text-gray-500">5 menit ke TransJakarta</div>
                      </div>
                      <div className="text-sm text-gray-900">36 m² • 1BR</div>
                      <div className="text-sm font-medium text-green-600">Rp 650 juta</div>
                      <div className="text-sm text-gray-900">Rp 3.8 juta/bulan</div>
                      <div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-medium text-gray-900">2BR Cakung Tower</div>
                        <div className="text-sm text-gray-500">10 menit ke LRT</div>
                      </div>
                      <div className="text-sm text-gray-900">48 m² • 2BR</div>
                      <div className="text-sm font-medium text-green-600">Rp 580 juta</div>
                      <div className="text-sm text-gray-900">Rp 3.2 juta/bulan</div>
                      <div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="font-medium text-gray-900">1BR Grogol Suite</div>
                        <div className="text-sm text-gray-500">3 menit ke Stasiun</div>
                      </div>
                      <div className="text-sm text-gray-900">32 m² • 1BR</div>
                      <div className="text-sm font-medium text-green-600">Rp 520 juta</div>
                      <div className="text-sm text-gray-900">Rp 2.9 juta/bulan</div>
                      <div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              

              
              <button 
                onClick={() => setShowRecommendationModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-xl">
            <div className="p-8 flex-shrink-0">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Galeri HTM Jakhabitat</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Koleksi lengkap foto unit dan fasilitas HTM Jakhabitat.</p>
              </div>
            </div>
            
            <div className="px-8 flex-1 overflow-y-auto">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-8">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img 
                      src={`https://picsum.photos/400/300?random=${i + 1}`} 
                      alt={`Galeri ${i + 1}`} 
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium">Foto {i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setShowGalleryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Maps Section */}
      <section
        ref={mapsRef}
        id="hero"
        className="relative flex min-h-[calc(100vh-theme(space.24))] items-center justify-center overflow-hidden text-white text-shadow"
      >
        {/* Jakarta Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
          <div className="absolute inset-0 opacity-80" style={{ transform: 'translateY(10%)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Jakarta Areas */}
              <path 
                d="M45,40 L55,35 L65,40 L60,55 L50,60 L40,55 Z" 
                fill="#FF6B6B" 
                opacity="0.9" 
                stroke="#374151" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-blue-500" 
                onMouseEnter={(e) => {
                  setHoveredArea('Jakarta Pusat');
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredArea(null)}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              />
              <path 
                d="M35,20 L75,15 L80,25 L75,35 L65,40 L55,35 L45,40 L35,35 Z" 
                fill="#4ECDC4" 
                opacity="0.9" 
                stroke="white" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-yellow-300" 
                onMouseEnter={(e) => {
                  setHoveredArea('Jakarta Utara');
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredArea(null)}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              />
              <path 
                d="M20,30 L45,40 L40,55 L35,70 L25,75 L15,65 L10,45 Z" 
                fill="#45B7D1" 
                opacity="0.9" 
                stroke="white" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-yellow-300" 
                onMouseEnter={(e) => {
                  setHoveredArea('Jakarta Barat');
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredArea(null)}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              />
              <path 
                d="M40,55 L60,55 L75,60 L80,75 L70,85 L45,80 L35,70 Z" 
                fill="#96CEB4" 
                opacity="0.9" 
                stroke="white" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-yellow-300" 
                onMouseEnter={(e) => {
                  setHoveredArea('Jakarta Selatan');
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredArea(null)}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              />
              <path 
                d="M65,40 L85,35 L90,50 L85,65 L75,60 L60,55 Z" 
                fill="#FFEAA7" 
                opacity="0.9" 
                stroke="white" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-yellow-300" 
                onMouseEnter={(e) => {
                  setHoveredArea('Jakarta Timur');
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredArea(null)}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              />
              <path 
                d="M15,10 L25,8 L30,15 L25,20 L15,18 Z" 
                fill="#DDA0DD" 
                opacity="0.9" 
                stroke="white" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-yellow-300" 
                onMouseEnter={(e) => {
                  setHoveredArea('Kepulauan Seribu');
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredArea(null)}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
              />
              
              {/* Area Labels */}
              <text x="52" y="47" textAnchor="middle" fill="#374151" fontSize="2" fontWeight="bold" className="pointer-events-none">Pusat</text>
              <text x="57" y="27" textAnchor="middle" fill="#374151" fontSize="2" fontWeight="bold" className="pointer-events-none">Utara</text>
              <text x="30" y="52" textAnchor="middle" fill="#374151" fontSize="2" fontWeight="bold" className="pointer-events-none">Barat</text>
              <text x="57" y="67" textAnchor="middle" fill="#374151" fontSize="2" fontWeight="bold" className="pointer-events-none">Selatan</text>
              <text x="75" y="50" textAnchor="middle" fill="#374151" fontSize="2" fontWeight="bold" className="pointer-events-none">Timur</text>
              <text x="22" y="14" textAnchor="middle" fill="#374151" fontSize="1.5" fontWeight="bold" className="pointer-events-none">Kep. Seribu</text>
            </svg>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        
        {/* Legend - Wilayah */}
        <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-lg">
          <h3 className="text-gray-800 font-semibold mb-3 text-sm">Wilayah DKI Jakarta</h3>
          <div className="space-y-2">
            {[
              { name: 'Jakarta Pusat', color: '#FF6B6B' },
              { name: 'Jakarta Utara', color: '#4ECDC4' },
              { name: 'Jakarta Barat', color: '#45B7D1' },
              { name: 'Jakarta Selatan', color: '#96CEB4' },
              { name: 'Jakarta Timur', color: '#FFEAA7' },
              { name: 'Kepulauan Seribu', color: '#DDA0DD' }
            ].map((area) => (
              <div key={area.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: area.color }}
                />
                <span className="text-gray-700 text-xs">{area.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-gray-500 text-xs">Hover untuk melihat unit tersedia</p>
          </div>
        </div>
        
        {/* Legend - Panduan */}
        <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-lg">
          <h3 className="text-gray-800 font-semibold mb-3 text-sm">Panduan Peta</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                <span className="text-gray-600 text-xs">🖱️</span>
              </div>
              <span className="text-gray-700 text-xs">Hover area untuk info unit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                <span className="text-gray-600 text-xs">👆</span>
              </div>
              <span className="text-gray-700 text-xs">Klik unit untuk reservasi</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-gray-500 text-xs text-center">HTM Jakhabitat 2024</p>
          </div>
        </div>

        {/* Hover Modal */}
        {hoveredArea && (
          <div 
            className="fixed z-50 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-gray-200"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            <h3 className="font-bold text-gray-800 mb-2">{hoveredArea}</h3>
            <div className="space-y-1">
              {areaUnits[hoveredArea]?.map((unit, index) => (
                <button
                  key={index} 
                  className="w-full flex justify-between items-center text-sm p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => alert(`Unit ${unit.name} dipilih!`)}
                >
                  <span className="text-gray-700">{unit.name}</span>
                  <div className="flex gap-2">
                    <span className="text-blue-600 font-medium">{unit.type}</span>
                    <span className="text-green-600 font-semibold">{unit.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8">
        {/* Program HTM Section */}
        <ProgramHTMSection />

        {/* Syarat Section */}
        <SyaratSection />

        {/* Download Section */}
        <DownloadSection />

        {/* Contact Section - Estate Agency */}
        <section id="kontak" className="scroll-mt-32 py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="bg-white rounded-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-bold">JH</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Estate agency</div>
                      <div className="font-semibold text-gray-900">Jakhabitat Team</div>
                    </div>
                  </div>
                </div>
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded font-medium transition-colors">
                  Contact Agent
                </button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">(021) 5000-1234</div>
                  <div className="text-sm text-gray-600">Marketing Gallery</div>
                  <div className="text-xs text-gray-500 mt-1">Jl. TB Simatupang No. 1A, Cilandak</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">+62 812-3456-7890</div>
                  <div className="text-sm text-gray-600">WhatsApp Center</div>
                  <div className="text-xs text-gray-500 mt-1">Customer Service 24/7</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">info@jakhabitat.jakarta.go.id</div>
                  <div className="text-sm text-gray-600">Email Support</div>
                  <div className="text-xs text-gray-500 mt-1">Senin - Minggu: 09.00 - 18.00</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Simple Cards */}
        <section id="faq" className="scroll-mt-32 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  question: 'Apa itu program HTM Jakhabitat?',
                  answer: 'HTM (Hunian Terjangkau Milik) Jakhabitat adalah program hunian vertikal terjangkau yang dikelola Pemprov DKI Jakarta dengan subsidi hingga 30% untuk masyarakat berpenghasilan menengah.'
                },
                {
                  question: 'Siapa saja yang bisa mendaftar HTM?',
                  answer: 'WNI berusia 21-55 tahun, memiliki KTP DKI Jakarta, penghasilan Rp 4-15 juta/bulan, belum memiliki rumah, dan tidak sedang menerima subsidi perumahan lainnya.'
                },
                {
                  question: 'Berapa cicilan bulanan HTM Jakhabitat?',
                  answer: 'Cicilan mulai dari Rp 2,6 juta/bulan untuk unit studio dengan tenor hingga 15 tahun. Simulasi lengkap tersedia di marketing gallery.'
                },
                {
                  question: 'Bagaimana cara melakukan reservasi unit?',
                  answer: 'Daftar online melalui website resmi atau datang langsung ke marketing gallery. Siapkan dokumen lengkap dan booking fee untuk reservasi unit pilihan.'
                }
              ].map(({ question, answer }, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-3">{question}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 text-center lg:text-left">
            <p className="text-sm text-white/60">© {new Date().getFullYear()} Jakhabitat Living. Hak Cipta Dilindungi.</p>
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">
              Menghubungkan manusia, ruang, dan pengalaman hidup.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm uppercase tracking-[0.25em] text-white/60">
            <a href="#" className="transition hover:text-white">Instagram</a>
            <a href="#" className="transition hover:text-white">Facebook</a>
            <a href="#" className="transition hover:text-white">TikTok</a>
            <a href="#" className="transition hover:text-white">YouTube</a>
            <a href="#" className="transition hover:text-white">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;