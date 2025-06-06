// components/camera/AddCameraDialog.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CameraDevice } from '@/app/context/CameraProvider';

interface AddCameraDialogProps {
  open: boolean;
  onClose: () => void;
  cameraName: string;
  setCameraName: (name: string) => void;
  currentDeviceId: string;
  setCurrentDeviceId: (deviceId: string) => void;
  autoStart: boolean;
  setAutoStart: (autoStart: boolean) => void;
  availableDevices: CameraDevice[];
  onSave: () => void;
}

const AddCameraDialog: React.FC<AddCameraDialogProps> = ({
  open,
  onClose,
  cameraName,
  setCameraName,
  currentDeviceId,
  setCurrentDeviceId,
  autoStart,
  setAutoStart,
  availableDevices,
  onSave
}) => {
  // Local state for validation and error handling
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset validation errors when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setValidationErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate camera name
    if (!cameraName.trim()) {
      errors.cameraName = 'Camera name is required';
    } else if (cameraName.trim().length < 2) {
      errors.cameraName = 'Camera name must be at least 2 characters';
    } else if (cameraName.trim().length > 50) {
      errors.cameraName = 'Camera name must be less than 50 characters';
    }

    // Validate device selection
    if (!currentDeviceId) {
      errors.currentDeviceId = 'Please select a camera device';
    }

    // Check if no devices are available
    if (availableDevices.length === 0) {
      errors.availableDevices = 'No camera devices found. Please scan for devices first.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission with validation
  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving camera:', error);
      setValidationErrors({
        submit: 'Failed to add camera. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close with confirmation if form is dirty
  const handleClose = (): void => {
    if (isSubmitting) return;
    
    const isFormDirty = cameraName.trim() !== '' || currentDeviceId !== '';
    
    if (isFormDirty) {
      const confirmClose = window.confirm('Are you sure you want to close? Any unsaved changes will be lost.');
      if (!confirmClose) return;
    }
    
    onClose();
  };

  // Handle camera name change with validation
  const handleCameraNameChange = (value: string): void => {
    setCameraName(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.cameraName) {
      setValidationErrors(prev => {
        const { cameraName, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle device selection change with validation
  const handleDeviceChange = (deviceId: string): void => {
    setCurrentDeviceId(deviceId);
    
    // Clear validation error when user selects a device
    if (validationErrors.currentDeviceId) {
      setValidationErrors(prev => {
        const { currentDeviceId, ...rest } = prev;
        return rest;
      });
    }
  };

  // Get device display name with fallback
  const getDeviceDisplayName = (device: CameraDevice): string => {
    if (!device.label || device.label.trim() === '') {
      return `Camera ${device.deviceId.substring(0, 8)}...`;
    }
    return device.label;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
        max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto
        shadow-2xl rounded-xl
      ">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-2xl">📹</span>
            Add Camera
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Configure and add a new camera to your monitoring system. Make sure to grant camera permissions when prompted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Camera Name Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="camera-name" 
              className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2"
            >
              📝 Camera Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="camera-name"
              value={cameraName}
              onChange={(e) => handleCameraNameChange(e.target.value)}
              placeholder="Enter a descriptive name (e.g., 'Front Door', 'Office Desk')"
              className={`
                border shadow-sm bg-white dark:bg-gray-800 dark:text-gray-100
                transition-all duration-200 rounded-lg
                ${validationErrors.cameraName 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                }
              `}
              maxLength={50}
              disabled={isSubmitting}
            />
            {validationErrors.cameraName && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>⚠️</span>
                {validationErrors.cameraName}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {cameraName.length}/50 characters
            </p>
          </div>

          {/* Device Selection */}
          <div className="space-y-2">
            <Label 
              htmlFor="camera-device" 
              className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2"
            >
              🎥 Camera Device
              <span className="text-red-500">*</span>
            </Label>
            
            {availableDevices.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <span>⚠️</span>
                  No camera devices found. Please scan for devices first.
                </p>
              </div>
            ) : (
              <>
                <Select 
                  value={currentDeviceId} 
                  onValueChange={handleDeviceChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="camera-device" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select a camera device" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                    {availableDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId} className="text-gray-900 dark:text-gray-100">
                        {getDeviceDisplayName(device)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.currentDeviceId && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    {validationErrors.currentDeviceId}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Auto Start Switch */}
          <div className="flex items-center gap-2">
            <Switch
              id="auto-start"
              checked={autoStart}
              onCheckedChange={setAutoStart}
              disabled={isSubmitting}
            />
            <Label htmlFor="auto-start" className="text-sm text-gray-900 dark:text-gray-200">Auto-start camera on app launch</Label>
          </div>

          {/* Submission Error */}
          {validationErrors.submit && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠️</span>
              {validationErrors.submit}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800">
            {isSubmitting ? 'Saving...' : 'Add Camera'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraDialog;