import React from 'react';
import { DollarSign, Phone, MapPin, FileText, HelpCircle, Gift, List, Home } from 'lucide-react';

const InfoSections = () => {
  const sections = [
    {
      id: 'htm-info',
      title: 'HTM Info',
      icon: DollarSign,
      content: 'Informasi lengkap mengenai Harga Terjangkau Milik (HTM) dan program kepemilikan rumah.',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'kontak',
      title: 'Kontak',
      icon: Phone,
      content: 'Hubungi tim kami untuk konsultasi dan informasi lebih lanjut.',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'lokasi',
      title: 'Lokasi',
      icon: MapPin,
      content: 'Temukan lokasi strategis Jakhabitat di berbagai wilayah Jakarta.',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      id: 'e-brochure',
      title: 'E-Brochure',
      icon: FileText,
      content: 'Download brosur digital dengan informasi lengkap unit dan fasilitas.',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'cara-daftar',
      title: 'Cara Daftar',
      icon: List,
      content: 'Panduan lengkap proses pendaftaran dan persyaratan yang diperlukan.',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      content: 'Pertanyaan yang sering diajukan beserta jawabannya.',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'benefits',
      title: 'Benefits',
      icon: Gift,
      content: 'Keuntungan dan fasilitas eksklusif yang didapatkan penghuni Jakhabitat.',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      id: 'unit-tour',
      title: 'Unit & Tour',
      icon: Home,
      content: 'Jelajahi berbagai tipe unit dan tur virtual 360° fasilitas.',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Informasi Lengkap Jakhabitat
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan semua yang perlu Anda ketahui tentang program hunian terjangkau Jakarta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className={`${section.bgColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              >
                <div className={`${section.iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfoSections;