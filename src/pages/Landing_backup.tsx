import React, { useEffect, useRef, useState } from 'react';
import whiteLogo from '/JAKHABITAT-LOGO-putih-01.png';
import Object360ViewerWithSwitch from '../components/Object360ViewerWithSwitch';

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
  { label: 'HTM Info', href: '#htm-info' },
  { label: 'Kontak', href: '#kontak' },
  { label: 'Lokasi', href: '#lokasi' },
  { label: 'E-Brochure', href: '#brosur' },
  { label: 'Cara Daftar', href: '#cara-daftar' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Benefits', href: '#benefits' },
] as const;

const Landing: React.FC = () => {
  const [hasReachedGallery, setHasReachedGallery] = useState(false);
  const [piecesReady, setPiecesReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [hoveredArea, setHoveredArea] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLElement | null>(null);
  const galleryRef = useRef<HTMLElement | null>(null);
  
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
      if (!navRef.current || !galleryRef.current) {
        return;
      }

      const navHeight = navRef.current.offsetHeight;
      const galleryTop = galleryRef.current.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = window.scrollY + navHeight;

      setHasReachedGallery(scrollPosition >= galleryTop);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 text-white shadow-lg ${
          hasReachedGallery ? 'bg-gray-800' : 'bg-black/50'
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
        id="panorama"
        className="relative min-h-screen"
      >
        <Object360ViewerWithSwitch />

      </section>

      {/* E-Brochure Section */}
      <section id="brosur" className="bg-gradient-to-br from-amber-50 to-orange-50 py-16 relative">
        {/* Cork board texture background */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, #8B4513 2px, transparent 2px), radial-gradient(circle at 60px 60px, #8B4513 2px, transparent 2px)',
            backgroundSize: '80px 80px'
          }}
        ></div>
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-4 mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Materi Lengkap</p>
            <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">E-Brochure & Materi Digital</h3>
            <p className="mx-auto max-w-3xl text-sm text-gray-600 sm:text-base">
              Dapatkan informasi lengkap tentang Jakhabitat melalui berbagai materi digital yang dapat diunduh.
            </p>
          </div>
          
          {/* Notes Board */}
          <div className="relative">
            {/* Sticky Notes */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Brosur Utama",
                  description: "Informasi lengkap tentang proyek, fasilitas, dan spesifikasi unit",
                  type: "PDF",
                  size: "2.5 MB",
                  pages: "12 hal",
                  color: "bg-yellow-200",
                  rotation: "rotate-2",
                  tab: "📋 SIGN HERE"
                },
                {
                  title: "Price List",
                  description: "Daftar harga terbaru semua tipe unit dengan skema pembayaran",
                  type: "PDF",
                  size: "1.2 MB",
                  pages: "6 hal",
                  color: "bg-green-200",
                  rotation: "-rotate-1",
                  tab: "💰 HARGA"
                },
                {
                  title: "Site Plan",
                  description: "Denah lokasi lengkap dengan fasilitas dan akses transportasi",
                  type: "PDF",
                  size: "3.1 MB",
                  pages: "4 hal",
                  color: "bg-blue-200",
                  rotation: "rotate-1",
                  tab: "🗺️ LOKASI"
                },
                {
                  title: "Floor Plan",
                  description: "Denah detail setiap tipe unit dengan ukuran dan layout furniture",
                  type: "PDF",
                  size: "2.8 MB",
                  pages: "8 hal",
                  color: "bg-pink-200",
                  rotation: "-rotate-2",
                  tab: "🏠 DENAH"
                },
                {
                  title: "Virtual Tour",
                  description: "Link akses tur virtual 360° untuk eksplorasi unit secara online",
                  type: "LINK",
                  size: "Online",
                  pages: "360°",
                  color: "bg-purple-200",
                  rotation: "rotate-3",
                  tab: "🎥 TOUR"
                },
                {
                  title: "Simulasi KPR",
                  description: "Kalkulator cicilan dan simulasi pembiayaan HTM",
                  type: "EXCEL",
                  size: "0.8 MB",
                  pages: "Calc",
                  color: "bg-orange-200",
                  rotation: "-rotate-1",
                  tab: "🧮 KPR"
                }
              ].map((item, index) => (
                <div key={index} className={`relative group cursor-pointer ${item.rotation} hover:rotate-0 transition-all duration-300 hover:scale-105 hover:z-10`}>
                  {/* Tab/Flag */}
                  <div className="absolute -top-3 -right-2 z-20">
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 transform rotate-12 shadow-lg" 
                         style={{
                           clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)'
                         }}>
                      {item.tab}
                    </div>
                  </div>
                  
                  {/* Pushpin */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg border-2 border-red-800">
                      <div className="w-2 h-2 bg-red-400 rounded-full mx-auto mt-1"></div>
                    </div>
                  </div>
                  
                  {/* Note Paper */}
                  <div 
                    className={`${item.color} p-6 shadow-lg border-l-4 border-l-gray-400 relative`}
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 24px, rgba(0,0,0,0.1) 25px)',
                      minHeight: '280px'
                    }}
                  >
                    
                    {/* Handwritten style content */}
                    <div className="space-y-3" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{item.type === 'PDF' ? '📄' : item.type === 'EXCEL' ? '📊' : '🔗'}</span>
                        <span className="bg-black text-white px-2 py-1 text-xs rounded font-mono">{item.type}</span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-gray-800 underline decoration-wavy decoration-2">
                        {item.title}
                      </h4>
                      
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-600 border-t border-dashed border-gray-400 pt-3">
                        <span className="bg-white px-2 py-1 rounded shadow">{item.size}</span>
                        <span className="bg-white px-2 py-1 rounded shadow">{item.pages}</span>
                      </div>
                      
                      {/* Download button styled as handwritten note */}
                      <div className="mt-4">
                        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                          {item.type === 'LINK' ? '👆 BUKA LINK' : '⬇️ UNDUH'}
                        </button>
                      </div>
                      
                      {/* Handwritten arrow pointing to button */}
                      <div className="text-right text-gray-600 text-xs italic">
                        ← klik di sini!
                      </div>
                    </div>
                    
                    {/* Paper fold effect */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gray-300 transform rotate-45 translate-x-4 -translate-y-4 shadow-inner"></div>
                  </div>
                  
                  {/* Shadow */}
                  <div className={`absolute inset-0 bg-black opacity-20 transform translate-x-1 translate-y-1 -z-10 ${item.rotation}`}></div>
                </div>
              ))}
            </div>
            
            {/* Scattered paper clips and office supplies */}
            <div className="absolute top-10 left-10 text-2xl opacity-30 transform rotate-45">📎</div>
            <div className="absolute bottom-20 right-20 text-xl opacity-30 transform -rotate-12">✏️</div>
            <div className="absolute top-1/2 left-5 text-lg opacity-30 transform rotate-90">📌</div>
          </div>
        </div>
      </section>

      {/* Maps Section */}
      <section
        id="hero"
        className="relative flex min-h-[calc(100vh-theme(space.24))] items-center justify-center overflow-hidden text-white text-shadow"
      >
        {/* Jakarta Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
          <div className="absolute inset-0 opacity-80" style={{ transform: 'translateY(10%)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Jakarta Areas */}
              <path 
                d="M45,40 L55,35 L65,40 L60,55 L50,60 L40,55 Z" 
                fill="#FF6B6B" 
                opacity="0.9" 
                stroke="white" 
                strokeWidth="1" 
                className="cursor-pointer transition-all duration-300 hover:opacity-100 hover:stroke-yellow-300" 
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
              <text x="52" y="47" textAnchor="middle" fill="white" fontSize="2" fontWeight="bold" className="pointer-events-none">Pusat</text>
              <text x="57" y="27" textAnchor="middle" fill="white" fontSize="2" fontWeight="bold" className="pointer-events-none">Utara</text>
              <text x="30" y="52" textAnchor="middle" fill="white" fontSize="2" fontWeight="bold" className="pointer-events-none">Barat</text>
              <text x="57" y="67" textAnchor="middle" fill="white" fontSize="2" fontWeight="bold" className="pointer-events-none">Selatan</text>
              <text x="75" y="50" textAnchor="middle" fill="white" fontSize="2" fontWeight="bold" className="pointer-events-none">Timur</text>
              <text x="22" y="14" textAnchor="middle" fill="white" fontSize="1.5" fontWeight="bold" className="pointer-events-none">Kep. Seribu</text>
              
              {/* Watermarks */}
              <text x="52" y="50" textAnchor="middle" fill="white" fontSize="1" opacity="0.3" className="pointer-events-none">JAKHABITAT</text>
              <text x="57" y="30" textAnchor="middle" fill="white" fontSize="1" opacity="0.3" className="pointer-events-none">JAKHABITAT</text>
              <text x="30" y="55" textAnchor="middle" fill="white" fontSize="1" opacity="0.3" className="pointer-events-none">JAKHABITAT</text>
              <text x="57" y="70" textAnchor="middle" fill="white" fontSize="1" opacity="0.3" className="pointer-events-none">JAKHABITAT</text>
              <text x="75" y="53" textAnchor="middle" fill="white" fontSize="1" opacity="0.3" className="pointer-events-none">JAKHABITAT</text>
              <text x="22" y="17" textAnchor="middle" fill="white" fontSize="0.8" opacity="0.3" className="pointer-events-none">JAKHABITAT</text>
              
              {/* Animated dots */}
              {[...Array(20)].map((_, i) => (
                <circle
                  key={i}
                  cx={20 + (i * 3) % 60}
                  cy={20 + (i * 4) % 60}
                  r="0.5"
                  fill="white"
                  opacity="0.4"
                  style={{
                    animation: `pulse 3s ease-in-out infinite ${i * 0.2}s`
                  }}
                />
              ))}
            </svg>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        
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
        {/* Towers Section */}
        <section id="htm-info" className="scroll-mt-32" ref={galleryRef}>
          <div className="mb-10 space-y-4 text-center">
            <h3 className="text-2xl font-bold sm:text-3xl">Galeri Huni</h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Temukan pilihan tower dengan karakter berbeda sesuai kebutuhan gaya hidup urban modern.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <article
                key={index}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white/80 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src="https://cms.southgate.id/storage/southgate/image/svg_xml/altuera_icon.svg"
                  alt="Ikon tower"
                  className="mx-auto mb-6 h-12 w-12"
                />
                <h4 className="text-lg font-semibold tracking-[0.2em] text-gray-900">
                  {index === 1 ? 'ALTUERA' : index === 2 ? 'ELEGANCE' : 'PRIME'} TOWER
                </h4>
                <p className="mt-4 flex-1 text-sm text-gray-600">
                  {index === 1 &&
                    'Hunian premium dengan pemandangan langit kota dan fasilitas lengkap untuk gaya hidup dinamis.'}
                  {index === 2 &&
                    'Apartemen yang menyatu dengan lanskap hijau, menawarkan kenyamanan ideal bagi keluarga.'}
                  {index === 3 &&
                    'Ruang tinggal eksklusif dengan privasi maksimal dan finishing berkelas internasional.'}
                </p>
                <p className="mt-4 text-sm font-semibold text-gray-900">
                  Mulai dari {index === 1 ? 'Rp 2,6 M' : index === 2 ? 'Rp 3,7 M' : 'Rp 5 M'}
                </p>
                <a
                  href="#"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-blue-700"
                >
                  Lihat Detail
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="scroll-mt-32 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-16">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">Keunggulan Jakhabitat</p>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Benefits & Fasilitas Unggulan</h3>
              <p className="mx-auto max-w-3xl text-sm text-gray-600 sm:text-base">
                Nikmati berbagai keuntungan eksklusif dan fasilitas premium yang dirancang untuk gaya hidup modern.
              </p>
            </div>
            
            {/* Key Benefits - Coupon Style */}
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Subsidi Pemerintah",
                  icon: "🏠",
                  value: "30% OFF",
                  items: ["Subsidi hingga 30%", "Bunga KPR 3%", "Bebas PPN", "Cicilan Rp 2,6 juta"],
                  color: "from-blue-400 to-blue-600",
                  accent: "bg-blue-700"
                },
                {
                  title: "Lokasi Strategis",
                  icon: "📍",
                  value: "PREMIUM",
                  items: ["2 menit MRT", "Akses AEON Mall", "TB Simatupang", "Koneksi Jakarta"],
                  color: "from-green-400 to-green-600",
                  accent: "bg-green-700"
                },
                {
                  title: "Investasi Menguntungkan",
                  icon: "🏢",
                  value: "12% ROI",
                  items: ["Capital gain tinggi", "Yield 8-12%", "Demand tinggi", "Sertifikat SHM"],
                  color: "from-purple-400 to-purple-600",
                  accent: "bg-purple-700"
                }
              ].map((benefit, index) => (
                <div key={index} className="relative group cursor-pointer">
                  {/* Coupon */}
                  <div className={`bg-gradient-to-br ${benefit.color} p-6 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl`}
                       style={{
                         clipPath: 'polygon(0% 0%, 90% 0%, 95% 50%, 90% 100%, 0% 100%, 5% 50%)'
                       }}>
                    
                    {/* Dotted border effect */}
                    <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded-lg"></div>
                    
                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-2 border-white/50 rounded-full"></div>
                    <div className="absolute top-2 right-8 w-4 h-4 border-2 border-white/50 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-white/50 rounded-full"></div>
                    <div className="absolute bottom-2 right-8 w-4 h-4 border-2 border-white/50 rounded-full"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl">{benefit.icon}</span>
                        <div className={`${benefit.accent} px-3 py-1 rounded-full text-xs font-bold`}>
                          {benefit.value}
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold mb-4 text-center">{benefit.title}</h4>
                      
                      <ul className="space-y-2 text-sm">
                        {benefit.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      
                      {/* Coupon code */}
                      <div className="mt-4 text-center">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded text-xs font-mono">
                          JAKHABITAT{index + 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* Perforated edge */}
                    <div className="absolute right-0 top-0 bottom-0 w-2">
                      {Array.from({length: 10}).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-white/30 rounded-full mx-auto" style={{marginTop: i === 0 ? '10px' : '8px'}}></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Coupon shadow */}
                  <div className="absolute inset-0 bg-black/20 transform translate-x-1 translate-y-1 -z-10"
                       style={{
                         clipPath: 'polygon(0% 0%, 90% 0%, 95% 50%, 90% 100%, 0% 100%, 5% 50%)'
                       }}></div>
                </div>
              ))}
            </div>
            
            {/* Facilities - Scratch Card Style */}
            <div className="space-y-8">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Fasilitas Premium</h4>
                <p className="text-sm text-gray-600">Setiap sudut dirancang untuk menghadirkan keseimbangan antara hiburan, relaksasi, dan kesehatan.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { name: 'Infinity Pool', icon: '🏆', desc: 'Kolam renang infinity', color: 'from-blue-400 to-cyan-400' },
                  { name: 'Fitness Center', icon: '🏋️', desc: 'Gym lengkap modern', color: 'from-red-400 to-pink-400' },
                  { name: 'Co-Working Space', icon: '💻', desc: 'Ruang kerja WiFi kencang', color: 'from-green-400 to-emerald-400' },
                  { name: 'Terrace Garden', icon: '🌿', desc: 'Taman atap hijau asri', color: 'from-lime-400 to-green-400' },
                  { name: 'Mini Golf Course', icon: '⛳', desc: 'Lapangan golf mini', color: 'from-yellow-400 to-orange-400' },
                  { name: 'BBQ Area', icon: '🍖', desc: 'Area barbeque keluarga', color: 'from-orange-400 to-red-400' },
                  { name: 'Kids Playground', icon: '🎠', desc: 'Area bermain anak', color: 'from-purple-400 to-pink-400' },
                  { name: 'Jogging Track', icon: '🏃', desc: 'Lintasan lari berkualitas', color: 'from-indigo-400 to-purple-400' },
                  { name: 'Multi-Function Hall', icon: '🎭', desc: 'Ruang serbaguna', color: 'from-teal-400 to-blue-400' },
                  { name: 'Laundry Service', icon: '🧦', desc: 'Layanan laundry', color: 'from-cyan-400 to-teal-400' },
                  { name: '24/7 Security', icon: '🔒', desc: 'Keamanan 24 jam', color: 'from-gray-400 to-gray-600' },
                  { name: 'Parking Area', icon: '🏎️', desc: 'Area parkir luas', color: 'from-slate-400 to-gray-500' }
                ].map((facility, index) => (
                  <div key={facility.name} className="group cursor-pointer">
                    {/* Scratch card */}
                    <div className={`bg-gradient-to-br ${facility.color} p-4 text-white relative overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg rounded-lg border-2 border-dashed border-white/30`}>
                      
                      {/* Scratch effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      
                      {/* Prize content */}
                      <div className="relative z-10 text-center">
                        <div className="text-3xl mb-2 group-hover:animate-bounce">{facility.icon}</div>
                        <h5 className="text-sm font-bold mb-1">{facility.name}</h5>
                        <p className="text-xs opacity-90">{facility.desc}</p>
                        
                        {/* Winner badge */}
                        <div className="mt-2">
                          <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                            ★ GRATIS
                          </span>
                        </div>
                      </div>
                      
                      {/* Corner stamps */}
                      <div className="absolute top-1 right-1 w-6 h-6 border border-white/50 rounded-full flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="lokasi" className="scroll-mt-32">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Konektivitas</p>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Akses Mudah ke Pusat Aktivitas Jakarta Selatan</h3>
              <p className="text-sm text-gray-600 sm:text-base">
                Berada di kawasan TB Simatupang, hunian ini memadukan ketenangan tinggal dengan kemudahan akses
                ke pusat bisnis, hiburan, dan transportasi umum utama.
              </p>
              <ul className="space-y-3 text-sm text-gray-600 sm:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-[6px] h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                  <span>2 menit ke Jalur MRT Fatmawati</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[6px] h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                  <span>5 menit ke pusat kuliner dan lifestyle area</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[6px] h-2 w-2 rounded-full bg-blue-600" aria-hidden="true" />
                  <span>Terhubung langsung dengan area hijau kota</span>
                </li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <img
                src="https://www.southgate.id/images/home-location-map.png"
                alt="Peta lokasi Jakhabitat"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>



        {/* FAQ & Contact Section */}
        <section id="faq" className="scroll-mt-32">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Pertanyaan Populer</p>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">FAQ</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {[
                  {
                    category: "Umum",
                    question: 'Apa itu program HTM Jakhabitat?',
                    answer: 'HTM (Hunian Terjangkau Milik) Jakhabitat adalah program hunian vertikal terjangkau yang dikelola Pemprov DKI Jakarta dengan subsidi hingga 30% untuk masyarakat berpenghasilan menengah.'
                  },
                  {
                    category: "Syarat",
                    question: 'Siapa saja yang bisa mendaftar HTM?',
                    answer: 'WNI berusia 21-55 tahun, memiliki KTP DKI Jakarta, penghasilan Rp 4-15 juta/bulan, belum memiliki rumah, dan tidak sedang menerima subsidi perumahan lainnya.'
                  },
                  {
                    category: "Pembiayaan",
                    question: 'Berapa cicilan bulanan HTM Jakhabitat?',
                    answer: 'Cicilan mulai dari Rp 2,6 juta/bulan untuk unit studio dengan tenor hingga 15 tahun. Simulasi lengkap tersedia di marketing gallery.'
                  },
                  {
                    category: "Proses",
                    question: 'Bagaimana cara melakukan reservasi unit?',
                    answer: 'Daftar online melalui website resmi atau datang langsung ke marketing gallery. Siapkan dokumen lengkap dan booking fee untuk reservasi unit pilihan.'
                  },
                  {
                    category: "Pembiayaan",
                    question: 'Apakah tersedia cicilan KPA?',
                    answer: 'Ya, tersedia kerja sama KPA dengan berbagai bank rekanan (BNI, BTN, Bank DKI) dengan bunga subsidi dan tenor fleksibel hingga 15 tahun.'
                  },
                  {
                    category: "Konstruksi",
                    question: 'Kapan perkiraan serah terima unit?',
                    answer: 'Estimasi serah terima dimulai Q4 2025 dengan pengembangan bertahap per tower. Update progress konstruksi dapat dipantau melalui website resmi.'
                  },
                  {
                    category: "Fasilitas",
                    question: 'Apa saja fasilitas yang tersedia?',
                    answer: 'Infinity pool, gym, co-working space, playground, terrace garden, mini golf, BBQ area, dan akses langsung ke AEON Mall TB Simatupang.'
                  },
                  {
                    category: "Lokasi",
                    question: 'Bagaimana akses transportasi umum?',
                    answer: '2 menit ke MRT Fatmawati, 5 menit ke halte TransJakarta, dan akses mudah ke Tol Jagorawi, Tol Lingkar Luar, serta berbagai rute angkutan umum.'
                  },
                  {
                    category: "Legal",
                    question: 'Apakah unit bisa dijual atau disewakan?',
                    answer: 'Unit HTM memiliki ketentuan khusus. Penjualan hanya bisa dilakukan setelah 5 tahun kepemilikan dengan persetujuan pengelola. Penyewaan diperbolehkan dengan syarat tertentu.'
                  },
                  {
                    category: "Maintenance",
                    question: 'Berapa biaya maintenance bulanan?',
                    answer: 'Service charge sekitar Rp 15-25 ribu/m² tergantung tipe unit, sudah termasuk maintenance area bersama, security 24 jam, dan pengelolaan fasilitas.'
                  }
                ].map(({ category, question, answer }, index) => (
                  <article key={index} className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category === 'Umum' ? 'bg-blue-100 text-blue-700' :
                        category === 'Syarat' ? 'bg-green-100 text-green-700' :
                        category === 'Pembiayaan' ? 'bg-purple-100 text-purple-700' :
                        category === 'Proses' ? 'bg-orange-100 text-orange-700' :
                        category === 'Konstruksi' ? 'bg-red-100 text-red-700' :
                        category === 'Fasilitas' ? 'bg-teal-100 text-teal-700' :
                        category === 'Lokasi' ? 'bg-indigo-100 text-indigo-700' :
                        category === 'Legal' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 sm:text-base mt-2 mb-2">{question}</h4>
                    <p className="text-sm text-gray-600 sm:text-base leading-relaxed">{answer}</p>
                  </article>
                ))}
              </div>
              
            </div>

            <div id="kontak" className="space-y-6">
              {/* Phone Book Style Contact Information */
              <div className="bg-yellow-50 border-2 border-yellow-200 relative">
                {/* Phone book binding holes */}
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-evenly">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                  ))}
                </div>
                
                {/* Phone book header */}
                <div className="bg-yellow-400 border-b-2 border-yellow-600 p-4 pl-12">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📞</span>
                    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">BUKU TELEPON</h3>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Marketing Gallery - Jakhabitat</p>
                </div>
                
                {/* Phone book entries */}
                <div className="p-6 pl-12 space-y-4">
                  {/* Entry 1 */}
                  <div className="border-b border-dashed border-gray-300 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 uppercase">JAKHABITAT MARKETING</p>
                        <p className="text-sm text-gray-600">Jl. TB Simatupang No. 1A</p>
                        <p className="text-sm text-gray-600">Cilandak, Jakarta Selatan 12560</p>
                      </div>
                      <div className="text-right">
                        <a href="tel:+622150001234" className="font-mono font-bold text-blue-600 hover:text-blue-800">
                          (021) 5000-1234
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entry 2 */}
                  <div className="border-b border-dashed border-gray-300 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 uppercase">WHATSAPP CENTER</p>
                        <p className="text-sm text-gray-600">Customer Service 24/7</p>
                        <p className="text-sm text-gray-600">Konsultasi & Jadwal Kunjungan</p>
                      </div>
                      <div className="text-right">
                        <a href="https://wa.me/6281234567890" className="font-mono font-bold text-green-600 hover:text-green-800">
                          +62 812-3456-7890
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entry 3 */}
                  <div className="border-b border-dashed border-gray-300 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 uppercase">EMAIL SUPPORT</p>
                        <p className="text-sm text-gray-600">Informasi & Dokumentasi</p>
                        <p className="text-sm text-gray-600">Senin - Minggu: 09.00 - 18.00</p>
                      </div>
                      <div className="text-right">
                        <a href="mailto:info@jakhabitat.jakarta.go.id" className="font-mono text-sm text-purple-600 hover:text-purple-800 break-all">
                          info@jakhabitat.jakarta.go.id
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entry 4 */}
                  <div className="border-b border-dashed border-gray-300 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 uppercase">EMERGENCY HOTLINE</p>
                        <p className="text-sm text-gray-600">Keamanan & Maintenance</p>
                        <p className="text-sm text-gray-600">24 Jam Siaga</p>
                      </div>
                      <div className="text-right">
                        <a href="tel:+622150009999" className="font-mono font-bold text-red-600 hover:text-red-800">
                          (021) 5000-9999
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entry 5 */}
                  <div className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 uppercase">SALES OFFICE</p>
                        <p className="text-sm text-gray-600">Show Unit & Simulasi KPR</p>
                        <p className="text-sm text-gray-600">Booking & Reservasi Unit</p>
                      </div>
                      <div className="text-right">
                        <a href="tel:+622150005678" className="font-mono font-bold text-orange-600 hover:text-orange-800">
                          (021) 5000-5678
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Phone book footer with quick actions */}
                <div className="bg-gray-100 border-t-2 border-gray-300 p-4 pl-12">
                  <p className="text-xs text-gray-600 mb-3 uppercase tracking-wide">AKSI CEPAT:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href="https://maps.google.com/?q=TB+Simatupang+Jakarta" 
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 text-xs font-bold text-center transition-colors uppercase tracking-wide"
                    >
                      🗺️ MAPS
                    </a>
                    <a 
                      href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20jadwal%20kunjungan%20show%20unit" 
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 text-xs font-bold text-center transition-colors uppercase tracking-wide"
                    >
                      📅 JADWAL
                    </a>
                  </div>
                </div>
                
                {/* Page number */}
                <div className="absolute bottom-2 right-4 text-xs text-gray-500 font-mono">
                  Hal. 247
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cara Daftar - Simple Steps */}
        <section id="cara-daftar" className="scroll-mt-32 bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 py-16">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-600">Panduan Lengkap</p>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Cara Daftar HTM Jakhabitat</h3>
              <p className="mx-auto max-w-3xl text-sm text-gray-600 sm:text-base">
                Ikuti langkah mudah berikut untuk memulai proses kepemilikan hunian impian Anda.
              </p>
            </div>
            
            {/* Simple Steps */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { step: 1, title: 'Registrasi Online', desc: 'Daftar melalui website resmi dengan data lengkap', icon: '🚀' },
                { step: 2, title: 'Verifikasi Dokumen', desc: 'Upload KTP DKI Jakarta dan dokumen pendukung', icon: '📄' },
                { step: 3, title: 'Survey & Interview', desc: 'Kunjungi show unit dan wawancara kelayakan', icon: '🏗️' },
                { step: 4, title: 'Persetujuan Bank', desc: 'Proses kredit dan simulasi cicilan KPR', icon: '🏦' },
                { step: 5, title: 'Booking Unit', desc: 'Pilih unit dan bayar booking fee', icon: '🏢' },
                { step: 6, title: 'Serah Terima', desc: 'Akad kredit dan terima kunci unit', icon: '🏠' }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-blue-600 mb-1">LANGKAH {item.step}</div>
                      <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Call to Action */}
            <div className="rounded-3xl bg-gradient-to-r from-green-600 via-blue-500 to-purple-600 px-6 py-12 text-center text-white shadow-xl sm:px-10">
              <h3 className="text-2xl font-bold sm:text-3xl">🎯 Siap Memulai?</h3>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
                Mulai proses pendaftaran HTM Jakhabitat dan wujudkan hunian impian Anda!
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#unit-tour"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-purple-600 transition hover:bg-white/90"
                >
                  🚀 MULAI DAFTAR
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  className="inline-flex items-center justify-center rounded-full border border-white/80 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white"
                >
                  💬 KONSULTASI
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Virtual Tour Section */}
        <section id="unit-tour" className="scroll-mt-32">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Eksplor Unit</p>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Tur Virtual 360°</h3>
              <p className="text-sm text-gray-600 sm:text-base">
                Jelajahi setiap sudut unit melalui tur virtual interaktif. Nikmati pengalaman imersif dari rumah sebelum
                mengunjungi show unit kami.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {['Studio Deluxe', '1BR Executive', '2BR Signature', 'Penthouse'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.2em] text-gray-700 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-900/90 shadow-lg">
              <div className="aspect-video w-full bg-black/60" aria-hidden="true">
                <iframe
                  title="Tur Virtual Jakhabitat"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* HTM Info Section - Detailed Information */}
        <section id="htm-info-detail" className="scroll-mt-32">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Informasi HTM</p>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Hunian Terjangkau Milik</h3>
              <p className="mx-auto max-w-3xl text-sm text-gray-600 sm:text-base">
                Program HTM memberikan kesempatan kepada masyarakat untuk memiliki hunian berkualitas dengan skema pembiayaan yang terjangkau.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="bg-white/80 rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Syarat Mudah</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• WNI berusia 21-55 tahun</li>
                  <li>• Penghasilan minimal Rp 4 juta</li>
                  <li>• Belum memiliki rumah</li>
                  <li>• KTP DKI Jakarta</li>
                </ul>
              </div>
              
              <div className="bg-white/80 rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold text-xl">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Keuntungan</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Subsidi hingga 30%</li>
                  <li>• Cicilan mulai Rp 2,6 juta</li>
                  <li>• Lokasi strategis</li>
                  <li>• Fasilitas lengkap</li>
                </ul>
              </div>
              
              <div className="bg-white/80 rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-purple-600 font-bold text-xl">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Proses Cepat</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Pendaftaran online</li>
                  <li>• Verifikasi 7 hari</li>
                  <li>• Akad dalam 30 hari</li>
                  <li>• Serah terima bertahap</li>
                </ul>
              </div>
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