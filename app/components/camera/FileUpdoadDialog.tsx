// components/camera/FileUploadDialog.tsx
'use client';
import React, { useRef, useState } from 'react';
import { UploadedFile, ThemeMode } from './CameraMonitoringSystem';

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (files: FileList | null) => void;
  onClearFiles: () => void;
  uploadedFiles: UploadedFile[];
  theme?: ThemeMode;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  onClearFiles,
  uploadedFiles,
  theme = 'dark'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    onFileUpload(files);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e.target.files);
    if (e.target.value) {
      e.target.value = '';
    }
  };

  const getSeverityColor = (severity?: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📁 File Upload & Analysis</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${
                theme === 'dark' 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? theme === 'dark'
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-blue-400 bg-blue-50'
                : theme === 'dark'
                  ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="space-y-4">
              <div className="text-4xl">📤</div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Upload Images or Videos for AI Analysis
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Drag and drop files here, or click to select files
                </p>
                <p className={`text-xs mt-2 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Supported formats: JPG, PNG, GIF, MP4, AVI, MOV
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <button
                  onClick={onClearFiles}
                  className={`px-3 py-1 text-sm rounded transition ${
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* File Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={file.data}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium truncate">{file.name}</h4>
                          <div className={`flex items-center gap-2 mt-1 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span className="capitalize">{file.type}</span>
                            <span>•</span>
                            <span>{file.timestamp}</span>
                          </div>
                        </div>

                        {/* Analysis Status */}
                        <div className="text-right">
                          {file.analysisResult ? (
                            <div className="flex items-center gap-2">
                              {file.analysisResult.isDanger ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                                  getSeverityColor(file.analysisResult.severity)
                                }`}>
                                  {file.analysisResult.severity?.toUpperCase() || 'DANGER'}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                                  SAFE
                                </span>
                              )}
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {file.analysisResult.confidence}%
                              </span>
                            </div>
                          ) : (
                            <span className={`text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Analyzing...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Analysis Result */}
                      {file.analysisResult && (
                        <div className="mt-2">
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {file.analysisResult.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {uploadedFiles.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h4 className="font-medium mb-2">Analysis Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {uploadedFiles.length}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total Files
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {uploadedFiles.filter(f => f.analysisResult && !f.analysisResult.isDanger).length}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Safe
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {uploadedFiles.filter(f => f.analysisResult && f.analysisResult.isDanger).length}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Dangers
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {uploadedFiles.filter(f => !f.analysisResult).length}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Processing
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUploadDialog;