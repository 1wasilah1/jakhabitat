import React from 'react';

const ProgramHTMSection: React.FC = () => {
  return (
    <section id="program-htm" className="scroll-mt-32 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Partner promotions</h3>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-4">
          {
            [
              {
                title: "Subsidi Pemerintah",
                subtitle: "Hemat hingga 30% dari harga unit",
                rate: "30%",
                partner: "Pemprov DKI",
                description: "Subsidi khusus untuk masyarakat berpenghasilan menengah"
              },
              {
                title: "KPR Bersubsidi",
                subtitle: "Bunga rendah untuk pembiayaan HTM",
                rate: "3.5%",
                partner: "Bank BTN",
                description: "Cicilan mulai Rp 2,6 juta dengan tenor hingga 15 tahun"
              },
              {
                title: "Lokasi Premium",
                subtitle: "Akses mudah ke transportasi umum",
                rate: "2 min",
                partner: "MRT Jakarta",
                description: "Dekat dengan stasiun MRT Fatmawati dan AEON Mall"
              },
              {
                title: "Investasi Menguntungkan",
                subtitle: "Potensi return investasi tinggi",
                rate: "12%",
                partner: "Property Analyst",
                description: "Capital gain dan rental yield yang menjanjikan"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.subtitle}</p>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{benefit.rate}</div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">{benefit.partner}</span>
                </div>
                
                <p className="text-xs text-gray-500">{benefit.description}</p>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default ProgramHTMSection;