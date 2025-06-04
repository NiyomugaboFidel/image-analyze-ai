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
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        
        // Start frame analysis with longer interval to avoid rate limits
        const interval = setInterval(analyzeCurrentFrame, 10000); // Analyze every 10 seconds
        setProcessingIntervalRef(interval);
      }
    } catch (err: any) {
      console.error("Error accessing webcam:", err);
      setError(`Camera error: ${err.message || 'Please check camera permissions'}`);
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

  // Capture current frame from video with size optimization
  const captureFrame = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Reduce image size to prevent large payloads
      const maxWidth = 512;
      const maxHeight = 384;
      
      let { videoWidth, videoHeight } = video;
      
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
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        // Use lower quality to reduce size
        return canvas.toDataURL('image/jpeg', 0.6);
      }
    }
    return null;
  };

  // Convert data URL to base64 string
  const dataURLToBase64 = (dataURL: string): string => {
    return dataURL.split(',')[1];
  };

  // Analyze frame for dangers using Gemini API
  const analyzeCurrentFrame = async () => {
    if (isAnalyzing) return; // Prevent multiple simultaneous analyses
    
    const frameDataUrl = captureFrame();
    if (!frameDataUrl) {
      setError("Failed to capture frame from video");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.");
      }
      
      // Convert data URL to base64
      const base64Image = dataURLToBase64(frameDataUrl);
      
      // Prepare the request payload
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: "Analyze this image for any dangerous situations such as: fire, smoke, people without safety equipment, falling objects, unsafe working conditions, accidents, or any other hazardous scenarios. If you detect danger, describe it clearly and specifically. If no danger is present, respond with exactly 'No danger detected.'"
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
      
      // Make API request with proper error handling
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
        const errorText = await response.text();
        let errorMessage = `API Error (${response.status}): ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // If can't parse JSON, use the text response
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Extract the response text
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!description) {
        throw new Error("No response received from AI model");
      }
      
      // Only store detection if danger was found
      if (!description.toLowerCase().includes("no danger detected")) {
        const timestamp = new Date().toLocaleString();
        
        setDetections(prev => [
          {
            timestamp,
            image: frameDataUrl,
            description: description.trim()
          },
          ...prev.slice(0, 9) // Keep only last 10 detections to manage memory
        ]);
      }
      
    } catch (error: any) {
      console.error("Error analyzing frame:", error);
      let errorMessage = "Error analyzing frame";
      
      if (error.message.includes("API key")) {
        errorMessage = "API key issue: " + error.message;
      } else if (error.message.includes("quota")) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (error.message.includes("network") || error.name === "NetworkError") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Slowing down analysis.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Manual analysis trigger
  const triggerManualAnalysis = async () => {
    if (!isStreaming) {
      setError("Please start the camera first");
      return;
    }
    await analyzeCurrentFrame();
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
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
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
                    <div className="bg-white px-4 py-2 rounded-md">
                      <div className="text-gray-800 font-medium">Analyzing for dangers...</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 flex-wrap">
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
                    onClick={triggerManualAnalysis}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
                  </button>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>• Camera automatically analyzes for dangers every 10 seconds</p>
                <p>• Click "Analyze Now" for immediate analysis</p>
                <p>• Only dangerous situations are recorded</p>
              </div>
            </div>
          </div>
          
          {/* Detections section */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Danger Detections ({detections.length})
              </h2>
              
              {detections.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  <div className="text-4xl mb-2">🛡️</div>
                  <div>No dangers detected yet</div>
                  <div className="text-xs mt-1">System is monitoring for safety</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {detections.map((detection, index) => (
                    <div key={index} className="border border-red-200 rounded-md p-3 bg-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ⚠️ DANGER
                        </span>
                        <span className="text-sm text-gray-600">
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
                          <h3 className="font-medium mb-1 text-red-800">Analysis:</h3>
                          <p className="text-sm text-gray-700">{detection.description}</p>
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