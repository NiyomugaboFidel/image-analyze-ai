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

  // Frame capture utility
  const captureFrameFromCamera = useCallback((cameraId: number, forAnalysis = false): string | null => {
    const videoElements = document.querySelectorAll('video');
    let videoElement: HTMLVideoElement | null = null;
    for (const element of videoElements) {
      if (element.getAttribute('data-camera-id') === String(cameraId)) {
        videoElement = element as HTMLVideoElement;
        break;
      }
    }
    if (!videoElement || videoElement.readyState < 2) return null;
    const canvas = forAnalysis ? analysisCanvasRef.current : canvasRef.current;
    if (!canvas) return null;
    const { videoWidth, videoHeight } = videoElement;
    let targetWidth = videoWidth;
    let targetHeight = videoHeight;
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
    if (!ctx) return null;
    try {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
      const quality = forAnalysis ? 0.7 : 0.9;
      return canvas.toDataURL('image/jpeg', quality);
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

  // Initialize
  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    analysisCanvasRef.current = document.createElement('canvas');
    
    if (availableDevices.length === 0) {
      handleScanForDevices();
    }
    
    return () => {
      cameras.forEach(camera => {
        if (camera.stream) {
          camera.stream.getTracks().forEach(track => track.stop());
        }
        if (camera.analysisInterval) {
          clearInterval(camera.analysisInterval);
        }
      });
    };
  }, [availableDevices.length, handleScanForDevices, cameras]);

  // Camera stream management
  const startCameraStream = useCallback(async (cameraId: number): Promise<void> => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;

    try {
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
      
      setCameras(prev => prev.map(c => 
        c.id === cameraId ? { ...c, status: 'active', stream, errorMessage: undefined } : c
      ));
      
      if (aiDetectionEnabled) {
        setTimeout(() => startAIAnalysis(cameraId), 3000);
      }
      
      toast.success(`${camera.name} is now streaming`);
    } catch (error: any) {
      setCameras(prev => prev.map(c => 
        c.id === cameraId ? { 
          ...c, 
          status: 'error', 
          errorMessage: `Failed to access camera: ${error.message}` 
        } : c
      ));
      
      toast.error(`Failed to access ${camera.name}`);
    }
  }, [cameras, setCameras, aiDetectionEnabled, startAIAnalysis]);

  const stopCameraStream = useCallback((cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera?.stream) return;
    
    stopAIAnalysis(cameraId);
    camera.stream.getTracks().forEach(track => track.stop());
    
    setCameras(prev => prev.map(c => 
      c.id === cameraId ? { 
        ...c, 
        status: 'paused', 
        stream: null, 
        dangerDetected: false,
        isAnalyzing: false
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

  // UI interactions
  const captureImage = useCallback((cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.status !== 'active') return;
    
    const imageUrl = captureFrameFromCamera(cameraId, false);
    if (!imageUrl) return;
    
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
    analyzeFrameForDangers(cameraId);
    toast.info("Analyzing current frame...");
  }, [analyzeFrameForDangers]);

  const toggleAIDetection = useCallback((): void => {
    const newState = !aiDetectionEnabled;
    setAiDetectionEnabled(newState);
    
    if (newState) {
      cameras.forEach(camera => {
        if (camera.status === 'active') {
          setTimeout(() => startAIAnalysis(camera.id), 1000);
        }
      });
    } else {
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