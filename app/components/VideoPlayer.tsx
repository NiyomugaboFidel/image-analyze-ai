






















'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Camera, Maximize, X, CameraOff, RefreshCw, Download, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCamera } from '../context/CameraContextProvider';
import ImageAnalysisChat from './AiChat';

// Type definitions
interface ImageDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

// Image preview dialog component
const ImagePreviewDialog: React.FC<ImageDialogProps> = ({ open, onClose, imageUrl }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Captured Image</DialogTitle>
          <DialogDescription>
            Image captured at {new Date().toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-2">
          {imageUrl && (
            <img src={imageUrl} alt="Captured" className="max-w-full rounded-md shadow-md" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {imageUrl && (
            <Button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `camera-capture-${new Date().getTime()}.png`;
                link.click();
              }}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CameraMonitoringSystem: React.FC = () => {
  // Use the camera context instead of local state
  const { cameras, setCameras, availableDevices, setAvailableDevices, scanForDevices } = useCamera();
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isAddingCamera, setIsAddingCamera] = useState<boolean>(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [cameraName, setCameraName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('live');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false);
  const [autoStart, setAutoStart] = useState<boolean>(true);
  
  // Refs for video elements and canvas for capturing images
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Enhanced scan function that updates the context and UI state
  const handleScanForDevices = async (): Promise<void> => {
    setIsScanning(true);
    setErrorMessage('');
    
    try {
      await scanForDevices();
      
      toast.success("Camera scan complete", {     
        description: `Found ${availableDevices.length} camera device(s)`,
      });
      
      if (availableDevices.length > 0 && !currentDeviceId) {
        setCurrentDeviceId(availableDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error accessing camera devices:', error);
      setErrorMessage('Unable to access camera devices. Please check permissions.');
      
      toast.error("Camera access error", {
        description: "Unable to access camera devices. Please check permissions.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Initialize by creating canvas element
  useEffect(() => {
    // Create canvas element for image capture
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    
    // If there are no stored device IDs, do an initial scan
    if (availableDevices.length === 0) {
      handleScanForDevices();
    }
    
    return () => {
      // Stop all camera streams when component unmounts
      cameras.forEach(camera => {
        if (camera.stream) {
          camera.stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, []); // Empty dependency array to run only on mount

  // Start camera stream for a specific camera
  const startCameraStream = async (cameraId: number): Promise<void> => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;

    try {
      // First, stop any existing stream for this camera
      if (camera.stream) {
        camera.stream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: camera.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Update camera state with new stream
      setCameras(prevCameras => prevCameras.map(c => 
        c.id === cameraId ? { ...c, status: 'active', stream, errorMessage: undefined } : c
      ));
      
      // Get the video element and attach the stream
      const videoElement = videoRefs.current[cameraId];
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play().catch(err => {
          console.error('Error playing video:', err);
          toast.error("Video playback error", {
            description: `Failed to play video stream for ${camera.name}`,
          });
        });
      }
      
      toast.success("Camera activated", {
        description: `${camera.name} is now streaming`,
      });
    } catch (error) {
      console.error('Error starting camera stream:', error);
      setCameras(prevCameras => prevCameras.map(c => 
        c.id === cameraId ? { ...c, status: 'error', errorMessage: 'Failed to access camera' } : c
      ));
      
      toast.error("Camera error", {
        description: `Failed to access ${camera.name}`,
      });
    }
  };

  // Stop camera stream
  const stopCameraStream = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || !camera.stream) return;
    
    // Stop all tracks in the stream
    camera.stream.getTracks().forEach(track => track.stop());
    
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, status: 'paused', stream: null } : c
    ));
    
    // Clear the video element source
    if (videoRefs.current[cameraId]) {
      videoRefs.current[cameraId]!.srcObject = null;
    }
    
    toast.info("Camera paused", {
      description: `${camera.name} stream has been paused`,
    });
  };

  // Toggle camera status (play/pause)
  const toggleCameraStatus = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    
    if (camera.status === 'active') {
      stopCameraStream(cameraId);
    } else {
      startCameraStream(cameraId);
    }
  };

  // Add a new camera
  const addCamera = (): void => {
    if (cameras.length >= 6) {
      setErrorMessage('Maximum of 6 cameras reached');
      toast.info("Limit reached", {
        description: "Maximum of 6 cameras allowed",
      });
      return;
    }
    
    setIsAddingCamera(true);
    setCameraName(`Camera ${cameras.length + 1}`);
    
    // Make sure we have a device selected
    if (availableDevices.length > 0) {
      setCurrentDeviceId(availableDevices[0].deviceId);
    } else {
      setCurrentDeviceId('');
    }
    
    setAutoStart(true);
  };

  // Save new camera
  const saveNewCamera = (): void => {
    if (!currentDeviceId) {
      setErrorMessage('Please select a camera device');
      return;
    }
    
    // Check if this device is already in use
    const isDuplicate = cameras.some(camera => camera.deviceId === currentDeviceId);
    if (isDuplicate) {
      setErrorMessage('This camera is already in use');
      toast.info("Duplicate camera", {
        description: "This camera is already in use",
      });
      return;
    }
    
    const newCamera = {
      id: Date.now(),
      name: cameraName.trim() || `Camera ${cameras.length + 1}`,
      deviceId: currentDeviceId,
      status: 'paused' as const,
      stream: null,
      lastCapture:''
    };
    
    // Add the new camera to the state
    setCameras(prevCameras => [...prevCameras, newCamera]);
    setIsAddingCamera(false);
    setErrorMessage('');
    
    toast.success("Camera added", {
      description: `${newCamera.name} has been added to your dashboard`,
    });
    
    // Start the camera stream after a short delay to allow component to render
    if (autoStart) {
      setTimeout(() => {
        startCameraStream(newCamera.id);
      }, 500);
    }
  };

  // Remove a camera
  const removeCamera = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    
    if (camera.stream) {
      camera.stream.getTracks().forEach(track => track.stop());
    }
    
    setCameras(prevCameras => prevCameras.filter(c => c.id !== cameraId));
    
    toast.success("Camera removed", {
      description: `${camera.name} has been removed`,
    });
    
    if (fullscreenCamera === cameraId) {
      setFullscreenCamera(null);
    }
  };

  // Toggle fullscreen mode for a camera
  const toggleFullscreen = (cameraId: number): void => {
    if (fullscreenCamera === cameraId) {
      setFullscreenCamera(null);
    } else {
      setFullscreenCamera(cameraId);
    }
  };

  // Capture image from camera feed
  const captureImage = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.status !== 'active') return;
    
    const videoElement = videoRefs.current[cameraId];
    if (!videoElement || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame to the canvas
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image URL
    const imageUrl = canvas.toDataURL('image/png');
    
    // Update camera with last capture
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, lastCapture: imageUrl } : c
    ));
    
    // Set captured image and open preview dialog
    setCapturedImage(imageUrl);
    setPreviewDialogOpen(true);
    
    toast.success("Image captured", {
      description: `Captured image from ${camera.name}`,
    });
  };

  // Handle tab change between live view and captures
  const handleTabChange = (value: string): void => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Cameras Control </h1>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleScanForDevices}
                  disabled={isScanning}
                  className="h-9"
                >
                  {isScanning ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <RefreshCw size={16} className="mr-2" />
                  )}
                  Scan
                </Button>
              </TooltipTrigger>
              <TooltipContent  className='boder bg-gray-200 p-2 rounded-md' >
                <p>Scan for available camera devices</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  onClick={addCamera}
                  disabled={cameras.length >= 6 || availableDevices.length === 0}
                  className="h-9 bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Camera size={16} className="mr-2" />
                  Add Camera ({cameras.length}/6)
                </Button>
              </TooltipTrigger>
              <TooltipContent className='boder bg-gray-200 p-2 rounded-md' >
                <p>Add a new camera to monitor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>


           {/* Main content area */}
           <Card className="">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Camera Feeds</CardTitle>
            {cameras.length > 0 && (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
                <TabsList>
                  <TabsTrigger value="live">Live View</TabsTrigger>
                  <TabsTrigger value="captures">Captures</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {cameras.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Camera size={48} />
              <p className="mt-4">No cameras added</p>
              <p className="text-sm">Click "Add Camera" to start monitoring</p>
            </div>
          ) : (
            <>
              {activeTab === "live" && (
                <div className={
                  fullscreenCamera 
                    ? "grid grid-cols-1 gap-4" 
                    : `grid grid-cols-1 ${cameras.length > 1 ? "sm:grid-cols-2" : ""} ${cameras.length > 2 ? "lg:grid-cols-3" : ""} gap-4`
                }>
                  {cameras
                    .filter(camera => fullscreenCamera === null || camera.id === fullscreenCamera)
                    .map(camera => (
                    <div key={camera.id} className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800">
                      <div className="aspect-video bg-gray-900 relative">
                        {/* Video element for camera stream */}
                        <video
                          ref={el => { videoRefs.current[camera.id] = el; }}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                          style={{ display: camera.status === 'active' ? 'block' : 'none' }}
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
                          <Badge variant={camera.status === 'active' ? 'default' : 'secondary'}>
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
                            className="h-8 w-8 p-0" 
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
                              className="h-8 w-8 p-0"
                              onClick={() => captureImage(camera.id)}
                              title="Capture image"
                            >
                              <Image size={16} />
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 w-8 p-0"
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
                  ))}
                </div>
              )}
              
              {activeTab === "captures" && (
                <div className={`grid grid-cols-1 ${cameras.length > 1 ? "sm:grid-cols-2" : ""} ${cameras.length > 2 ? "lg:grid-cols-3" : ""} gap-4`}>
                  {cameras.map(camera => (
                    <div key={`capture-${camera.id}`} className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm dark:border-gray-800">
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
                              className="h-8 p-1"
                              onClick={() => {
                                setCapturedImage(camera.lastCapture);
                                setPreviewDialogOpen(true);
                              }}
                              title="View image"
                            >
                              <Maximize size={14} className="mr-1" />
                              View
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8 p-1"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = camera.lastCapture!;
                                link.download = `${camera.name.replace(/\s+/g, '-')}-${new Date().getTime()}.png`;
                                link.click();
                              }}
                              title="Download image"
                            >
                              <Download size={14} className="mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Camera Dialog */}
      <Dialog   open={isAddingCamera} onOpenChange={setIsAddingCamera}>
        <DialogContent className='bg-white dark:bg-gray-900'>
          <DialogHeader>
            <DialogTitle>Add Camera</DialogTitle>
            <DialogDescription>
              Configure and add a new camera to your monitoring system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="camera-name">Camera Name</Label>
              <Input
                id="camera-name"
                className='border shadow-lg'
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                placeholder="Enter camera name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-device">Select Camera Device</Label>
              <Select value={currentDeviceId} onValueChange={setCurrentDeviceId}>
                <SelectTrigger id="camera-device">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-start" 
                checked={autoStart}
                onCheckedChange={setAutoStart}
              />
         
            </div>
          </div>
          <DialogFooter>
            <Button className='hover:bg-[#E63946] bg-[#E63911] text-white' onClick={() => setIsAddingCamera(false)}>
              Cancel
            </Button>
            <Button variant="outline"  onClick={saveNewCamera}>Add Camera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Preview Dialog */}
      <ImagePreviewDialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)} 
        imageUrl={capturedImage} 
      />
        <ImageAnalysisChat />
    </div>
  );
};

export default CameraMonitoringSystem;

