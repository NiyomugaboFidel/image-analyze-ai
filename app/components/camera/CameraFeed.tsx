'use client';
import React, { useRef, useEffect } from 'react';
import { Play, Pause, CameraOff, Maximize, X, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera } from '@/app/context/CameraProvider';

interface CameraFeedProps {
  camera: Camera;
  toggleCameraStatus: (cameraId: number) => void;
  captureImage: (cameraId: number) => void;
  toggleFullscreen: (cameraId: number) => void;
  removeCamera: (cameraId: number) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ 
  camera, 
  toggleCameraStatus, 
  captureImage, 
  toggleFullscreen, 
  removeCamera 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (camera.status === 'active' && camera.stream && videoRef.current) {
      videoRef.current.srcObject = camera.stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [camera.status, camera.stream]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="aspect-video bg-gray-900 relative">
        {/* Video element for camera stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: camera.status === 'active' ? 'block' : 'none' }}
          data-camera-id={camera.id.toString()}
        />
        
        {/* Placeholder when camera is paused */}
        {camera.status !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            <CameraOff size={48} className="text-gray-400 mb-2" />
            <span className="text-gray-300">
              {camera.status === 'error' ? camera.errorMessage : 'Camera paused'}
            </span>
          </div>
        )}
        
        {/* Camera details */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <Badge variant={camera.status === 'active' ? 'default' : 'secondary'} className="dark:bg-gray-700 dark:text-gray-100">
            {camera.name}
          </Badge>
          
          {camera.status === 'active' && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
        
        {/* Camera controls */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" 
            onClick={() => toggleCameraStatus(camera.id)}
            title={camera.status === 'active' ? 'Pause' : 'Play'}
          >
            {camera.status === 'active' ? 
              <Pause size={16} /> : 
              <Play size={16} />
            }
          </Button>
          
          {camera.status === 'active' && (
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 w-8 p-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={() => captureImage(camera.id)}
              title="Capture image"
            >
              <Image size={16} />
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => toggleFullscreen(camera.id)}
            title="Toggle fullscreen"
          >
            <Maximize size={16} />
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive" 
            className="h-8 w-8 p-0"
            onClick={() => removeCamera(camera.id)}
            title="Remove camera"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;