'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "sonner";
import CameraHeader from './CameraHeader';
import AddCameraDialog from './AddCameraDialog';
import { useCamera } from '@/app/context/CameraProvider';
import CameraViewContainer from './CameraViewContainer';
import ImagePreviewDialog from './ImagePriviewDialog';
import ImageAnalysisChat from './ImageAnalysisChat';
import { saveToLocalStorage, loadFromLocalStorage } from './cameraLocalStorage';
import { useCameraAnalysis } from './useCameraAnalysis';
import { useCameraManagement } from './useCameraManagement';


// Define Camera type here if not available elsewhere
export interface Camera {
  id: number;
  name: string;
  deviceId: string;
  status: 'active' | 'paused' | 'error';
  stream: MediaStream | null;
  lastCapture?: string;
  isAnalyzing: boolean;
  dangerDetected?: boolean;
  analysisActive?: boolean;
  analysisInterval?: NodeJS.Timeout;
  lastAnalysis?: string;
  errorMessage?: string;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface DangerDetection {
  id: string;
  cameraId: number;
  cameraName: string;
  timestamp: string;
  image: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}


// Analysis interval options
const ANALYSIS_INTERVALS = [
  { value: 5000, label: '5 seconds' },
  { value: 15000, label: '15 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 180000, label: '3 minutes' },
  { value: 300000, label: '5 minutes' }
] as const;

const CameraMonitoringSystem: React.FC = () => {
  const { cameras, setCameras, availableDevices, setAvailableDevices, scanForDevices } = useCamera();
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingCamera, setIsAddingCamera] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'captures' | 'dangers'>('live');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [dangerDetections, setDangerDetections] = useState<DangerDetection[]>(() => loadFromLocalStorage<DangerDetection[]>("dangerDetections", []));
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState(true);
  const [analysisInterval, setAnalysisIntervalTime] = useState(15000);
  const [apiKey, setApiKey] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageAnalysisChatRef = useRef<any>(null);

  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setApiKey(envKey);
    if (!envKey) {
      toast.error("API Configuration", {
        description: "Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable for AI detection",
      });
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage("dangerDetections", dangerDetections);
  }, [dangerDetections]);

  // Enhanced frame capture utility with better error handling
  const captureFrameFromCamera = useCallback((cameraId: number, forAnalysis = false): string | null => {
    try {
      const videoElements = document.querySelectorAll('video');
      let videoElement: HTMLVideoElement | null = null;
      
      // Find the correct video element
      for (const element of videoElements) {
        if (element.getAttribute('data-camera-id') === String(cameraId)) {
          videoElement = element as HTMLVideoElement;
          break;
        }
      }
      
      // Validate video element and its state
      if (!videoElement) {
        console.warn(`Video element not found for camera ${cameraId}`);
        return null;
      }
      
      if (videoElement.readyState < 2) {
        console.warn(`Video not ready for camera ${cameraId}, readyState: ${videoElement.readyState}`);
        return null;
      }
      
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.warn(`Invalid video dimensions for camera ${cameraId}`);
        return null;
      }
      
      // Create a new canvas for each capture to avoid interference
      const canvas = document.createElement('canvas');
      const { videoWidth, videoHeight } = videoElement;
      let targetWidth = videoWidth;
      let targetHeight = videoHeight;
      
      // Optimize dimensions for analysis
      if (forAnalysis) {
        const maxWidth = 640;
        const maxHeight = 480;
        const aspectRatio = videoWidth / videoHeight;
        
        if (videoWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = maxWidth / aspectRatio;
        }
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = maxHeight * aspectRatio;
        }
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return null;
      }
      
      // Clear and draw with error handling
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
      
      const quality = forAnalysis ? 0.7 : 0.9;
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Clean up canvas
      canvas.remove();
      
      return dataUrl;
    } catch (error) {
      console.error(`Error capturing frame from camera ${cameraId}:`, error);
      return null;
    }
  }, []);

  // Use hooks for all logic
  const { analyzeFrameForDangers, startAIAnalysis, stopAIAnalysis } = useCameraAnalysis({
    cameras,
    setCameras,
    setDangerDetections,
    apiKey,
    captureFrameFromCamera,
    analysisInterval
  });
  
  const { addCamera, saveNewCamera, removeCamera, toggleFullscreen } = useCameraManagement({
    cameras,
    setCameras,
    availableDevices,
    setDangerDetections,
    fullscreenCamera,
    setFullscreenCamera,
    setIsAddingCamera,
    setCameraName,
    setCurrentDeviceId,
    setAutoStart,
    setErrorMessage,
    autoStart,
    startCameraStream: (id: number) => startCameraStream(id),
  });

  // Device scanning
  const handleScanForDevices = useCallback(async (): Promise<void> => {
    setIsScanning(true);
    setErrorMessage('');
    
    try {
      await scanForDevices();
      toast.success(`Found ${availableDevices.length} camera device(s)`);
      
      if (availableDevices.length > 0 && !currentDeviceId) {
        setCurrentDeviceId(availableDevices[0].deviceId);
      }
    } catch (error) {
      setErrorMessage('Unable to access camera devices. Please check permissions.');
      toast.error("Camera access error");
    } finally {
      setIsScanning(false);
    }
  }, [scanForDevices, availableDevices.length, currentDeviceId]);

  // Enhanced camera stream management
  const startCameraStream = useCallback(async (cameraId: number): Promise<void> => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;

    // Stop existing stream first
    if (camera.stream) {
      camera.stream.getTracks().forEach(track => {
        track.stop();
        track.removeEventListener('ended', () => {});
      });
    }

    try {
      // Clear any existing analysis
      stopAIAnalysis(cameraId);
      
      // Update status to indicate starting
      setCameras(prev => prev.map(c => 
        c.id === cameraId ? { 
          ...c, 
          status: 'active', 
          errorMessage: undefined,
          isAnalyzing: false,
          dangerDetected: false
        } : c
      ));
      
      const constraints = {
        video: { 
          deviceId: { exact: camera.deviceId },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add event listeners to track stream state
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.warn(`Camera ${cameraId} track ended unexpectedly`);
          setCameras(prev => prev.map(c => 
            c.id === cameraId ? { 
              ...c, 
              status: 'error', 
              errorMessage: 'Camera stream ended unexpectedly',
              stream: null
            } : c
          ));
        });
        
        track.addEventListener('mute', () => {
          console.warn(`Camera ${cameraId} track muted`);
        });
        
        track.addEventListener('unmute', () => {
          console.log(`Camera ${cameraId} track unmuted`);
        });
      });
      
      // Update camera with new stream
      setCameras(prev => prev.map(c => 
        c.id === cameraId ? { 
          ...c, 
          status: 'active', 
          stream, 
          errorMessage: undefined,
          isAnalyzing: false,
          dangerDetected: false
        } : c
      ));
      
      // Wait for video element to be ready before starting analysis
      if (aiDetectionEnabled) {
        setTimeout(() => {
          // Verify stream is still active before starting analysis
          const currentCamera = cameras.find(c => c.id === cameraId);
          if (currentCamera?.stream && currentCamera.status === 'active') {
            startAIAnalysis(cameraId);
          }
        }, 3000);
      }
      
      toast.success(`${camera.name} is now streaming`);
    } catch (error: any) {
      console.error(`Camera ${cameraId} stream error:`, error);
      
      setCameras(prev => prev.map(c => 
        c.id === cameraId ? { 
          ...c, 
          status: 'error', 
          stream: null,
          errorMessage: `Failed to access camera: ${error.message}`,
          isAnalyzing: false,
          dangerDetected: false
        } : c
      ));
      
      toast.error(`Failed to access ${camera.name}: ${error.message}`);
    }
  }, [cameras, setCameras, aiDetectionEnabled, startAIAnalysis, stopAIAnalysis]);

  const stopCameraStream = useCallback((cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    
    // Stop AI analysis first
    stopAIAnalysis(cameraId);
    
    // Stop media stream tracks
    if (camera.stream) {
      camera.stream.getTracks().forEach(track => {
        track.stop();
        // Remove event listeners
        track.removeEventListener('ended', () => {});
        track.removeEventListener('mute', () => {});
        track.removeEventListener('unmute', () => {});
      });
    }
    
    // Update camera state
    setCameras(prev => prev.map(c => 
      c.id === cameraId ? { 
        ...c, 
        status: 'paused', 
        stream: null, 
        dangerDetected: false,
        isAnalyzing: false,
        errorMessage: undefined
      } : c
    ));
    
    toast.info(`${camera.name} stream paused`);
  }, [cameras, setCameras, stopAIAnalysis]);

  const toggleCameraStatus = useCallback((cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    
    if (camera.status === 'active') {
      stopCameraStream(cameraId);
    } else {
      startCameraStream(cameraId);
    }
  }, [cameras, stopCameraStream, startCameraStream]);

  // Initialize - create canvas refs only once
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    if (!analysisCanvasRef.current) {
      analysisCanvasRef.current = document.createElement('canvas');
    }
    
    if (availableDevices.length === 0) {
      handleScanForDevices();
    }
    
    // Cleanup function
    return () => {
      cameras.forEach(camera => {
        if (camera.stream) {
          camera.stream.getTracks().forEach(track => {
            track.stop();
            track.removeEventListener('ended', () => {});
            track.removeEventListener('mute', () => {});
            track.removeEventListener('unmute', () => {});
          });
        }
        if (camera.analysisInterval) {
          clearInterval(camera.analysisInterval);
        }
      });
    };
  }, [availableDevices.length, handleScanForDevices]);

  // UI interactions
  const captureImage = useCallback((cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.status !== 'active') {
      toast.error("Camera is not active");
      return;
    }
    
    const imageUrl = captureFrameFromCamera(cameraId, false);
    if (!imageUrl) {
      toast.error("Failed to capture image");
      return;
    }
    
    setCameras(prev => prev.map(c => 
      c.id === cameraId ? { ...c, lastCapture: imageUrl } : c
    ));
    
    setCapturedImage(imageUrl);
    setPreviewDialogOpen(true);
    
    toast.success(`Captured image from ${camera.name}`);
    
    // If chat ref exists, start a new chat with the image
    if (imageAnalysisChatRef.current && typeof imageAnalysisChatRef.current.startChatWithImage === 'function') {
      imageAnalysisChatRef.current.startChatWithImage(imageUrl, camera.name);
    }
  }, [cameras, setCameras, captureFrameFromCamera]);

  const handleViewImage = useCallback((imageUrl: string): void => {
    setCapturedImage(imageUrl);
    setPreviewDialogOpen(true);
  }, []);

  const triggerManualAnalysis = useCallback((cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.status !== 'active') {
      toast.error("Camera is not active");
      return;
    }
    
    analyzeFrameForDangers(cameraId);
    toast.info("Analyzing current frame...");
  }, [analyzeFrameForDangers, cameras]);

  const toggleAIDetection = useCallback((): void => {
    const newState = !aiDetectionEnabled;
    setAiDetectionEnabled(newState);
    
    if (newState) {
      // Only start analysis for active cameras
      const activeCameras = cameras.filter(camera => camera.status === 'active');
      activeCameras.forEach(camera => {
        setTimeout(() => startAIAnalysis(camera.id), 1000);
      });
    } else {
      // Stop analysis for all cameras
      cameras.forEach(camera => {
        stopAIAnalysis(camera.id);
      });
    }
    
    toast.info(`AI Detection ${newState ? 'enabled' : 'disabled'}`);
  }, [aiDetectionEnabled, cameras, startAIAnalysis, stopAIAnalysis]);

  return (
    <div className="camera-monitoring-system">
      <CameraHeader 
        isScanning={isScanning}
        handleScanForDevices={handleScanForDevices}
        addCamera={addCamera}
        camerasCount={cameras.length}
        availableDevicesCount={availableDevices.length}
      />

      <CameraViewContainer
        cameras={cameras}
        activeTab={activeTab}
        handleTabChange={setActiveTab}
        fullscreenCamera={fullscreenCamera}
        toggleCameraStatus={toggleCameraStatus}
        captureImage={captureImage}
        toggleFullscreen={toggleFullscreen}
        removeCamera={removeCamera}
        onViewImage={handleViewImage}
        triggerManualAnalysis={triggerManualAnalysis}
        dangerDetections={dangerDetections}
        aiDetectionEnabled={aiDetectionEnabled}
      />

      <AddCameraDialog 
        open={isAddingCamera} 
        onClose={() => setIsAddingCamera(false)} 
        onSave={() => saveNewCamera(currentDeviceId, cameraName)}
        cameraName={cameraName}
        setCameraName={setCameraName}
        currentDeviceId={currentDeviceId}
        setCurrentDeviceId={setCurrentDeviceId}
        autoStart={autoStart}
        setAutoStart={setAutoStart}
        availableDevices={availableDevices}
      />
      
      <ImagePreviewDialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)} 
        imageUrl={capturedImage}
      />
      
      {cameras.length > 0 && (
        <ImageAnalysisChat ref={imageAnalysisChatRef} />
      )}
    </div>
  );
}

export default CameraMonitoringSystem;