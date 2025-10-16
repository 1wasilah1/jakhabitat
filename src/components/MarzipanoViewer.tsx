import React, { useEffect, useRef } from 'react';

interface MarzipanoViewerProps {
  marzipanoPath: string;
  unitName?: string;
  onBack: () => void;
}

const MarzipanoViewer: React.FC<MarzipanoViewerProps> = ({ marzipanoPath, unitName, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Marzipano project
    const iframe = document.createElement('iframe');
    iframe.src = `/jakhabitat${marzipanoPath}app-files/index.html`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = 'black';
    
    // Listen for navigation messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigate') {
        const targetPath = `/marzipano/${event.data.target}/`;
        window.location.href = `/jakhabitat${targetPath}app-files/index.html`;
      }
    };
    
    window.addEventListener('message', handleMessage);
    containerRef.current.appendChild(iframe);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [marzipanoPath]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={containerRef} className="w-full h-full" />
      
      <button
        onClick={onBack}
        className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2 z-10"
      >
        ← Back
      </button>
      

    </div>
  );
};

export default MarzipanoViewer;