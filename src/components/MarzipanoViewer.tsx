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
    
    // Inject CSS to hide scene list for all projects
    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const style = iframeDoc.createElement('style');
          style.textContent = `
            #sceneList, #sceneListToggle, #titleBar {
              display: none !important;
            }
            body.multiple-scenes #titleBar {
              left: 0 !important;
            }
            /* Standardize all control buttons */
            #autorotateToggle, #fullscreenToggle, .viewControlButton {
              width: 40px !important;
              height: 40px !important;
              padding: 8px !important;
              background-color: rgba(0,0,0,0.7) !important;
              border-radius: 8px !important;
              transition: background-color 0.3s !important;
            }
            #autorotateToggle:hover, #fullscreenToggle:hover, .viewControlButton:hover {
              background-color: rgba(0,0,0,0.9) !important;
            }
            #autorotateToggle .icon, #fullscreenToggle .icon, .viewControlButton .icon {
              width: 30px !important;
              height: 30px !important;
              top: 5px !important;
              right: 5px !important;
            }
            /* Copy exact Tower Kanaya button positions */
            #autorotateToggle {
              bottom: 16px !important;
              right: 72px !important;
            }
            #fullscreenToggle {
              bottom: 16px !important;
              right: 16px !important;
            }
            .viewControlButton-1 { bottom: 16px !important; right: 368px !important; }
            .viewControlButton-2 { bottom: 16px !important; right: 320px !important; }
            .viewControlButton-3 { bottom: 16px !important; right: 272px !important; }
            .viewControlButton-4 { bottom: 16px !important; right: 224px !important; }
            .viewControlButton-5 { bottom: 16px !important; right: 176px !important; }
            .viewControlButton-6 { bottom: 16px !important; right: 128px !important; }
          `;
          
          // Force single-scene class on body for consistent styling
          const body = iframeDoc.body;
          if (body) {
            body.classList.remove('multiple-scenes');
            body.classList.add('single-scene');
          }
          iframeDoc.head.appendChild(style);
        }
      } catch (error) {
        console.log('Could not inject CSS into iframe:', error);
      }
    };
    
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
← Kembali
      </button>
      

    </div>
  );
};

export default MarzipanoViewer;