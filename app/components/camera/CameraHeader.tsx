import React from 'react';
import { RefreshCw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CameraHeaderProps {
  isScanning: boolean;
  handleScanForDevices: () => void;
  addCamera: () => void;
  camerasCount: number;
  availableDevicesCount: number;
}

const CameraHeader: React.FC<CameraHeaderProps> = ({ 
  isScanning, 
  handleScanForDevices, 
  addCamera, 
  camerasCount, 
  availableDevicesCount 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cameras Control</h1>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={handleScanForDevices}
                disabled={isScanning}
                className="h-9 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                {isScanning ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Scan
              </Button>
            </TooltipTrigger>
            <TooltipContent className='border bg-gray-200 dark:bg-gray-800 dark:text-gray-200 p-2 rounded-md'>
              <p>Scan for available camera devices</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                onClick={addCamera}
                disabled={camerasCount >= 6 || availableDevicesCount === 0}
                className="h-9 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                <Camera size={16} className="mr-2" />
                Add Camera ({camerasCount}/6)
              </Button>
            </TooltipTrigger>
            <TooltipContent className='border bg-gray-200 dark:bg-gray-800 dark:text-gray-200 p-2 rounded-md'>
              <p>Add a new camera to monitor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CameraHeader;