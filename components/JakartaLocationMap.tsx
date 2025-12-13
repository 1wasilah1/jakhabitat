import React from 'react';

const JakartaLocationMap: React.FC = () => {
  return (
    <div className="relative w-full h-[500px] bg-white rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 700 500"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Jakarta Barat - Kuning */}
        <path
          d="M50 150 L180 130 L200 180 L190 220 L170 260 L140 290 L100 300 L70 280 L50 240 L45 200 Z"
          fill="#FDE047"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Jakarta Utara - Biru */}
        <path
          d="M180 130 L350 110 L420 120 L460 140 L480 170 L470 200 L450 220 L400 230 L350 235 L300 240 L250 235 L200 230 L200 180 Z"
          fill="#3B82F6"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Jakarta Pusat - Merah */}
        <path
          d="M200 180 L200 230 L250 235 L300 240 L350 235 L400 230 L420 250 L410 280 L380 300 L340 310 L300 315 L250 310 L200 305 L180 280 L190 220 Z"
          fill="#EF4444"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Jakarta Timur - Hijau */}
        <path
          d="M400 230 L450 220 L470 200 L510 210 L550 230 L580 260 L600 300 L590 340 L570 380 L540 410 L500 430 L460 440 L420 435 L390 410 L370 380 L360 350 L370 320 L380 300 L410 280 L420 250 Z"
          fill="#22C55E"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Jakarta Selatan - Pink */}
        <path
          d="M190 220 L180 280 L200 305 L250 310 L300 315 L340 310 L380 300 L370 320 L360 350 L370 380 L390 410 L360 440 L320 460 L280 470 L240 465 L200 450 L160 430 L130 400 L120 370 L130 340 L140 290 L170 260 Z"
          fill="#EC4899"
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Garis batas kecamatan halus */}
        <g stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.6">
          {/* Jakarta Barat */}
          <path d="M80 180 L120 200 L150 220" />
          <path d="M90 220 L130 240 L160 250" />
          <path d="M110 260 L140 270" />
          
          {/* Jakarta Utara */}
          <path d="M220 150 L280 160 L340 170" />
          <path d="M300 140 L360 150 L420 160" />
          <path d="M250 190 L320 200 L390 210" />
          
          {/* Jakarta Pusat */}
          <path d="M230 250 L290 260 L350 270" />
          <path d="M260 280 L320 290 L380 300" />
          
          {/* Jakarta Timur */}
          <path d="M440 250 L500 270 L560 290" />
          <path d="M470 300 L530 320 L580 340" />
          <path d="M450 350 L510 370 L570 390" />
          <path d="M430 380 L490 400 L540 420" />
          
          {/* Jakarta Selatan */}
          <path d="M220 330 L280 340 L340 350" />
          <path d="M240 380 L300 390 L360 400" />
          <path d="M200 420 L260 430 L320 440" />
        </g>
        
        {/* Markers dan garis penunjuk */}
        {/* Sentraland Cengkareng */}
        <circle cx="120" cy="220" r="5" fill="#000000" />
        <line x1="120" y1="220" x2="80" y2="180" stroke="#000000" strokeWidth="2" />
        
        {/* Bandar Kemayoran */}
        <circle cx="350" cy="180" r="5" fill="#000000" />
        <line x1="350" y1="180" x2="390" y2="140" stroke="#000000" strokeWidth="2" />
        
        {/* Menara Samawa */}
        <circle cx="450" cy="350" r="5" fill="#000000" />
        <line x1="450" y1="350" x2="410" y2="310" stroke="#000000" strokeWidth="2" />
        
        {/* Menara Swasana */}
        <circle cx="480" cy="380" r="5" fill="#000000" />
        <line x1="480" y1="380" x2="520" y2="420" stroke="#000000" strokeWidth="2" />
        
        {/* Menara Kanaya */}
        <circle cx="520" cy="420" r="5" fill="#000000" />
        <line x1="520" y1="420" x2="560" y2="460" stroke="#000000" strokeWidth="2" />
        
        {/* Foto building dalam lingkaran */}
        {/* Sentraland Cengkareng */}
        <circle cx="60" cy="160" r="25" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <rect x="45" y="145" width="30" height="20" fill="#60A5FA" rx="3" />
        <rect x="48" y="148" width="6" height="6" fill="#ffffff" />
        <rect x="56" y="148" width="6" height="6" fill="#ffffff" />
        <rect x="64" y="148" width="6" height="6" fill="#ffffff" />
        <rect x="48" y="156" width="6" height="6" fill="#ffffff" />
        <rect x="56" y="156" width="6" height="6" fill="#ffffff" />
        <rect x="64" y="156" width="6" height="6" fill="#ffffff" />
        
        {/* Bandar Kemayoran */}
        <circle cx="410" cy="120" r="25" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <rect x="395" y="105" width="30" height="20" fill="#F59E0B" rx="3" />
        <rect x="398" y="108" width="6" height="6" fill="#ffffff" />
        <rect x="406" y="108" width="6" height="6" fill="#ffffff" />
        <rect x="414" y="108" width="6" height="6" fill="#ffffff" />
        <rect x="398" y="116" width="6" height="6" fill="#ffffff" />
        <rect x="406" y="116" width="6" height="6" fill="#ffffff" />
        <rect x="414" y="116" width="6" height="6" fill="#ffffff" />
        
        {/* Menara Samawa */}
        <circle cx="390" cy="290" r="25" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <rect x="375" y="275" width="30" height="20" fill="#10B981" rx="3" />
        <rect x="378" y="278" width="6" height="6" fill="#ffffff" />
        <rect x="386" y="278" width="6" height="6" fill="#ffffff" />
        <rect x="394" y="278" width="6" height="6" fill="#ffffff" />
        <rect x="378" y="286" width="6" height="6" fill="#ffffff" />
        <rect x="386" y="286" width="6" height="6" fill="#ffffff" />
        <rect x="394" y="286" width="6" height="6" fill="#ffffff" />
        
        {/* Menara Swasana */}
        <circle cx="540" cy="440" r="25" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <rect x="525" y="425" width="30" height="20" fill="#8B5CF6" rx="3" />
        <rect x="528" y="428" width="6" height="6" fill="#ffffff" />
        <rect x="536" y="428" width="6" height="6" fill="#ffffff" />
        <rect x="544" y="428" width="6" height="6" fill="#ffffff" />
        <rect x="528" y="436" width="6" height="6" fill="#ffffff" />
        <rect x="536" y="436" width="6" height="6" fill="#ffffff" />
        <rect x="544" y="436" width="6" height="6" fill="#ffffff" />
        
        {/* Menara Kanaya */}
        <circle cx="580" cy="480" r="25" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <rect x="565" y="465" width="30" height="20" fill="#059669" rx="3" />
        <rect x="568" y="468" width="6" height="6" fill="#ffffff" />
        <rect x="576" y="468" width="6" height="6" fill="#ffffff" />
        <rect x="584" y="468" width="6" height="6" fill="#ffffff" />
        <rect x="568" y="476" width="6" height="6" fill="#ffffff" />
        <rect x="576" y="476" width="6" height="6" fill="#ffffff" />
        <rect x="584" y="476" width="6" height="6" fill="#ffffff" />
        
        {/* Label kotak putih */}
        <rect x="20" y="100" width="120" height="35" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="3" />
        <text x="80" y="115" textAnchor="middle" className="text-sm font-bold fill-black">
          Sentraland Cengkareng
        </text>
        <text x="80" y="130" textAnchor="middle" className="text-xs fill-gray-700">
          Jakarta Barat
        </text>
        
        <rect x="350" y="60" width="120" height="35" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="3" />
        <text x="410" y="75" textAnchor="middle" className="text-sm font-bold fill-black">
          Bandar Kemayoran
        </text>
        <text x="410" y="90" textAnchor="middle" className="text-xs fill-gray-700">
          Jakarta Utara
        </text>
        
        <rect x="330" y="230" width="120" height="35" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="3" />
        <text x="390" y="245" textAnchor="middle" className="text-sm font-bold fill-black">
          - Menara Samawa
        </text>
        <text x="390" y="260" textAnchor="middle" className="text-xs fill-gray-700">
          - Menara Swasana
        </text>
        
        <rect x="480" y="380" width="120" height="35" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="3" />
        <text x="540" y="395" textAnchor="middle" className="text-sm font-bold fill-black">
          Menara Kanaya
        </text>
        <text x="540" y="410" textAnchor="middle" className="text-xs fill-gray-700">
          Jakarta Timur
        </text>
        
        <text x="390" y="275" textAnchor="middle" className="text-xs fill-gray-700">
          Jakarta Timur
        </text>
        
        {/* Diamond accent */}
        <polygon points="620,400 635,415 620,430 605,415" fill="#F59E0B" />
      </svg>
    </div>
  );
};

export default JakartaLocationMap;