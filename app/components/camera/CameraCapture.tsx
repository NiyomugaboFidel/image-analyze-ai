import React from 'react';
import { Image, Maximize, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera } from '@/app/context/CameraProvider';

interface CameraCaptureProps {
  camera: Camera;
  onViewImage: (imageUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ camera, onViewImage }) => {
  const handleDownload = () => {
    if (!camera.lastCapture) return;

    const link = document.createElement('a');
    link.href = camera.lastCapture;
    link.download = `${camera.name.replace(/\s+/g, '-')}-${new Date().getTime()}.png`;
    link.click();
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="aspect-video bg-gray-900 relative">
        {camera.lastCapture ? (
          <img
            src={camera.lastCapture}
            alt={`${camera.name} capture`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <Image size={48} className="text-gray-400 mb-2" />
            <span className="text-gray-300">No captures yet</span>
          </div>
        )}

        {/* Camera details */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <Badge variant="outline" className="bg-gray-800 bg-opacity-75 text-white">
            {camera.name}
          </Badge>
        </div>

        {/* Capture controls */}
        {camera.lastCapture && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 p-1 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={() => camera.lastCapture && onViewImage(camera.lastCapture)}
              title="View image"
            >
              <Maximize size={14} className="mr-1" />
              View
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="h-8 p-1 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={handleDownload}
              title="Download image"
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;