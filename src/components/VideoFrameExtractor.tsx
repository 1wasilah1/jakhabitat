import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Download, Upload, Play } from 'lucide-react';

interface ExtractedFrame {
  blob: Blob;
  timestamp: number;
  url: string;
}

export const VideoFrameExtractor: React.FC = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameInterval, setFrameInterval] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      setFrames([]);
    }
  };

  const extractFrames = async () => {
    if (!video || !videoRef.current || !canvasRef.current) return;

    setIsExtracting(true);
    setProgress(0);
    const extractedFrames: ExtractedFrame[] = [];

    const videoElement = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    videoElement.src = URL.createObjectURL(video);
    
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        resolve(void 0);
      };
    });

    const duration = videoElement.duration;
    const totalFrames = Math.floor(duration / frameInterval);

    for (let i = 0; i < totalFrames; i++) {
      const timestamp = i * frameInterval;
      
      await new Promise((resolve) => {
        videoElement.currentTime = timestamp;
        videoElement.onseeked = () => {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              extractedFrames.push({
                blob,
                timestamp,
                url: URL.createObjectURL(blob)
              });
            }
            setProgress(((i + 1) / totalFrames) * 100);
            resolve(void 0);
          }, 'image/jpeg', 0.8);
        };
      });
    }

    setFrames(extractedFrames);
    setIsExtracting(false);
    URL.revokeObjectURL(videoElement.src);
  };

  const downloadFrame = (frame: ExtractedFrame, index: number) => {
    const link = document.createElement('a');
    link.href = frame.url;
    link.download = `frame_${index + 1}_${frame.timestamp.toFixed(2)}s.jpg`;
    link.click();
  };

  const downloadAllFrames = () => {
    frames.forEach((frame, index) => {
      setTimeout(() => downloadFrame(frame, index), index * 100);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Video Frame Extractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleVideoUpload}
              className="flex-1"
            />
            <Button
              onClick={extractFrames}
              disabled={!video || isExtracting}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Extract Frames
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Frame Interval (seconds):</label>
            <Input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={frameInterval}
              onChange={(e) => setFrameInterval(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>

          {isExtracting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extracting frames...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {frames.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {frames.length} frames extracted
              </span>
              <Button
                onClick={downloadAllFrames}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {frames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Frames</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {frames.map((frame, index) => (
                <div key={index} className="relative group">
                  <img
                    src={frame.url}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => downloadFrame(frame, index)}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {frame.timestamp.toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};