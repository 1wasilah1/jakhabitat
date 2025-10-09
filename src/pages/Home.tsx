import React from 'react';
import placeholderImage from '@/assets/placeholder.svg';
import { Home, Eye } from 'lucide-react';

const Home = () => {
  const handleUnitClick = () => {
    alert('Unit hotspot clicked!');
  };

  const handleTourClick = () => {
    alert('Tour hotspot clicked!');
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <img src={placeholderImage} alt="Home Placeholder" className="w-full h-full object-cover" />

      {/* Hotspot for Unit */}
      <div
        className="absolute top-10 left-10 cursor-pointer shadow-lg bg-white bg-opacity-90 rounded-full p-4 flex flex-col items-center border-2 border-blue-500"
        onClick={handleUnitClick}
      >
        <Home size={24} className="text-blue-600" />
        <span className="text-sm font-semibold text-gray-800 mt-1">Unit</span>
      </div>

      {/* Hotspot for Tour */}
      <div
        className="absolute bottom-10 right-10 cursor-pointer shadow-lg bg-white bg-opacity-90 rounded-full p-4 flex flex-col items-center border-2 border-green-500"
        onClick={handleTourClick}
      >
        <Eye size={24} className="text-green-600" />
        <span className="text-sm font-semibold text-gray-800 mt-1">Tour</span>
      </div>
    </div>
  );
};

export default Home;