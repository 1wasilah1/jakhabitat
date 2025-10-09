import React, { useState } from 'react';
import Object360Viewer from './Object360Viewer';

const Object360ViewerWithSwitch: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<'main' | 'unit' | 'carousel'>('main');

  const mainVideoData = {
    images: Array.from({length: 591}, (_, i) => `/jakhabitat/frame1/frame_${String(i + 1).padStart(3, '0')}.jpg`),
    hotspots: [
      {
        x: '53.9%',
        y: '57.3%',
        label: 'Unit & Tour',
        frame: 586,
        onClick: () => setCurrentVideo('unit')
      },
      {
        x: '45.9%',
        y: '57.6%',
        label: 'CAP & CIP',
        frame: 413,
        onClick: () => window.open('https://dprkp.jakarta.go.id/', '_blank')
      },
      {
        x: '44.5%',
        y: '70.1%',
        label: 'SIGAPKUMUH',
        frame: 92,
        onClick: () => window.open('https://dprkp.jakarta.go.id/sigapkumuh/', '_blank')
      }
    ]
  };

  const unitVideoData = {
    images: Array.from({length: 1374}, (_, i) => `/jakhabitat/gedung/frames_dprkp/frame_${String(i + 1).padStart(3, '0')}.jpg`),
    hotspots: [
      {
        x: '10%',
        y: '10%',
        label: 'Kembali',
        frame: 50,
        onClick: () => setCurrentVideo('main')
      },
      {
        x: '95%',
        y: '50%',
        label: '▶',
        frame: 1,
        onClick: () => setCurrentVideo('carousel')
      },
      {
        x: '5%',
        y: '50%',
        label: '◀',
        frame: 1,
        onClick: () => setCurrentVideo('carousel')
      }
    ]
  };

  const carouselVideoData = {
    images: Array.from({length: 129}, (_, i) => `/jakhabitat/frames_carousel/frame_${String(i + 1).padStart(3, '0')}.jpg`),
    hotspots: [
      {
        x: '10%',
        y: '10%',
        label: 'Kembali',
        frame: 20,
        onClick: () => setCurrentVideo('unit')
      },
      {
        x: '95%',
        y: '50%',
        label: '▶',
        frame: 1,
        onClick: () => setCurrentVideo('unit')
      },
      {
        x: '5%',
        y: '50%',
        label: '◀',
        frame: 1,
        onClick: () => setCurrentVideo('unit')
      }
    ]
  };

  const currentData = currentVideo === 'main' ? mainVideoData : 
                      currentVideo === 'unit' ? unitVideoData : carouselVideoData;

  return (
    <Object360Viewer 
      images={currentData.images}
      className="w-full h-screen"
      hotspots={currentData.hotspots}
    />
  );
};

export default Object360ViewerWithSwitch;