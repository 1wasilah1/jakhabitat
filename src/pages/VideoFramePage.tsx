import { VideoFrameExtractor } from '../components/VideoFrameExtractor';

export const VideoFramePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Frame Extractor
          </h1>
          <p className="text-gray-600">
            Upload MP4 video dan konversi menjadi frame gambar
          </p>
        </div>
        <VideoFrameExtractor />
      </div>
    </div>
  );
};