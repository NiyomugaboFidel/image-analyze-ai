import React from 'react';
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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-900'>
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Add Camera</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Configure and add a new camera to your monitoring system.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="camera-name" className="text-gray-900 dark:text-gray-200">Camera Name</Label>
            <Input
              id="camera-name"
              className='border shadow-lg bg-white dark:bg-gray-800 dark:text-gray-100'
              value={cameraName}
              onChange={(e) => setCameraName(e.target.value)}
              placeholder="Enter camera name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="camera-device" className="text-gray-900 dark:text-gray-200">Select Camera Device</Label>
            <Select value={currentDeviceId} onValueChange={setCurrentDeviceId}>
              <SelectTrigger id="camera-device" className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-gray-100">
                {availableDevices.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-start" 
              checked={autoStart}
              onCheckedChange={setAutoStart}
            />
            <Label htmlFor="auto-start" className="text-gray-900 dark:text-gray-200">Automatically start camera</Label>
          </div>
        </div>
        <DialogFooter>
          <Button className='hover:bg-[#E63946] bg-[#E63911] text-white' onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={onSave}
            className="dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Add Camera
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraDialog;