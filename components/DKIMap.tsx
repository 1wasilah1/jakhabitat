import React from 'react';

const DKIMap: React.FC = () => {
  return (
    <div className="bg-amber-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">JAKARTA</h2>
        
        <div className="relative w-full max-w-4xl mx-auto">
          <svg
            viewBox="0 0 1000 900"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="1000" height="900" fill="#E8DCC8" />

            {/* Laut/Water di bawah */}
            <path
              d="M0 750 L1000 750 L1000 900 L0 900 Z"
              fill="#B8D4E8"
            />

            {/* Jakarta Barat - Paling kiri */}
            <path
              d="M80 150 Q70 200 75 300 Q80 400 85 500 Q90 600 100 700 L180 750 Q150 650 140 550 Q130 450 125 350 Q120 250 125 150 Q100 140 80 150 Z"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Jakarta Utara - Paling atas */}
            <path
              d="M180 150 Q250 120 350 110 Q450 100 550 105 Q650 100 750 110 Q850 120 920 150 L900 200 Q750 180 550 175 Q350 180 200 200 Z"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Jakarta Pusat - Tengah kecil */}
            <path
              d="M350 200 Q380 220 400 240 Q420 260 410 290 L380 310 Q360 290 340 270 Q325 245 350 200 Z"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Jakarta Timur - Paling kanan besar */}
            <path
              d="M550 175 Q650 170 750 180 Q850 190 920 200 L950 250 Q960 350 955 450 Q950 550 930 650 Q900 720 850 750 Q750 780 650 770 Q550 760 550 650 Q545 550 545 450 Q545 350 550 250 Q550 200 550 175 Z"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Jakarta Selatan - Paling bawah besar */}
            <path
              d="M125 350 Q140 400 160 450 Q200 500 250 550 Q350 620 450 650 Q550 680 650 670 Q750 650 850 600 Q900 550 930 500 L920 450 Q880 500 800 550 Q700 600 600 630 Q500 650 400 630 Q300 600 220 550 Q160 500 140 450 Q120 400 125 350 Z"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
            />

            {/* Internal district boundaries - garis putus-putus */}
            <g stroke="#666" strokeWidth="1" strokeDasharray="4,4" opacity="0.4">
              {/* Jakarta Barat divisions */}
              <path d="M100 200 Q110 300 120 400" />
              <path d="M130 250 Q140 350 145 500" />
              
              {/* Jakarta Utara divisions */}
              <path d="M350 150 L350 220" />
              <path d="M550 150 L550 230" />
              <path d="M750 150 L750 220" />
              
              {/* Jakarta Timur divisions */}
              <path d="M700 200 L700 600" />
              <path d="M800 190 L800 620" />
              
              {/* Jakarta Selatan divisions */}
              <path d="M300 450 Q400 520 500 600" />
              <path d="M500 500 Q600 600 700 650" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DKIMap;
