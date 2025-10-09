import React from 'react';

const SyaratSection: React.FC = () => {
  return (
    <section id="syarat" className="scroll-mt-32 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Popular searches</h3>
          <div className="flex justify-end">
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {
            [
              {
                image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
                title: "Syarat Pendaftaran HTM",
                subtitle: "WNI 21-55 tahun, KTP DKI Jakarta"
              },
              {
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
                title: "Dokumen Persyaratan", 
                subtitle: "KTP, Slip Gaji, Rekening Koran"
              },
              {
                image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
                title: "Proses Verifikasi",
                subtitle: "Survey lapangan & interview"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-gray-200">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default SyaratSection;