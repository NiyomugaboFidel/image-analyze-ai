'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define camera types
export interface CameraConfig {
  id: number;
  name: string;
  deviceId: string;
  status: 'active' | 'paused' | 'error';
  stream: MediaStream | null;
  errorMessage?: string;
  lastCapture: string;
}

// Context type definitions
interface CameraContextType {
  cameras: CameraConfig[];
  setCameras: React.Dispatch<React.SetStateAction<CameraConfig[]>>;
  availableDevices: CameraDevice[];
  setAvailableDevices: React.Dispatch<React.SetStateAction<CameraDevice[]>>;
  scanForDevices: () => Promise<void>;
}

// Camera device type
export interface CameraDevice {
  deviceId: string;
  label: string;
}

// Create the context with a default value
const CameraContext = createContext<CameraContextType | undefined>(undefined);

// Provider component
export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  
  // Function to scan for available camera devices
  const scanForDevices = async (): Promise<void> => {
    try {
      // Request permission to access media devices
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Get all video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.substring(0, 5)}...`
        }));
      
      setAvailableDevices(videoDevices);
      
      // Also store in localStorage for persistence
      localStorage.setItem('availableCameraDevices', JSON.stringify(videoDevices));
      
      console.log("Found camera devices:", videoDevices.length);
    } catch (error) {
      console.error('Error accessing camera devices:', error);
    }
  };
  
  // Load cameras from localStorage on initial load
  useEffect(() => {
    // Try to load camera data from localStorage
    const savedCameras = localStorage.getItem('cameraConfigs');
    if (savedCameras) {
      try {
        const parsedCameras = JSON.parse(savedCameras);
        // Reset streams since they can't be serialized
        const restoredCameras = parsedCameras.map((cam: CameraConfig) => ({
          ...cam,
          stream: null,
          status: 'paused' // Reset status since streams are gone
        }));
        setCameras(restoredCameras);
      } catch (e) {
        console.error('Error loading cameras from localStorage:', e);
      }
    }
    
    // Try to load available devices from localStorage
    const savedDevices = localStorage.getItem('availableCameraDevices');
    if (savedDevices) {
      try {
        setAvailableDevices(JSON.parse(savedDevices));
      } catch (e) {
        console.error('Error loading devices from localStorage:', e);
      }
    }
    
    // Initial scan for devices
    scanForDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', scanForDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', scanForDevices);
    };
  }, []);
  
  // Save cameras to localStorage whenever they change
  // We need to remove the MediaStream before saving
  useEffect(() => {
    if (cameras.length > 0) {
      const camerasForStorage = cameras.map(cam => ({
        ...cam,
        stream: null // Remove stream before saving
      }));
      localStorage.setItem('cameraConfigs', JSON.stringify(camerasForStorage));
    }
  }, [cameras]);
  
  return (
    <CameraContext.Provider value={{ 
      cameras, 
      setCameras,
      availableDevices,
      setAvailableDevices,
      scanForDevices
    }}>
      {children}
    </CameraContext.Provider>
  );
};

// Hook for using the camera context
export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};