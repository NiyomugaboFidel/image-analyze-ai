'use client';
// pages/index.tsx
import React, { useRef, useState, useEffect } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<Array<{
    timestamp: string;
    image: string;
    description: string;
  }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingInterval, setProcessingIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start webcam stream
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        
        // Start frame analysis
        const interval = setInterval(analyzeCurrentFrame, 5000); // Analyze every 5 seconds
        setProcessingIntervalRef(interval);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Error accessing webcam. Please make sure your camera is connected and you've granted permission.");
    }
  };

  // Stop webcam stream
  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      
      if (processingInterval) {
        clearInterval(processingInterval);
        setProcessingIntervalRef(null);
      }
    }
  };

  // Capture current frame from video
  const captureFrame = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  };

  // Analyze frame for dangers using Gemini API
  const analyzeCurrentFrame = async () => {
    if (isAnalyzing) return; // Prevent multiple simultaneous analyses
    
    const frameDataUrl = captureFrame();
    if (!frameDataUrl) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Convert data URL to base64
      const base64Image = frameDataUrl.split(',')[1];
      
      // Call Gemini API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.NEXT_PUBLIC_GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this image and tell me if there's any dangerous situation like fire, smoke, people without safety equipment, falling objects, etc. If danger is detected, describe it in detail. If no danger, just respond with 'No danger detected.'"
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
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 300,
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Unknown error with Gemini API');
      }
      
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis available";
      
      // Only store detection if danger was found
      if (description.toLowerCase() !== "no danger detected.") {
        const timestamp = new Date().toLocaleTimeString();
        
        setDetections(prev => [
          {
            timestamp,
            image: frameDataUrl,
            description
          },
          ...prev
        ]);
      }
    } catch (error: any) {
      console.error("Error analyzing frame:", error);
      setError(error.message || "Error analyzing frame");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Danger Detection System</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video feed section */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Live Camera Feed</h2>
              
              <div className="relative bg-black rounded-md overflow-hidden aspect-video mb-4">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white font-medium">Analyzing...</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                {!isStreaming ? (
                  <button
                    onClick={startStream}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopStream}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Stop Camera
                  </button>
                )}
                
                {isStreaming && (
                  <button
                    onClick={analyzeCurrentFrame}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    Analyze Now
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Detections section */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Danger Detections</h2>
              
              {detections.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No dangers detected yet
                </div>
              ) : (
                <div className="space-y-4">
                  {detections.map((detection, index) => (
                    <div key={index} className="border border-red-200 rounded-md p-3 bg-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                          Danger Detected
                        </span>
                        <span className="text-sm text-gray-500">
                          {detection.timestamp}
                        </span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/3">
                          <img 
                            src={detection.image} 
                            alt="Detected danger"
                            className="w-full rounded-md border border-gray-200"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <h3 className="font-medium mb-1">Description:</h3>
                          <p className="text-sm">{detection.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hidden canvas for image capture */}
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
      </div>
    </div>
  );
}