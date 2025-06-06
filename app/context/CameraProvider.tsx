'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for TypeScript support
export interface Camera {
  id: number;
  name: string;
  deviceId: string;
  status: 'active' | 'paused' | 'error';
  stream: MediaStream | null;
  errorMessage?: string;
  lastCapture?: string;
  isAnalyzing: boolean;
  dangerDetected?: boolean;
  analysisActive?: boolean;
  analysisInterval?: NodeJS.Timeout;
  lastAnalysis?: string;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

interface CameraContextType {
  cameras: Camera[];
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;
  availableDevices: CameraDevice[];
  setAvailableDevices: React.Dispatch<React.SetStateAction<CameraDevice[]>>;
  scanForDevices: () => Promise<void>;
  startAllCameras: () => Promise<void>;
  stopAllCameras: () => void;
  startCameraStream: (cameraId: number) => Promise<void>;
  stopCameraStream: (cameraId: number) => void;
  toggleCameraStatus: (cameraId: number) => void;
}

// Create context with proper default values
const CameraContext = createContext<CameraContextType | undefined>(undefined);

// Hook for using the camera context
export const useCamera = (): CameraContextType => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCamera must be used within a CameraContextProvider');
  }
  return context;
};

interface CameraContextProviderProps {
  children: React.ReactNode;
}

// Provider component
export const CameraContextProvider: React.FC<CameraContextProviderProps> = ({ children }) => {
  // State for cameras and available devices
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);

  // Load saved cameras from localStorage on initial render
  useEffect(() => {
    const savedCameras = localStorage.getItem('cameras');
    if (savedCameras) {
      try {
        // When loading from storage, ensure all cameras are in paused state
        // and streams are null (as MediaStream objects can't be serialized)
        const parsedCameras = JSON.parse(savedCameras).map((camera: Camera) => ({
          ...camera,
          status: 'paused' as const,
          stream: null
        }));
        setCameras(parsedCameras);
      } catch (error) {
        console.error('Error loading saved cameras:', error);
      }
    }
  }, []);

  // Save cameras to localStorage whenever they change
  useEffect(() => {
    if (cameras.length > 0) {
      // Remove stream objects before saving (they can't be serialized)
      const camerasToSave = cameras.map(camera => ({
        ...camera,
        stream: null
      }));
      localStorage.setItem('cameras', JSON.stringify(camerasToSave));
    }
  }, [cameras]);

  // Function to scan for available camera devices
  const scanForDevices = async (): Promise<void> => {
    try {
      // Request permission to use media devices
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Get list of video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
        }));
      
      setAvailableDevices(videoDevices);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      setAvailableDevices([]);
      throw error; // Re-throw to allow handling by the component
    }
  };

  // Start a single camera stream
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
        c.id === cameraId ? { ...c, status: 'active' as const, stream, errorMessage: undefined } : c
      ));
      
      return;
    } catch (error) {
      console.error('Error starting camera stream:', error);
      setCameras(prevCameras => prevCameras.map(c => 
        c.id === cameraId ? { ...c, status: 'error' as const, errorMessage: 'Failed to access camera' } : c
      ));
      
      throw error;
    }
  };

  // Stop a single camera stream
  const stopCameraStream = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || !camera.stream) return;
    
    // Stop all tracks in the stream
    camera.stream.getTracks().forEach(track => track.stop());
    
    setCameras(prevCameras => prevCameras.map(c => 
      c.id === cameraId ? { ...c, status: 'paused' as const, stream: null } : c
    ));
  };

  // Toggle camera status (active/paused)
  const toggleCameraStatus = (cameraId: number): void => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    
    if (camera.status === 'active') {
      stopCameraStream(cameraId);
    } else {
      startCameraStream(cameraId).catch(err => 
        console.error(`Failed to toggle camera ${cameraId}:`, err)
      );
    }
  };

  // Function to start all cameras
  const startAllCameras = async (): Promise<void> => {
    const startPromises = cameras.map(async (camera) => {
      if (camera.status !== 'active') {
        try {
          await startCameraStream(camera.id);
          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    });
    
    await Promise.allSettled(startPromises);
  };

  // Function to stop all cameras
  const stopAllCameras = (): void => {
    cameras.forEach(camera => {
      if (camera.stream) {
        camera.stream.getTracks().forEach(track => track.stop());
      }
    });
    
    setCameras(prevCameras => prevCameras.map(c => ({
      ...c,
      status: 'paused' as const,
      stream: null
    })));
  };

  // Context value
  const contextValue: CameraContextType = {
    cameras,
    setCameras,
    availableDevices,
    setAvailableDevices,
    scanForDevices,
    startCameraStream,
    stopCameraStream,
    toggleCameraStatus,
    startAllCameras,
    stopAllCameras
  };

  return (
    <CameraContext.Provider value={contextValue}>
      {children}
    </CameraContext.Provider>
  );
};

export default CameraContextProvider;