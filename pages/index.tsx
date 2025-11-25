import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LayerViewer from '../components/LayerViewer';
import KPRSimulator from '../components/KPRSimulator';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Program HTM', href: '#program-htm' },
  { label: 'Syarat', href: '#syarat' },
  { label: 'Download', href: '#download' },
  { label: 'Kontak', href: '#kontak' },
  { label: 'FAQ', href: '#faq' },
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
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out text-white ${
          isPanoramaMode ? '-top-24 opacity-0' : 'top-0 opacity-100'
        } ${
          navState === 'transparent' ? 'bg-transparent shadow-none' :
          navState === 'semi-transparent' ? 'bg-gray-800/50 shadow-md' :
          'bg-gray-900 shadow-lg'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-0">
          <Link href="/" className="flex items-center py-0" aria-label="Beranda Jakhabitat">
            <img src="/JAKHABITAT-LOGO putih-01.png" alt="Jakhabitat" className="h-16 w-auto md:h-24" />
          </Link>
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

      {/* Layer Viewer Section */}
      <section
        id="panorama"
        className="relative min-h-screen"
      >
        <LayerViewer onModeChange={setIsPanoramaMode} targetPanoramaId={targetPanoramaId} />
      </section>

      {/* Program HTM Section */}
      <section id="program-htm" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Program HTM Jakhabitat</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hunian Terjangkau Milik dengan subsidi hingga 30% untuk masyarakat Jakarta</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Subsidi Hingga 30%</h3>
              <p className="text-gray-600">Dapatkan subsidi dari Pemprov DKI Jakarta untuk hunian impian Anda</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Cicilan Terjangkau</h3>
              <p className="text-gray-600">Mulai dari Rp 2,6 juta per bulan dengan tenor hingga 15 tahun</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Lokasi Strategis</h3>
              <p className="text-gray-600">Dekat dengan transportasi umum dan fasilitas kota Jakarta</p>
            </div>
          </div>
        </div>
      </section>

      {/* KPR Simulator Section */}
      <section id="kpr-simulator" className="py-20 bg-gray-100">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simulasi Cicilan KPR</h2>
            <p className="text-gray-600">Hitung cicilan KPR Anda dengan mudah dan akurat</p>
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
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">(021) 5000-1234</div>
              <div className="text-sm text-gray-600">Marketing Gallery</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">+62 812-3456-7890</div>
              <div className="text-sm text-gray-600">WhatsApp Center</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 mb-1">info@jakhabitat.jakarta.go.id</div>
              <div className="text-sm text-gray-600">Email Support</div>
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