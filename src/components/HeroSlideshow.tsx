import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Search, DollarSign, Phone, MapPin, FileText, HelpCircle, Gift, List, Home } from "lucide-react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type HotspotKey = 'unit-tour' | 'htm' | 'kontak' | 'lokasi' | 'ebrochure' | 'cara-daftar' | 'faq' | 'benefit';

interface FullscreenHotspot {
  key: HotspotKey;
  label: string;
  href?: string;
  x: number; // px from left
  y: number; // px from top
}

interface HeroSlideshowProps {
  images: string[]; // background/hero images
  autoPlay?: boolean;
  interval?: number; // ms
  onSearch?: (query: string) => void; // optional handler when user submits search
  placeholderSearch?: string; // placeholder text
  fullscreenHotspots?: FullscreenHotspot[]; // pinned hotspots for fullscreen (absolute screen coords)
}

// Small helper to wrap index within [0, length)
const wrapIndex = (i: number, length: number) => (i + length) % length;

// Simple equirectangular 360 sphere with hotspots
const PanoramaSphere: React.FC<{ src: string; hotspots?: Array<{x: number, y: number, label: string, href: string, icon: string}>, onHotspotUpdate?: (positions: any[]) => void }> = ({ src, hotspots = [], onHotspotUpdate }) => {
  const texture = useLoader(THREE.TextureLoader, src);
  const { camera, size } = useThree();
  
  // Convert 2D coordinates to 3D sphere positions
  const convertTo3D = (x: number, y: number, radius = 25) => {
    const xPercent = x / window.innerWidth;
    const yPercent = y / window.innerHeight;
    
    const phi = xPercent * Math.PI * 2;
    const theta = (1 - yPercent) * Math.PI;
    
    return [
      -radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi)
    ];
  };
  
  // Update screen positions for HTML overlay
  React.useEffect(() => {
    if (onHotspotUpdate) {
      const positions = hotspots.map(hotspot => {
        const [x, y, z] = convertTo3D(hotspot.x, hotspot.y);
        const vector = new THREE.Vector3(x, y, z);
        vector.project(camera);
        
        const screenX = (vector.x * 0.5 + 0.5) * size.width;
        const screenY = (vector.y * -0.5 + 0.5) * size.height;
        
        return {
          ...hotspot,
          screenPos: { x: screenX, y: screenY }
        };
      });
      onHotspotUpdate(positions);
    }
  });
  
  return (
    <group>
      <mesh scale={[-50, 50, 50]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      
      {/* Invisible 3D Hotspots for interaction */}
      {hotspots.map((hotspot, index) => {
        const [x, y, z] = convertTo3D(hotspot.x, hotspot.y);
        return (
          <mesh
            key={index}
            position={[x, y, z]}
            onClick={() => window.open(hotspot.href, '_self')}
          >
            <sphereGeometry args={[2]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        );
      })}
    </group>
  );
};

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({
  images,
  autoPlay = true,
  interval = 5000,
  onSearch,
  placeholderSearch = "Cari unit, fasilitas, lokasi...",
  fullscreenHotspots,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const [hotspotPositions, setHotspotPositions] = useState([]);

  // Keep local state in sync with actual fullscreen status
  useEffect(() => {
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (fs) {
        // Reset any swipe/drag state when entering fullscreen
        setDragX(0);
        setIsDragging(false);
        isSwipingRef.current = false;
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const t = setInterval(() => {
      // Prevent auto-advance while in fullscreen
      if (isFullscreen) return;
      setCurrentIndex((p) => (p + 1) % images.length);
    }, interval);
    return () => clearInterval(t);
  }, [autoPlay, images.length, interval, isFullscreen]);

  const goPrev = () => {
    if (isFullscreen) return; // block switching while fullscreen
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  };
  const goNext = () => {
    if (isFullscreen) return; // block switching while fullscreen
    setCurrentIndex((p) => (p + 1) % images.length);
  };

  // Swipe/drag for active card (works with 360 Canvas)
  const isSwipingRef = useRef(false);
  const gestureRef = useRef<{ startX: number; startY: number; lastX: number; lastY: number; pointerId: number | null }>({ startX: 0, startY: 0, lastX: 0, lastY: 0, pointerId: null });
  const [dragX, setDragX] = useState<number>(0); // current horizontal drag offset (px)
  const [isDragging, setIsDragging] = useState<boolean>(false); // whether deck should follow finger
  const onCanvasPointerDown = (e: React.PointerEvent) => {
    // Block swipe gesture init while fullscreen
    if (isFullscreen) return;
    // Ignore non-primary mouse buttons; allow touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    gestureRef.current = { startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, pointerId: e.pointerId };
    isSwipingRef.current = false;
    setIsDragging(false);
    setDragX(0);
    // Capture pointer to keep receiving events
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
  };
  const onCanvasPointerMove = (e: React.PointerEvent) => {
    // Block swipe updates while fullscreen
    if (isFullscreen) return;

    const g = gestureRef.current;
    // Only react if we have an active pointer from a prior pointerdown and it's the same pointer
    if (g.pointerId === null || e.pointerId !== g.pointerId || e.buttons === 0) return;

    g.lastX = e.clientX;
    g.lastY = e.clientY;
    const dx = g.lastX - g.startX;
    const dy = g.lastY - g.startY;
    // Decide when gesture becomes a horizontal swipe
    if (!isSwipingRef.current && Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwipingRef.current = true; // from now, treat as swipe (disable OrbitControls)
      setIsDragging(true);
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSwipingRef.current) {
      setDragX(dx); // move the deck with the finger
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const onCanvasPointerUp = (e: React.PointerEvent) => {
    // Block swipe release logic while fullscreen
    if (isFullscreen) return;

    const g = gestureRef.current;
    const dx = g.lastX - g.startX;
    const threshold = 60; // pixels
    if (isSwipingRef.current) {
      if (dx <= -threshold) goNext();
      else if (dx >= threshold) goPrev();
    }
    // reset drag visual state
    setDragX(0);
    setIsDragging(false);
    isSwipingRef.current = false;
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
  };

  // Fullscreen handling for the center card
  const centerCardRef = useRef<HTMLDivElement | null>(null);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (centerCardRef.current) {
        await centerCardRef.current.requestFullscreen();
      }
    } catch (e) {
      // noop
    }
  };

  // Compute 5 visible cards around the center (fan-out)
  const fanItems = useMemo(() => {
    const around = [-2, -1, 0, 1, 2];
    return around.map((offset) => ({
      key: wrapIndex(currentIndex + offset, images.length),
      offset,
      isCenter: offset === 0,
    }));
  }, [currentIndex, images.length]);

  // Styling map for perspective cards
  const pose = (offset: number) => {
    const config: Record<number, { r: number; x: number; y: number; s: number; z: number; opacity: number }> = {
      [-2]: { r: -8, x: -640, y: 48, s: 0.92, z: 5, opacity: 0.9 },
      [-1]: { r: -4, x: -320, y: 22, s: 0.97, z: 10, opacity: 0.95 },
      [0]: { r: 0, x: 0, y: 0, s: 1, z: 30, opacity: 1 },
      [1]: { r: 4, x: 320, y: 22, s: 0.97, z: 10, opacity: 0.95 },
      [2]: { r: 8, x: 640, y: 48, s: 0.92, z: 5, opacity: 0.9 },
    };
    return config[offset as -2 | -1 | 0 | 1 | 2];
  };

  if (!images?.length) return null;

  return (
    <div className="relative w-full h-full bg-gray-200 overflow-hidden">

      {/* Top header and search navigation */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-[60] flex flex-col items-center justify-start pt-6 md:pt-8 px-4">
        <div className="absolute left-4 top-6 md:left-6 md:top-8 pointer-events-none">
          <img
            src="/JAKHABITAT-LOGO putih-01.png"
            alt="JAKHABITAT"
            className="h-16 md:h-24 lg:h-28 w-auto select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            draggable={false}
            onError={(e) => {
              const fallback = '/JAKHABITAT-LOGO-01.png';
              if (e.currentTarget.src !== (window.location.origin + fallback)) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        </div>
        <h1
          className="text-orange-500 font-display text-2xl md:text-4xl font-semibold tracking-wide text-center"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          Galeri Huni
        </h1>
        <form
          className="pointer-events-auto mt-2 w-full max-w-xl flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/50 rounded-lg px-3 py-2 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.elements.namedItem('q') as HTMLInputElement | null;
            const q = input?.value?.trim() ?? '';
            if (onSearch && q) onSearch(q);
          }}
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-gray-600" />
          <input
            name="q"
            type="text"
            placeholder={placeholderSearch}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-500"
          />
          {onSearch && (
            <button
              type="submit"
              className="text-sm bg-black text-white px-3 py-1.5 rounded-md hover:bg-black/90"
            >
              Cari
            </button>
          )}
        </form>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/40 text-white p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/40 text-white p-2 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Fan-out perspective cards near bottom (visual showcase) */}
      <div className="absolute left-1/2 bottom-12 md:bottom-20 -translate-x-1/2">
        <div className="relative h-[560px] w-[2400px]">
          {fanItems.map(({ key, offset, isCenter }) => {
            const p = pose(offset);
            const idx = (offset + 2) as 0 | 1 | 2 | 3 | 4; // map -2..2 -> 0..4
            const attenuation = [0.4, 0.7, 1, 0.7, 0.4][idx];
            const shiftX = isDragging ? dragX * attenuation : 0;
            return (
              <div
                key={`${key}-${offset}`}
                className="absolute left-1/2 bottom-0 will-change-transform"
                style={{
                  transform: `translateX(-50%) translateX(${p.x + shiftX}px) translateY(${p.y}px) rotate(${p.r}deg) scale(${p.s})`,
                  zIndex: p.z,
                  opacity: p.opacity,
                  transition: isDragging ? "opacity 400ms ease" : "transform 400ms ease, opacity 400ms ease",
                }}
              >
                {/* Card shell */}
                <div
                  ref={isCenter ? centerCardRef : undefined}
                  className={`relative w-[960px] h-[576px] rounded-md shadow-2xl overflow-hidden bg-white ${isCenter ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  {/* Photo fills the card */}
                  {isCenter ? (
                    <Canvas
                      camera={{ position: [0, 0, 0.1], fov: 75 }}
                      className="absolute inset-0"
                      onPointerDown={onCanvasPointerDown}
                      onPointerMove={onCanvasPointerMove}
                      onPointerUp={onCanvasPointerUp}
                      onPointerCancel={onCanvasPointerUp}
                    >
                      <PanoramaSphere 
                        src={images[key]} 
                        hotspots={isFullscreen ? [
                          { x: 338, y: 156, label: 'Unit & Tour', href: '#unit-tour', icon: 'Home' },
                          { x: 520, y: 200, label: 'HTM... Apaan tuh?', href: '#htm', icon: 'DollarSign' },
                          { x: 720, y: 260, label: 'Kontak Kami!', href: '#kontak', icon: 'Phone' },
                          { x: 860, y: 320, label: 'Lokasi', href: '#lokasi', icon: 'MapPin' },
                          { x: 1040, y: 160, label: 'E-Brochure', href: '#ebrochure', icon: 'FileText' },
                          { x: 1200, y: 220, label: 'Cara Daftarnya?', href: '#cara-daftar', icon: 'List' },
                          { x: 1340, y: 280, label: 'FAQ', href: '#faq', icon: 'HelpCircle' },
                          { x: 1480, y: 340, label: 'Benefitnya apa aja nih?', href: '#benefit', icon: 'Gift' }
                        ] : []}
                        onHotspotUpdate={setHotspotPositions}
                      />
                      <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        enableRotate={!isSwipingRef.current}
                        enableDamping={true}
                        dampingFactor={0.05}
                        autoRotate={true}
                        autoRotateSpeed={0.4} // slow, subtle rotation
                        minDistance={0.1}
                        maxDistance={1}
                      />
                    </Canvas>
                  ) : (
                    <img
                      src={images[key]}
                      alt={`Thumbnail ${key + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {/* White strip at bottom to match reference design */}
                  <div className="absolute left-0 right-0 bottom-0 h-7 bg-white" />

                  {/* Fullscreen button only on center card */}
                  {isCenter && (
                    <>
                      <button
                        onClick={toggleFullscreen}
                        aria-label="Fullscreen"
                        className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md"
                        title="Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      
                      {/* Icon Hotspots Overlay */}
                      {isFullscreen && hotspotPositions.map((hotspot, index) => {
                        const Icon = 
                          hotspot.icon === 'Home' ? Home :
                          hotspot.icon === 'DollarSign' ? DollarSign :
                          hotspot.icon === 'Phone' ? Phone :
                          hotspot.icon === 'MapPin' ? MapPin :
                          hotspot.icon === 'FileText' ? FileText :
                          hotspot.icon === 'List' ? List :
                          hotspot.icon === 'HelpCircle' ? HelpCircle :
                          Gift;
                        return (
                          <a
                            key={index}
                            href={hotspot.href}
                            className="absolute inline-flex items-center gap-2 bg-black/65 hover:bg-black/80 text-white px-3 py-2 rounded-full shadow-md text-xs z-20"
                            style={{ 
                              left: `${hotspot.screenPos.x}px`, 
                              top: `${hotspot.screenPos.y}px`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="whitespace-nowrap">{hotspot.label}</span>
                          </a>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {/* Top blurred shadow overlay across all cards */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-28 z-50">
            <div className="w-full h-full bg-gradient-to-b from-black/35 to-transparent blur-sm" />
          </div>
        </div>
        {/* Subtle drop shadow under the center card */}
        <div className="mx-auto mt-3 h-3 w-72 rounded-full bg-black/25 blur-sm" />
      </div>

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-6 bg-white" : "w-3 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlideshow;