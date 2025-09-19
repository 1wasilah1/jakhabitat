import HeroSlideshow from '@/components/HeroSlideshow';
import buildingExterior from '@/assets/building-exterior.jpg';
import roomInterior from '@/assets/room-interior.jpg';

const SlideshowPage = () => {
  const images = [
    buildingExterior,
    roomInterior,
    buildingExterior,
    roomInterior
  ];

  return (
    <div className="w-full h-screen">
      <HeroSlideshow 
        images={images}
        autoPlay={false}
        interval={4000}
      />
    </div>
  );
};

export default SlideshowPage;