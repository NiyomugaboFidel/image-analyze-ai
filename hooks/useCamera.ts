import { useState, useEffect, useCallback } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface Camera {
  id: string;
  name: string;
  deviceId: string;
  status: 'active' | 'paused' | 'error';
  stream: MediaStream | null;
  lastCapture: string;
  errorMessage?: string;
  isAnalysisEnabled: boolean;
  analysisInterval: number;
  totalDetections: number;
}

export function useCamera() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scan for available camera devices
  const scanForDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Request camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());

      // Get all video input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`
        }));

      setAvailableDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera devices';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cameras from API
  const loadCameras = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cameras');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load cameras');
      }
      
      // Transform API data to local camera format
      const transformedCameras: Camera[] = data.cameras.map((camera: any) => ({
        id: camera.id,
        name: camera.name,
        deviceId: camera.deviceId,
        status: 'paused',
        stream: null,
        lastCapture: '',
        isAnalysisEnabled: camera.isAnalysisEnabled,
        analysisInterval: camera.analysisInterval,
        totalDetections: camera.totalDetections
      }));
      
      setCameras(transformedCameras);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cameras';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add camera to API and local state
  const addCamera = useCallback(async (cameraData: {
    id: string;
    name: string;
    deviceId: string;
    location?: string;
    analysisInterval?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cameraData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add camera');
      }
      
      // Add to local state
      const newCamera: Camera = {
        id: data.camera.id,
        name: data.camera.name,
        deviceId: data.camera.deviceId,
        status: 'paused',
        stream: null,
        lastCapture: '',
        isAnalysisEnabled: data.camera.isAnalysisEnabled,
        analysisInterval: data.camera.analysisInterval,
        totalDetections: 0
      };
      
      setCameras(prev => [...prev, newCamera]);
      return newCamera;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add camera';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update camera in API and local state
  const updateCamera = useCallback(async (cameraId: string, updates: Partial<Camera>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cameras', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: cameraId, ...updates }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update camera');
      }
      
      // Update local state
      setCameras(prev => prev.map(camera => 
        camera.id === cameraId ? { ...camera, ...updates } : camera
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update camera';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove camera from API and local state
  const removeCamera = useCallback(async (cameraId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cameras?id=${cameraId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove camera');
      }
      
      // Stop stream if active
      const camera = cameras.find(c => c.id === cameraId);
      if (camera?.stream) {
        camera.stream.getTracks().forEach(track => track.stop());
      }
      
      // Remove from local state
      setCameras(prev => prev.filter(camera => camera.id !== cameraId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove camera';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cameras]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  return {
    cameras,
    setCameras,
    availableDevices,
    setAvailableDevices,
    isLoading,
    error,
    scanForDevices,
    loadCameras,
    addCamera,
    updateCamera,
    removeCamera,
    clearError
  };
}