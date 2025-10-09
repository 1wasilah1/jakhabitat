import React from 'react';

const DownloadSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-white">
      {/* Property Detail Layout */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left - Image Gallery */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="col-span-2">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop" 
                alt="HTM Jakhabitat Main" 
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <img 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop" 
              alt="HTM Interior" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" 
                alt="HTM Exterior" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                Show All Photos
                <span className="ml-2">12</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex gap-3">
            <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Save
            </button>
            <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>
          
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Jakarta Selatan, Indonesia
            </div>
          </div>
        </div>
        
        {/* Right - Property Details */}
        <div className="p-8">
          <div className="mb-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">Rp 2,600,000</div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm underline">
              Calculate mortgage
            </button>
          </div>
          
          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">45</div>
              <div className="text-sm text-gray-600">m²</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-sm text-gray-600">floors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-sm text-gray-600">beds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-sm text-gray-600">baths</div>
            </div>
          </div>
          
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm underline mb-8">
            All Technical specifications
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              MRT view
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              City view
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">JH</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estate agency</div>
                <div className="font-semibold text-gray-900">Jakhabitat Team</div>
              </div>
            </div>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded font-medium transition-colors">
              Contact Agent
            </button>
          </div>
          
          <div className="text-sm text-gray-600 leading-relaxed">
            Program HTM (Hunian Terjangkau Milik) Jakhabitat menawarkan hunian berkualitas dengan subsidi pemerintah hingga 30%. Berlokasi strategis di TB Simatupang dengan akses mudah ke MRT dan fasilitas kota.
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;