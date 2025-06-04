// components/camera/CameraMonitoringSystem.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import CameraHeader from './CameraHeader';
import AddCameraDialog from './AddCameraDialog';
import { useCamera } from '@/app/context/CameraProvider';
import CameraViewContainer from './CameraViewContainer';
import ImagePreviewDialog from './ImagePriviewDialog';
import ImageAnalysisChat from './ImageAnalysisChat';

// Define TypeScript interfaces
export interface Camera {
  id: number;
  name: string;
  deviceId: string;
  status: 'active' | 'paused' | 'error';
  stream: MediaStream | null;
  lastCapture: string;
  errorMessage?: string;
  // AI Detection properties
  isAnalyzing?: boolean;
  lastAnalysis?: string;
  dangerDetected?: boolean;
  analysisInterval?: NodeJS.Timeout;
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

const CameraMonitoringSystem: React.FC = () => {
  // Use the camera context with proper typing
  const { cameras, setCameras, availableDevices, setAvailableDevices, scanForDevices } = useCamera();
  
  // Local state with proper typing
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isAddingCamera, setIsAddingCamera] = useState<boolean>(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [cameraName, setCameraName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'captures' | 'dangers'>('live');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false);
  const [autoStart, setAutoStart] = useState<boolean>(true);
  
  // AI Detection state
  const [dangerDetections, setDangerDetections] = useState<DangerDetection[]>([]);
  const [aiDetectionEnabled, setAiDetectionEnabled] = useState<boolean>(true);
  const [analysisInterval, setAnalysisIntervalTime] = useState<number>(10000); // 10 seconds
  const [apiKey, setApiKey] = useState<string>('');
  
  // Canvas ref for capturing images
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize API key from environment
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setApiKey(key);
    if (!key) {
      toast.error("API Configuration", {
        description: "Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable for AI detection",
      });
    }
  }, []);

  // Capture frame from specific camera
  const captureFrameFromCamera = (cameraId: number): string | null => {
    const videoElements = document.querySelectorAll('video');
    let videoElement: HTMLVideoElement | null = null;
    
    for (const element of videoElements) {
      if (element.getAttribute('data-camera-id') === String(cameraId)) {
        videoElement = element as HTMLVideoElement;
        break;
      }
    }
    
    if (!videoElement || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    
    // Reduce image size for API efficiency
    const maxWidth = 512;
    const maxHeight = 384;
    
    let { videoWidth, videoHeight } = videoElement;
    
    if (videoWidth === 0 || videoHeight === 0) return null;
    
    // Calculate aspect ratio and resize
    const aspectRatio = videoWidth / videoHeight;
    if (videoWidth > maxWidth) {
      videoWidth = maxWidth;
      videoHeight = maxWidth / aspectRatio;
    }
    if (videoHeight > maxHeight) {
      videoHeight = maxHeight;
      videoWidth = maxHeight * aspectRatio;
    }
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
      return canvas.toDataURL('image/jpeg', 0.6);
    }
    return null;
  };

  // Convert data URL to base64 string
  const dataURLToBase64 = (dataURL: string): string => {
    return dataURL.split(',')[1];
  };

  // Analyze frame for dangers using Gemini API
  const analyzeFrameForDangers = async (cameraId: number): Promise<void> => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.status !== 'active' || camera.isAnalyzing) return;
    
    if (!apiKey) {
      console.warn('API key not available for danger detection');
      return;
    }
    
    const frameDataUrl = captureFrameFromCamera(cameraId);
    if (!frameDataUrl) return;
    
    // Update camera analyzing status
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, isAnalyzing: true } : c
    ));
    
    try {
      const base64Image = dataURLToBase64(frameDataUrl);
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: "Analyze this image for any dangerous situations such as: fire, smoke, people without safety equipment, falling objects, unsafe working conditions, accidents, medical emergencies, suspicious activities, or any other hazardous scenarios. If you detect danger, describe it clearly and specifically with severity level (low/medium/high). If no danger is present, respond with exactly 'No danger detected.'"
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${response.statusText}`);
      }
      
      const data = await response.json();
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!description) {
        throw new Error("No response received from AI model");
      }
      
      const timestamp = new Date().toLocaleString();
      
      // Update camera with analysis result
      setCameras(prevCameras => prevCameras.map(c => 
        c.id === cameraId ? { 
          ...c, 
          isAnalyzing: false, 
          lastAnalysis: timestamp,
          dangerDetected: !description.toLowerCase().includes("no danger detected")
        } : c
      ));
      
      // Only store detection if danger was found
      if (!description.toLowerCase().includes("no danger detected")) {
        // Determine severity based on keywords
        let severity: 'low' | 'medium' | 'high' = 'medium';
        const desc = description.toLowerCase();
        if (desc.includes('fire') || desc.includes('explosion') || desc.includes('emergency')) {
          severity = 'high';
        } else if (desc.includes('minor') || desc.includes('low risk')) {
          severity = 'low';
        }
        
        const detection: DangerDetection = {
          id: `${cameraId}-${Date.now()}`,
          cameraId,
          cameraName: camera.name,
          timestamp,
          image: frameDataUrl,
          description: description.trim(),
          severity
        };
        
        setDangerDetections(prev => [detection, ...prev.slice(0, 49)]); // Keep last 50 detections
        
        // Show notification for high severity dangers
        if (severity === 'high') {
          toast.error("🚨 High Severity Danger Detected!", {
            description: `${camera.name}: ${description.substring(0, 100)}...`,
            duration: 10000,
          });
        } else if (severity === 'medium') {
          toast.warning("⚠️ Danger Detected", {
            description: `${camera.name}: ${description.substring(0, 80)}...`,
            duration: 5000,
          });
        }
      }
      
    } catch (error: any) {
      console.error(`Error analyzing frame for camera ${cameraId}:`, error);
      setCameras(prevCameras => prevCameras.map(c => 
        c.id === cameraId ? { ...c, isAnalyzing: false } : c
      ));
    }
  };

  // Start AI analysis for a camera
  const startAIAnalysis = (cameraId: number): void => {
    if (!aiDetectionEnabled) return;
    
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.analysisInterval) return;
    
    const interval = setInterval(() => {
      analyzeFrameForDangers(cameraId);
    }, analysisInterval);
    
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, analysisInterval: interval } : c
    ));
  };

  // Stop AI analysis for a camera
  const stopAIAnalysis = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || !camera.analysisInterval) return;
    
    clearInterval(camera.analysisInterval);
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, analysisInterval: undefined } : c
    ));
  };

  // Handle device scanning
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

  // Initialize canvas and scan for devices on mount
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    
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
  }, [availableDevices.length, cameras, scanForDevices]);

  // Start camera stream
  const startCameraStream = async (cameraId: number): Promise<void> => {
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
      
      setCameras(prevCameras => prevCameras.map(c => 
        c.id === cameraId ? { ...c, status: 'active', stream, errorMessage: undefined } : c
      ));
      
      // Start AI analysis after a short delay
      if (aiDetectionEnabled) {
        setTimeout(() => startAIAnalysis(cameraId), 2000);
      }
      
      toast.success("Camera activated", {
        description: `${camera.name} is now streaming${aiDetectionEnabled ? ' with AI monitoring' : ''}`,
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
    
    // Stop AI analysis
    stopAIAnalysis(cameraId);
    
    // Stop all tracks in the stream
    camera.stream.getTracks().forEach(track => track.stop());
    
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, status: 'paused', stream: null, dangerDetected: false } : c
    ));
    
    toast.info("Camera paused", {
      description: `${camera.name} stream has been paused`,
    });
  };

  // Toggle camera status
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
    
    const isDuplicate = cameras.some(camera => camera.deviceId === currentDeviceId);
    if (isDuplicate) {
      setErrorMessage('This camera is already in use');
      toast.info("Duplicate camera", {
        description: "This camera is already in use",
      });
      return;
    }
    
    const newCamera: Camera = {
      id: Date.now(),
      name: cameraName.trim() || `Camera ${cameras.length + 1}`,
      deviceId: currentDeviceId,
      status: 'paused',
      stream: null,
      lastCapture: '',
      isAnalyzing: false,
      dangerDetected: false
    };
    
    setCameras(prevCameras => [...prevCameras, newCamera]);
    setIsAddingCamera(false);
    setErrorMessage('');
    
    toast.success("Camera added", {
      description: `${newCamera.name} has been added with AI monitoring`,
    });
    
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
    
    stopAIAnalysis(cameraId);
    
    if (camera.stream) {
      camera.stream.getTracks().forEach(track => track.stop());
    }
    
    setCameras(prevCameras => prevCameras.filter(c => c.id !== cameraId));
    
    // Remove detections for this camera
    setDangerDetections(prev => prev.filter(d => d.cameraId !== cameraId));
    
    toast.success("Camera removed", {
      description: `${camera.name} has been removed`,
    });
    
    if (fullscreenCamera === cameraId) {
      setFullscreenCamera(null);
    }
  };

  // Toggle fullscreen mode
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
    
    const videoElements = document.querySelectorAll('video');
    let videoElement: HTMLVideoElement | null = null;
    
    for (const element of videoElements) {
      if (element.getAttribute('data-camera-id') === String(cameraId)) {
        videoElement = element as HTMLVideoElement;
        break;
      }
    }
    
    if (!videoElement || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL('image/png');
    
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, lastCapture: imageUrl } : c
    ));
    
    setCapturedImage(imageUrl);
    setPreviewDialogOpen(true);
    
    toast.success("Image captured", {
      description: `Captured image from ${camera.name}`,
    });
  };

  // Handle image preview
  const handleViewImage = (imageUrl: string): void => {
    setCapturedImage(imageUrl);
    setPreviewDialogOpen(true);
  };

  // Manual analysis trigger
  const triggerManualAnalysis = (cameraId: number): void => {
    analyzeFrameForDangers(cameraId);
    toast.info("Manual analysis started", {
      description: "Analyzing current frame for dangers...",
    });
  };

  // Toggle AI detection globally
  const toggleAIDetection = (): void => {
    setAiDetectionEnabled(!aiDetectionEnabled);
    
    if (!aiDetectionEnabled) {
      // Start AI analysis for all active cameras
      cameras.forEach(camera => {
        if (camera.status === 'active') {
          startAIAnalysis(camera.id);
        }
      });
      toast.success("AI Detection Enabled", {
        description: "All active cameras will now monitor for dangers",
      });
    } else {
      // Stop AI analysis for all cameras
      cameras.forEach(camera => {
        stopAIAnalysis(camera.id);
      });
      toast.info("AI Detection Disabled", {
        description: "Danger monitoring has been turned off",
      });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 dark:bg-gray-950 dark:text-gray-100">
      {/* Enhanced Header with AI controls */}
      <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <CameraHeader 
          isScanning={isScanning}
          handleScanForDevices={handleScanForDevices}
          addCamera={addCamera}
          camerasCount={cameras.length}
          availableDevicesCount={availableDevices.length}
        />
        
        {/* AI Detection Controls */}
        <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">AI Danger Detection:</span>
            <button
              onClick={toggleAIDetection}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                aiDetectionEnabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {aiDetectionEnabled ? '✓ Enabled' : '✗ Disabled'}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Analysis Interval:</span>
            <select 
              value={analysisInterval}
              onChange={(e) => setAnalysisIntervalTime(Number(e.target.value))}
              className="px-2 py-1 text-xs rounded border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={15000}>15 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Total Dangers:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              dangerDetections.length > 0 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {dangerDetections.length}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Camera View Container with danger detection info */}
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
        // Pass additional props for AI features
        triggerManualAnalysis={triggerManualAnalysis}
        dangerDetections={dangerDetections}
        aiDetectionEnabled={aiDetectionEnabled}
      />

      {/* Add Camera Dialog */}
      <AddCameraDialog 
        open={isAddingCamera}
        onClose={() => setIsAddingCamera(false)}
        cameraName={cameraName}
        setCameraName={setCameraName}
        currentDeviceId={currentDeviceId}
        setCurrentDeviceId={setCurrentDeviceId}
        autoStart={autoStart}
        setAutoStart={setAutoStart}
        availableDevices={availableDevices}
        onSave={saveNewCamera}
        // errorMessage={errorMessage}
      />
      
      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        imageUrl={capturedImage}
      />

      {/* AI Analysis Chat */}
      <ImageAnalysisChat />
    </div>
  );
};

export default CameraMonitoringSystem;