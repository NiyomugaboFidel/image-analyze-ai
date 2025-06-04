// components/camera/CameraViewContainer.tsx
'use client';
import React from 'react';
import { Camera, DangerDetection } from './CameraMonitoringSystem';

interface CameraViewContainerProps {
  cameras: Camera[];
  activeTab: 'live' | 'captures' | 'dangers';
  handleTabChange: (tab: 'live' | 'captures' | 'dangers') => void;
  fullscreenCamera: number | null;
  toggleCameraStatus: (cameraId: number) => void;
  captureImage: (cameraId: number) => void;
  toggleFullscreen: (cameraId: number) => void;
  removeCamera: (cameraId: number) => void;
  onViewImage: (imageUrl: string) => void;
  // Enhanced props for AI detection
  triggerManualAnalysis?: (cameraId: number) => void;
  dangerDetections?: DangerDetection[];
  aiDetectionEnabled?: boolean;
}

const CameraViewContainer: React.FC<CameraViewContainerProps> = ({
  cameras,
  activeTab,
  handleTabChange,
  fullscreenCamera,
  toggleCameraStatus,
  captureImage,
  toggleFullscreen,
  removeCamera,
  onViewImage,
  triggerManualAnalysis,
  dangerDetections = [],
  aiDetectionEnabled = false
}) => {
  // Get severity color
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Get camera danger status
  const getCameraDangerStatus = (cameraId: number) => {
    return cameras.find(c => c.id === cameraId)?.dangerDetected || false;
  };

  // Render individual camera feed
  const renderCameraFeed = (camera: Camera) => (
    <div 
      key={camera.id}
      className={`relative bg-gray-900 rounded-lg overflow-hidden aspect-video ${
        fullscreenCamera === camera.id ? 'col-span-full row-span-full' : ''
      } ${camera.dangerDetected ? 'ring-2 ring-red-500 ring-opacity-75' : ''}`}
    >
      {/* Camera header with status indicators */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          camera.status === 'active' ? 'bg-green-600 text-white' :
          camera.status === 'error' ? 'bg-red-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          {camera.name}
        </div>
        
        {/* AI Analysis indicator */}
        {aiDetectionEnabled && camera.status === 'active' && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            camera.isAnalyzing ? 'bg-blue-600 text-white animate-pulse' :
            camera.dangerDetected ? 'bg-red-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {camera.isAnalyzing ? '🔍 Analyzing' : 
             camera.dangerDetected ? '⚠️ Danger' : '🛡️ Safe'}
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {triggerManualAnalysis && camera.status === 'active' && (
          <button
            onClick={() => triggerManualAnalysis(camera.id)}
            disabled={camera.isAnalyzing}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs transition"
            title="Analyze for dangers"
          >
            🔍
          </button>
        )}
        
        <button
          onClick={() => captureImage(camera.id)}
          disabled={camera.status !== 'active'}
          className="p-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded text-xs transition"
          title="Capture image"
        >
          📷
        </button>
        
        <button
          onClick={() => toggleFullscreen(camera.id)}
          className="p-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition"
          title="Toggle fullscreen"
        >
          {fullscreenCamera === camera.id ? '🗗' : '🗖'}
        </button>
        
        <button
          onClick={() => toggleCameraStatus(camera.id)}
          className={`p-1.5 text-white rounded text-xs transition ${
            camera.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
          title={camera.status === 'active' ? 'Stop camera' : 'Start camera'}
        >
          {camera.status === 'active' ? '⏸️' : '▶️'}
        </button>
        
        <button
          onClick={() => removeCamera(camera.id)}
          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
          title="Remove camera"
        >
          🗑️
        </button>
      </div>

      {/* Video element */}
      {camera.status === 'active' && camera.stream ? (
        <video
          ref={(videoElement) => {
            if (videoElement) {
              videoElement.srcObject = camera.stream;
              videoElement.setAttribute('data-camera-id', String(camera.id));
            }
          }}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            {camera.status === 'error' ? (
              <>
                <div className="text-2xl mb-2">❌</div>
                <div className="text-sm">{camera.errorMessage || 'Camera Error'}</div>
              </>
            ) : (
              <>
                <div className="text-2xl mb-2">📹</div>
                <div className="text-sm">Camera Paused</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Analysis overlay */}
      {camera.isAnalyzing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-md">
            <div className="text-gray-800 dark:text-gray-200 font-medium text-sm">
              🔍 Analyzing for dangers...
            </div>
          </div>
        </div>
      )}

      {/* Danger alert overlay */}
      {camera.dangerDetected && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
          ⚠️ Danger detected - Check alerts tab
        </div>
      )}

      {/* Last analysis timestamp */}
      {camera.lastAnalysis && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Last scan: {new Date(camera.lastAnalysis).toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  // Render danger detections list
  const renderDangerDetections = () => (
    <div className="space-y-4">
      {dangerDetections.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">🛡️</div>
          <div className="text-lg font-medium">No dangers detected</div>
          <div className="text-sm mt-2">All cameras are monitoring for safety</div>
        </div>
      ) : (
        dangerDetections.map((detection) => (
          <div
            key={detection.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-red-500 p-4"
          >
            <div className="flex items-start gap-4">
              {/* Detection image */}
              <div className="flex-shrink-0">
                <img
                  src={detection.image}
                  alt="Danger detection"
                  className="w-24 h-18 object-cover rounded cursor-pointer"
                  onClick={() => onViewImage(detection.image)}
                />
              </div>
              
              {/* Detection details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(detection.severity)}`}>
                    {detection.severity.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{detection.cameraName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {detection.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {detection.description}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewImage(detection.image)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Full Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => handleTabChange('live')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'live'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📹 Live Feeds ({cameras.length})
          </button>
          
          <button
            onClick={() => handleTabChange('captures')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'captures'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📷 Captures ({cameras.filter(c => c.lastCapture).length})
          </button>
          
          <button
            onClick={() => handleTabChange('dangers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dangers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            ⚠️ Danger Alerts ({dangerDetections.length})
            {dangerDetections.length > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {dangerDetections.filter(d => d.severity === 'high').length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'live' && (
          <div className={`grid gap-4 ${
            fullscreenCamera ? 'grid-cols-1' : 
            cameras.length === 1 ? 'grid-cols-1' :
            cameras.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {cameras.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📹</div>
                <div className="text-lg font-medium">No cameras added</div>
                <div className="text-sm mt-2">Add your first camera to start monitoring</div>
              </div>
            ) : (
              cameras.map(renderCameraFeed)
            )}
          </div>
        )}

        {activeTab === 'captures' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cameras.filter(c => c.lastCapture).length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📷</div>
                <div className="text-lg font-medium">No captures yet</div>
                <div className="text-sm mt-2">Capture images from your camera feeds</div>
              </div>
            ) : (
              cameras
                .filter(c => c.lastCapture)
                .map(camera => (
                  <div key={camera.id} className="space-y-2">
                    <img
                      src={camera.lastCapture}
                      alt={`Capture from ${camera.name}`}
                      className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() => onViewImage(camera.lastCapture)}
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {camera.name}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'dangers' && renderDangerDetections()}
      </div>
    </div>
  );
};

export default CameraViewContainer;