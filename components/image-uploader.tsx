"use client"

import React, { useCallback, useState, useEffect, RefObject } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Camera, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  onImageSelected: (file: File) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [showCamera, setShowCamera] = useState<boolean>(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState<boolean>(false)
  
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onImageSelected(acceptedFiles[0])
    }
  }, [onImageSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  })

  // Cleanup function to stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [videoStream])

  // Initialize camera when showCamera becomes true
  useEffect(() => {
    if (showCamera) {
      // Need to make sure videoRef is available
      setTimeout(() => {
        if (videoRef.current && videoStream) {
          videoRef.current.srcObject = videoStream
          
          videoRef.current.onloadeddata = () => {
            console.log("Video data loaded")
            setCameraReady(true)
          }
          
          videoRef.current.oncanplay = () => {
            console.log("Video can play")
            setCameraReady(true)
          }
          
          // // Fix for the TypeScript error - properly type the event
          // videoRef.current.onerror = (event: Event) => {
          //   const target = event.target as HTMLVideoElement;
          //   console.error("Video error:", event)
          //   setErrorMessage("Error initializing video: " + (target.error?.message || "Unknown error"))
          // }
          
          videoRef.current.play().catch(err => {
            console.error("Error playing video:", err)
            setErrorMessage("Could not play video stream: " + err.message)
          })
        } else {
          console.log("Video reference or stream not available yet")
          if (!videoRef.current) setErrorMessage("Video element not found - please try again")
          if (!videoStream) setErrorMessage("Camera stream not established - please try again")
        }
      }, 100) // Short delay to ensure DOM is updated
    }
  }, [showCamera, videoStream])

  // Camera handling
  const startCamera = async (): Promise<void> => {
    setErrorMessage(null)
    setCameraReady(false)
    
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in your browser")
      }
      
      // First stop any existing stream
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
      
      console.log("Requesting camera access...")
      
      // Try to get the stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment", 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      console.log("Camera access granted")
      
      // Set the stream to state first, then show camera
      setVideoStream(stream)
      setShowCamera(true)
      
    } catch (err) {
      console.error("Error accessing camera:", err)
      
      let message = "Could not access camera. Please ensure you've granted permission."
      if (err instanceof Error) {
        message = err.message
      }
      
      setErrorMessage(message)
      setShowCamera(false)
      setCameraReady(false)
    }
  }

  const stopCamera = (): void => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.onloadeddata = null
      videoRef.current.oncanplay = null
      videoRef.current.onerror = null
    }
    
    setShowCamera(false)
    setCameraReady(false)
    setErrorMessage(null)
  }

  const captureImage = (): void => {
    if (!videoRef.current) {
      setErrorMessage("Video element not available - please restart camera")
      return
    }
    
    if (!canvasRef.current) {
      setErrorMessage("Canvas element not available - please refresh page")
      return
    }
    
    if (!cameraReady) {
      setErrorMessage("Camera is not ready yet. Please wait.")
      return
    }

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) {
        throw new Error("Could not access canvas context")
      }

      // Check if video is playing and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Video stream has no dimensions. Please restart camera.")
      }

      console.log("Capturing image from video:", video.videoWidth, "x", video.videoHeight)

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob with a timeout for safety
      const captureTimeout = setTimeout(() => {
        setIsCapturing(false)
        setErrorMessage("Capture timed out. Please try again.")
      }, 3000)
      
      canvas.toBlob((blob) => {
        clearTimeout(captureTimeout)
        
        if (blob && blob.size > 0) {
          console.log("Image captured successfully, size:", blob.size)
          
          // Create a File object from the blob
          const fileName = `camera-capture-${new Date().getTime()}.jpg`
          const file = new File([blob], fileName, { type: 'image/jpeg' })
          
          // Call the callback with the captured image
          onImageSelected(file)
          
          // Stop the camera
          stopCamera()
          setIsCapturing(false)
        } else {
          throw new Error("Failed to create valid image from camera")
        }
      }, 'image/jpeg', 0.8)
    } catch (err) {
      console.error("Error capturing image:", err)
      setIsCapturing(false)
      
      let message = "Failed to capture image. Please try again."
      if (err instanceof Error) {
        message = err.message
      }
      
      setErrorMessage(message)
    }
  }

  return (
    <div className="w-full">
      {!showCamera ? (
        <>
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
            )}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            
            <div className="flex justify-center mb-4">
              {isDragActive ? (
                <Upload className="h-12 w-12 text-primary" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div className="space-y-2">
              {isDragActive ? (
                <p className="text-lg font-medium text-primary">Drop the image here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium">Drag & drop an image here</p>
                  <p className="text-sm text-gray-500">Or click to browse files</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button type="button" variant="outline" size="sm">
                      Select Image
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, GIF, WEBP</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={startCamera}
              className="gap-2"
            >
              <Camera size={16} />
              Use Camera
            </Button>
          </div>
          
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="relative">
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                <p className="text-gray-500">Initializing camera...</p>
              </div>
            )}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              type="button" 
              onClick={captureImage} 
              className="gap-2"
              disabled={!cameraReady || isCapturing}
            >
              <Camera size={16} />
              {isCapturing ? "Capturing..." : "Take Photo"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={stopCamera}
              disabled={isCapturing}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader