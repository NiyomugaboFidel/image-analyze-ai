import { useState, useEffect, useCallback, useRef } from 'react';

export interface HazardDetection {
  _id?: string;
  timestamp: Date;
  cameraId: string;
  cameraName: string;
  imageUrl: string;
  hazardType: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'false_positive';
}

export function useHazardDetection() {
  const [detections, setDetections] = useState<HazardDetection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const analysisIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Analyze single image for hazards
  const analyzeImage = useCallback(async (
    imageBase64: string,
    cameraId: string,
    cameraName: string
  ): Promise<{ hazardDetected: boolean; detection?: HazardDetection }> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          cameraId,
          cameraName
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      // If hazard detected, add to local state
      if (data.hazardDetected && data.detection) {
        setDetections(prev => [data.detection, ...prev.slice(0, 19)]); // Keep last 20
      }
      
      return {
        hazardDetected: data.hazardDetected,
        detection: data.detection
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Load recent detections
  const loadDetections = useCallback(async (cameraId?: string, limit: number = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (cameraId) params.append('cameraId', cameraId);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/analyze?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load detections');
      }
      
      setDetections(data.detections.map((d: any) => ({
        ...d,
        timestamp: new Date(d.timestamp)
      })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load detections';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load statistics
  const loadStats = useCallback(async (cameraId?: string) => {
    try {
      const params = new URLSearchParams();
      if (cameraId) params.append('cameraId', cameraId);
      
      const response = await fetch(`/api/stats?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Start continuous analysis for a camera
  const startContinuousAnalysis = useCallback((
    cameraId: string,
    cameraName: string,
    videoElement: HTMLVideoElement,
    interval: number = 10000
  ) => {
    // Stop existing analysis if any
    stopContinuousAnalysis(cameraId);
    
    const captureAndAnalyze = async () => {
      try {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context || !videoElement.videoWidth || !videoElement.videoHeight) {
          return;
        }
        
        // Set canvas size (optimize for API)
        const maxWidth = 640;
        const maxHeight = 480;
        let { videoWidth, videoHeight } = videoElement;
        
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
        
        // Draw current frame
        context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
        
        // Convert to base64
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        // Analyze the frame
        await analyzeImage(imageBase64, cameraId, cameraName);
      } catch (err) {
        console.error('Continuous analysis error:', err);
      }
    };
    
    // Start interval
    const intervalId = setInterval(captureAndAnalyze, interval);
    analysisIntervals.current.set(cameraId, intervalId);
  }, [analyzeImage]);

  // Stop continuous analysis for a camera
  const stopContinuousAnalysis = useCallback((cameraId: string) => {
    const intervalId = analysisIntervals.current.get(cameraId);
    if (intervalId) {
      clearInterval(intervalId);
      analysisIntervals.current.delete(cameraId);
    }
  }, []);

  // Update detection status
  const updateDetectionStatus = useCallback(async (
    detectionId: string,
    status: 'active' | 'resolved' | 'false_positive'
  ) => {
    try {
      const response = await fetch('/api/detections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: detectionId, status }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update detection');
      }
      
      // Update local state
      setDetections(prev => prev.map(detection => 
        detection._id === detectionId ? { ...detection, status } : detection
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update detection';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all analysis intervals
      analysisIntervals.current.forEach(intervalId => clearInterval(intervalId));
      analysisIntervals.current.clear();
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadDetections();
    loadStats();
  }, [loadDetections, loadStats]);

  return {
    detections,
    isAnalyzing,
    isLoading,
    error,
    stats,
    analyzeImage,
    loadDetections,
    loadStats,
    startContinuousAnalysis,
    stopContinuousAnalysis,
    updateDetectionStatus,
    clearError
  };
}