import React from 'react';

const SosialisasiSection: React.FC = () => {
  return (
    <section id="sosialisasi" className="scroll-mt-32 py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Materi Sosialisasi HTM Jakhabitat</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pelajari selengkapnya tentang program Hunian Terjangkau Milik (HTM) Jakhabitat melalui materi sosialisasi resmi
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* PDF Download Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mb-4 mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">Panduan Lengkap HTM</h4>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Dokumen resmi berisi informasi lengkap program HTM Jakhabitat
            </p>
            <div className="text-center">
              <a 
                href="/sosialisasi.pdf" 
                download="HTM_Jakhabitat_Sosialisasi.pdf"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh PDF
              </a>
            </div>
          </div>

          {/* Key Points */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4 mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Poin Utama</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Subsidi hingga 30% dari harga unit
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Cicilan mulai Rp 2,6 juta/bulan
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Lokasi strategis TB Simatupang
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                Fasilitas lengkap & modern
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-4 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Butuh Bantuan?</h4>
            <div className="space-y-3 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Marketing Gallery</p>
                <p className="font-semibold text-gray-900">(021) 5000-1234</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">WhatsApp</p>
                <p className="font-semibold text-gray-900">+62 812-3456-7890</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Informasi Penting</h4>
            <p className="text-gray-600">Hal-hal yang perlu diketahui sebelum mendaftar HTM Jakhabitat</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Syarat Pendaftaran:</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• WNI berusia 21-55 tahun</li>
                <li>• Memiliki KTP DKI Jakarta</li>
                <li>• Penghasilan Rp 4-15 juta/bulan</li>
                <li>• Belum memiliki rumah</li>
                <li>• Tidak sedang menerima subsidi perumahan lain</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Dokumen yang Diperlukan:</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• KTP & Kartu Keluarga</li>
                <li>• Slip gaji 3 bulan terakhir</li>
                <li>• Rekening koran 3 bulan</li>
                <li>• NPWP</li>
                <li>• Surat keterangan belum memiliki rumah</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SosialisasiSection;