// useCameraManagement.ts
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Camera } from './CameraMonitoringSystem';

export function useCameraManagement({ cameras, setCameras, availableDevices, setDangerDetections, fullscreenCamera, setFullscreenCamera, setIsAddingCamera, setCameraName, setCurrentDeviceId, setAutoStart, setErrorMessage, autoStart, startCameraStream }: {
  cameras: Camera[];
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;
  availableDevices: any[];
  setDangerDetections: React.Dispatch<React.SetStateAction<any[]>>;
  fullscreenCamera: number | null;
  setFullscreenCamera: React.Dispatch<React.SetStateAction<number | null>>;
  setIsAddingCamera: React.Dispatch<React.SetStateAction<boolean>>;
  setCameraName: React.Dispatch<React.SetStateAction<string>>;
  setCurrentDeviceId: React.Dispatch<React.SetStateAction<string>>;
  setAutoStart: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  autoStart: boolean;
  startCameraStream: (cameraId: number) => void;
}) {
  // Add camera dialog logic
  const addCamera = useCallback(() => {
    if (cameras.length >= 6) {
      toast.info("Maximum of 6 cameras allowed");
      return;
    }
    setIsAddingCamera(true);
    setCameraName(`Camera ${cameras.length + 1}`);
    if (availableDevices.length > 0) {
      setCurrentDeviceId(availableDevices[0].deviceId);
    }
    setAutoStart(true);
  }, [cameras.length, availableDevices, setIsAddingCamera, setCameraName, setCurrentDeviceId, setAutoStart]);

  // Save new camera logic
  const saveNewCamera = useCallback((currentDeviceId: string, cameraName: string) => {
    if (!currentDeviceId) {
      setErrorMessage('Please select a camera device');
      return;
    }
    const isDuplicate = cameras.some(camera => camera.deviceId === currentDeviceId);
    if (isDuplicate) {
      setErrorMessage('This camera is already in use');
      return;
    }
    const newCamera = {
      id: Date.now(),
      name: cameraName.trim() || `Camera ${cameras.length + 1}`,
      deviceId: currentDeviceId,
      status: 'paused' as const,
      stream: null,
      lastCapture: '',
      isAnalyzing: false,
      dangerDetected: false,
      analysisActive: false,
      analysisInterval: undefined
    };
    setCameras(prev => [...prev, newCamera]);
    setIsAddingCamera(false);
    setErrorMessage('');
    toast.success(`${newCamera.name} has been added`);
    if (autoStart) {
      setTimeout(() => startCameraStream(newCamera.id), 500);
    }
  }, [cameras, setCameras, setIsAddingCamera, setErrorMessage, autoStart, startCameraStream]);

  // Remove camera logic
  const removeCamera = useCallback((cameraId: number) => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera) return;
    if (camera.stream) {
      camera.stream.getTracks().forEach(track => track.stop());
    }
    setCameras(prev => prev.filter(c => c.id !== cameraId));
    setDangerDetections(prev => prev.filter((d: any) => d.cameraId !== cameraId));
    toast.success(`${camera.name} has been removed`);
    if (fullscreenCamera === cameraId) {
      setFullscreenCamera(null);
    }
  }, [cameras, setCameras, setDangerDetections, fullscreenCamera, setFullscreenCamera]);

  // Toggle fullscreen logic
  const toggleFullscreen = useCallback((cameraId: number) => {
    setFullscreenCamera(current => current === cameraId ? null : cameraId);
  }, [setFullscreenCamera]);

  return { addCamera, saveNewCamera, removeCamera, toggleFullscreen };
}
