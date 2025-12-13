import React from 'react';

const SyaratFPPR = () => {
  const requirements = [
    {
      icon: "https://img.icons8.com/?size=96&id=85046&format=png",
      title: "Memiliki e-KTP DKI Jakarta dan Kartu Keluarga DKI Jakarta",
      color: "bg-orange-500",
      position: "left"
    },
    {
      icon: "https://img.icons8.com/?size=96&id=85042&format=png",
      title: "Belum memiliki rumah dibuktikan dengan surat keterangan yang diketahui oleh Lurah setempat",
      color: "bg-red-500",
      position: "right"
    },
    {
      icon: "https://img.icons8.com/?size=96&id=85039&format=png",
      title: "Tidak sedang menerima subsidi perumahan dari Pemerintah Pusat atau Pemerintah Daerah",
      color: "bg-purple-600",
      position: "left"
    },
    {
      icon: "https://img.icons8.com/?size=96&id=85058&format=png",
      title: "Bagi yang telah menikah, wajib memiliki surat nikah/akta nikah yang dikeluarkan oleh instansi yang berwenang",
      color: "bg-blue-600",
      position: "right"
    },
    {
      icon: "https://img.icons8.com/?size=96&id=85041&format=png",
      title: "Memiliki Nomor Pokok Wajib Pajak (NPWP)",
      color: "bg-green-500",
      position: "left"
    },
    {
      icon: "https://img.icons8.com/?size=96&id=85050&format=png",
      title: "Memiliki penghasilan tidak melebihi Rp14,8 juta (lajang atau gabungan untuk pasangan suami istri yang berpenghasilan)",
      color: "bg-indigo-600",
      position: "right"
    },
    {
      icon: "https://img.icons8.com/?size=96&id=85037&format=png",
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
        
        <style jsx>{`
          @keyframes slideLeftRight {
            0% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            100% { transform: translateX(-10px); }
          }
          @keyframes slideRightLeft {
            0% { transform: translateX(10px); }
            50% { transform: translateX(-10px); }
            100% { transform: translateX(10px); }
          }
          .slide-left {
            animation: slideLeftRight 4s ease-in-out infinite;
          }
          .slide-right {
            animation: slideRightLeft 4s ease-in-out infinite;
          }
        `}</style>
        <div className="space-y-6">
          {requirements.map((req, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                req.position === 'right' ? 'ml-8 slide-right' : 'mr-8 slide-left'
              }`}
            >
              <div className={`flex items-center ${
                req.position === 'right' ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className={`${req.color} text-white p-6 flex items-center justify-center min-w-[120px]`}>
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mr-4">
                    <img src={req.icon} alt="" className="w-10 h-10" />
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
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