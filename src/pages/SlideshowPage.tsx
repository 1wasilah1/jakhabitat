import { ImageSlideshow } from '@/components/ImageSlideshow';
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
      <ImageSlideshow 
        images={images}
        autoPlay={true}
        interval={4000}
      />
    </div>
  );
};

export default SlideshowPage;