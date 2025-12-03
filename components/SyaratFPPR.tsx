import React from 'react';

const SyaratFPPR = () => {
  const requirements = [
    {
      icon: "📄",
      title: "Memiliki e-KTP DKI Jakarta dan Kartu Keluarga DKI Jakarta",
      color: "bg-orange-500",
      position: "left"
    },
    {
      icon: "🏠",
      title: "Belum memiliki rumah dibuktikan dengan surat keterangan yang diketahui oleh Lurah setempat",
      color: "bg-red-500",
      position: "right"
    },
    {
      icon: "🚫",
      title: "Tidak sedang menerima subsidi perumahan dari Pemerintah Pusat atau Pemerintah Daerah",
      color: "bg-purple-600",
      position: "left"
    },
    {
      icon: "💒",
      title: "Bagi yang telah menikah, wajib memiliki surat nikah/akta nikah yang dikeluarkan oleh instansi yang berwenang",
      color: "bg-blue-600",
      position: "right"
    },
    {
      icon: "📋",
      title: "Memiliki Nomor Pokok Wajib Pajak (NPWP)",
      color: "bg-green-500",
      position: "left"
    },
    {
      icon: "💰",
      title: "Memiliki penghasilan tidak melebihi Rp14,8 juta (lajang atau gabungan untuk pasangan suami istri yang berpenghasilan)",
      color: "bg-indigo-600",
      position: "right"
    },
    {
      icon: "🏦",
      title: "Memenuhi syarat kredit sesuai aturan perbankan",
      color: "bg-teal-500",
      position: "left"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12 leading-tight">
          SYARAT-SYARAT PENERIMA MANFAAT<br />
          PROGRAM FPPR HUNIAN TERJANGKAU MILIK
        </h1>
        
        <div className="space-y-6">
          {requirements.map((req, index) => (
            <div key={index} className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
              req.position === 'right' ? 'ml-8' : 'mr-8'
            }`}>
              <div className={`flex items-center ${
                req.position === 'right' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className={`${req.color} text-white p-6 flex items-center justify-center min-w-[120px]`}>
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mr-4">
                    <span className="text-2xl">
                      {req.icon}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {req.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SyaratFPPR;