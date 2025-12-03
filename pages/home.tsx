import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LayerViewer from '../components/LayerViewer';
import KPRSimulator from '../components/KPRSimulator';
import SyaratFPPR from '../components/SyaratFPPR';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const NAV_LINKS = [
  { label: 'Landing', href: '/' },
  { label: 'Latar Belakang', href: '#latar-belakang' },
  { label: 'Perbandingan Harga', href: '#perbandingan-harga' },
  { label: 'Syarat', href: '#syarat' },
  { label: 'Program HTM', href: '#program-htm' },
  { label: 'Simulasi KPR', href: '#kpr-simulator' },
  { label: 'Kontak', href: '#kontak' },
] as const;

const Home: React.FC = () => {
  const [navState, setNavState] = useState('semi-transparent');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanoramaMode, setIsPanoramaMode] = useState(false);
  const [targetPanoramaId, setTargetPanoramaId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    const handleRenderPanorama = (event: CustomEvent) => {
      setTargetPanoramaId(event.detail.projectId);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('renderPanorama', handleRenderPanorama as EventListener);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('renderPanorama', handleRenderPanorama as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        ref={navRef}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isPanoramaMode ? '-top-24 opacity-0' : 'top-0 opacity-100'
        }`}
      >
        <div className="flex w-full relative">
          <div className="bg-white flex items-center px-4 py-0" style={{clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)'}}>
            <Link href="/home" className="flex items-center py-0" aria-label="Beranda Jakhabitat">
              <img src="/JAKHABITAT-LOGO-01.png" alt="Jakhabitat" className="h-16 w-auto md:h-24" />
            </Link>
            <div className="w-1 h-12 bg-gray-900 ml-4 md:h-16 transform rotate-12"></div>
          </div>
          <div className="bg-transparent flex-1 flex items-center justify-end px-4 py-0 text-white">
            <ul className={`hidden items-center space-x-6 list-none text-[11px] font-bold uppercase tracking-[0.35em] md:flex`}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('/') ? (
                    <Link href={href} className="transition duration-200 hover:font-bold hover:text-gray-100">
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="transition duration-200 hover:font-bold hover:text-gray-100">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
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
          </div>
        </div>
        <div
          className={`md:hidden transition-max-height duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[calc(100vh-6rem)]' : 'max-h-0'
          } overflow-hidden border-t border-white/10 bg-black/70`}
        >
          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto px-6 py-6">
            <ul className="flex flex-col space-y-4 text-sm font-bold uppercase tracking-[0.25em]">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('/') ? (
                    <Link
                      href={href}
                      className="block w-full border-b border-white/10 pb-3 transition duration-200 hover:font-bold hover:text-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      className="block w-full border-b border-white/10 pb-3 transition duration-200 hover:font-bold hover:text-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Layer Viewer Section */}
      <section
        id="panorama"
        className="relative min-h-screen hidden"
      >
        <LayerViewer onModeChange={setIsPanoramaMode} targetPanoramaId={targetPanoramaId} />
      </section>

      {/* Latar Belakang Section */}
      <div className="w-full h-16 md:h-24 relative">
        <div className="absolute inset-0 bg-white" style={{clipPath: 'polygon(0 0, 30% 0, calc(30% - 20px) 100%, 0 100%)'}}></div>
        <div className="absolute inset-0 bg-gray-900"></div>
      </div>
      <section id="latar-belakang" className="pt-32 pb-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-8">LATAR BELAKANG</h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Masalah penyediaan hunian layak menyangkut hak asasi manusia, kualitas hidup, stabilitas sosial, pertumbuhan ekonomi, ketahanan bencana, dan keadilan sosial.
            </p>
          </div>
          
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 text-center mb-12">
              Faktor-faktor yang menyebabkan masalah ini antara lain
            </h3>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Pertumbuhan penduduk:</h4>
                <p className="text-gray-700 leading-relaxed">
                  Peningkatan jumlah penduduk menyebabkan permintaan akan hunian semakin tinggi.
                </p>
              </div>
              
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Urbanisasi:</h4>
                <p className="text-gray-700 leading-relaxed">
                  Perpindahan penduduk dari luar daerah ke Kota Jakarta menyebabkan tekanan pada ketersediaan lahan.
                </p>
              </div>
              
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Harga tanah yang mahal:</h4>
                <p className="text-gray-700 leading-relaxed">
                  Kenaikan harga tanah membuat hunian menjadi semakin sulit dijangkau oleh masyarakat berpenghasilan rendah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perbandingan Harga Section */}
      <section id="perbandingan-harga" className="py-20 bg-gray-100">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-8">PERBANDINGAN HARGA</h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Bandingkan harga hunian dengan dan tanpa program HTM Jakhabitat
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-0">
                <div className="bg-gray-900 text-white p-4 text-center font-bold text-lg border-r border-gray-300">
                  KOMERSIL
                </div>
                <div className="bg-gray-900 text-white p-4 text-center font-bold text-lg border-r border-gray-300">
                  HARGA 200 JUTAAN
                </div>
                <div className="bg-gray-900 text-white p-4 text-center font-bold text-lg">
                  FPPR HUNIAN TERJANGKAU MILIK
                </div>
              </div>
              
              {/* ACCESSIBILITY Row */}
              <div className="grid grid-cols-3 gap-0 border-b border-gray-300">
                <div className="p-6 border-r border-gray-300 text-center">
                  <h4 className="font-bold text-lg mb-2">DP 24-72 JUTA</h4>
                  <p className="text-sm">CICILAN TERMURAH TIAP BULAN 2 JUTA</p>
                </div>
                <div className="bg-gray-900 text-white p-6 border-r border-gray-300 flex flex-col justify-center items-center">
                  <img src="/JAKHABITAT-LOGO putih-01.png" alt="Jakhabitat" className="h-12 w-auto mb-2" />
                  <div className="text-xl font-bold">ACCESSIBILITY</div>
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-bold text-lg mb-2">TANPA BIAYA DP</h4>
                  <p className="text-sm">CICILAN TERMURAH TIAP BULAN 1,5 JUTA</p>
                </div>
              </div>
              
              {/* AFFORDABILITY Row */}
              <div className="grid grid-cols-3 gap-0">
                <div className="p-6 border-r border-gray-300 text-center">
                  <h4 className="font-bold text-lg mb-2">SUKU BUNGA FLOATING</h4>
                  <p className="text-sm mb-4">MENGIKUTI RATE BI</p>
                  <p className="text-sm font-medium">HANYA MENJANGKAU MASYARAKAT BERPENGHASILAN MULAI DARI 6 JUTA PER BULAN</p>
                </div>
                <div className="bg-gray-900 text-white p-6 border-r border-gray-300 flex flex-col justify-center items-center">
                  <div className="text-xl font-bold">AFFORDABILITY</div>
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-bold text-lg mb-2">SUKU BUNGA FIX 5%</h4>
                  <p className="text-sm mb-4">HINGGA AKHIR MASA TENOR</p>
                  <p className="text-sm font-medium">DAPAT MENJANGKAU MASYARAKAT BERPENGHASILAN MULAI DARI 4,5 JUTA PER BULAN</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Syarat FPPR Section */}
      <section id="syarat" className="py-20 bg-gray-900">
        <div className="mx-auto max-w-6xl px-4">
          <SyaratFPPR />
        </div>
      </section>

      {/* Program HTM Section */}
      <section id="program-htm" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Program HTM Jakhabitat</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hunian Terjangkau Milik dengan subsidi hingga 100% untuk masyarakat Jakarta</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Tanpa Uang Muka</h3>
              <p className="text-gray-600">Pembiayaan hingga 100%</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Cicilan Tenor hingga 20 thn</h3>
              <p className="text-gray-600">Mulai dari Rp 1,2jt per bulan dengan tenor hingga 20 tahun</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Lokasi Strategis</h3>
              <p className="text-gray-600">Dekat dengan transportasi umum dan fasilitas kota Jakarta</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPR Simulator Section */}
      <section id="kpr-simulator" className="py-20 bg-gray-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Simulasi Cicilan KPR</h2>
            <p className="text-gray-300">Hitung cicilan KPR Anda dengan mudah dan akurat</p>
          </div>
          <KPRSimulator />
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
            <p className="text-gray-600">Tim Jakhabitat siap membantu Anda</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 mb-2">Instagram:</div>
              <div className="text-lg text-gray-700">@jakhabitat</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 mb-2">Call Center UPDP:</div>
              <div className="text-lg text-gray-700">021 34833711</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900 mb-2">WhatsApp Center UPDP:</div>
              <div className="text-lg text-gray-700">0812 2012 2211</div>
            </div>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Kantor UPDP dan Galeri Informasi JAKHABITAT</h3>
              <p className="text-sm text-gray-700 mb-2">Gedung Dinas Perumahan Rakyat dan Kawasan Permukiman DKI Jakarta</p>
              <p className="text-sm text-gray-600">Jl. Taman Jatibaru No.1, RT.1/RW.1, Kelurahan Cideng, Kecamatan Gambir, Kota Jakarta Pusat, DKI Jakarta, 10150</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Galeri Huni JAKHABITAT</h3>
              <p className="text-sm text-gray-700 mb-2">Kawasan Taman Literasi Christina Martha Tiahahu</p>
              <p className="text-sm text-gray-600">Jl. Sunan Kalijaga, RT.3/RW.1, Melawai, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta, 12160</p>
            </div>
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;