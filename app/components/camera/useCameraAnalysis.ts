// useCameraAnalysis.ts
import { useCallback } from 'react';
import { toast } from 'sonner';
import { DangerDetection, Camera } from './CameraMonitoringSystem';

export function useCameraAnalysis({ cameras, setCameras, setDangerDetections, apiKey, captureFrameFromCamera, analysisInterval = 15000, onAnalysisComplete }: {
  cameras: Camera[];
  setCameras: React.Dispatch<React.SetStateAction<Camera[]>>;
  setDangerDetections: React.Dispatch<React.SetStateAction<DangerDetection[]>>;
  apiKey: string;
  captureFrameFromCamera: (cameraId: number, forAnalysis?: boolean) => string | null;
  analysisInterval?: number;
  onAnalysisComplete?: (cameraId: number) => void;
}) {
  // Analyze a single frame for dangers
  const analyzeFrameForDangers = useCallback(async (cameraId: number) => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.status !== 'active' || camera.isAnalyzing || !apiKey) {
      return;
    }
    const frameDataUrl = captureFrameFromCamera(cameraId, true);
    if (!frameDataUrl) return;
    setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, isAnalyzing: true } : c));
    try {
      const base64Image = frameDataUrl.split(',')[1];
      const requestBody = {
        contents: [{
          parts: [{
            text: "Analyze this security camera image for dangerous situations like fire, smoke, unsafe conditions, accidents, medical emergencies, suspicious activities, weapons, or violence. If danger detected, describe it with severity (low/medium/high). If no danger, respond 'No danger detected.'"
          }, {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 150,
        }
      };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const timestamp = new Date().toLocaleString();
      const isDangerDetected = !description.toLowerCase().includes("no danger detected");
      setCameras(prev => prev.map(c =>
        c.id === cameraId ? {
          ...c,
          isAnalyzing: false,
          lastAnalysis: timestamp,
          dangerDetected: isDangerDetected
        } : c
      ));
      if (isDangerDetected) {
        const desc = description.toLowerCase();
        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (desc.includes('fire') || desc.includes('weapon') || desc.includes('violence')) {
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
        setDangerDetections(prev => [detection, ...prev.slice(0, 99)]);
        const notificationConfig = {
          high: { func: toast.error, icon: '🚨', title: 'CRITICAL DANGER!', duration: 15000 },
          medium: { func: toast.warning, icon: '⚠️', title: 'Danger Detected', duration: 8000 },
          low: { func: toast.info, icon: '⚡', title: 'Potential Risk', duration: 5000 }
        };
        const config = notificationConfig[severity];
        config.func(`${config.icon} ${config.title}`, {
          description: `${camera.name}: ${description.substring(0, 60)}...`,
          duration: config.duration
        });
      }
      if (onAnalysisComplete && camera.status === 'active') {
        onAnalysisComplete(cameraId);
      }
    } catch (error: any) {
      setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, isAnalyzing: false } : c));
      toast.error("Analysis Error", {
        description: `Failed to analyze ${camera?.name}`,
      });
      if (onAnalysisComplete && camera?.status === 'active') {
        onAnalysisComplete(cameraId);
      }
    }
  }, [cameras, apiKey, setCameras, setDangerDetections, captureFrameFromCamera, onAnalysisComplete]);

  // Start continuous AI analysis for a camera
  const startAIAnalysis = useCallback((cameraId: number) => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera || camera.analysisInterval) return;
    const interval = setInterval(() => {
      analyzeFrameForDangers(cameraId);
    }, analysisInterval);
    setCameras(prev => prev.map(c =>
      c.id === cameraId ? { ...c, analysisInterval: interval, analysisActive: true } : c
    ));
  }, [cameras, analyzeFrameForDangers, setCameras, analysisInterval]);

  // Stop continuous AI analysis for a camera
  const stopAIAnalysis = useCallback((cameraId: number) => {
    const camera = cameras.find(c => c.id === cameraId);
    if (!camera?.analysisInterval) return;
    clearInterval(camera.analysisInterval);
    setCameras(prev => prev.map(c =>
      c.id === cameraId ? {
        ...c,
        analysisInterval: undefined,
        analysisActive: false,
        isAnalyzing: false,
        dangerDetected: false
      } : c
    ));
  }, [cameras, setCameras]);

  return { analyzeFrameForDangers, startAIAnalysis, stopAIAnalysis };
}
