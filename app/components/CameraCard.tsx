'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Camera } from 'lucide-react';
import { useCamera } from '../context/CameraContextProvider';

export function CameraCard() {
  const { cameras, availableDevices } = useCamera();
  
  // Helper function to get color based on camera status
  const getStatusColor = (status: string) => {
    if (status === 'active') return 'text-green-500';
    if (status === 'paused') return 'text-blue-600';
    if (status === 'error') return 'text-red-600';
    return 'text-gray-500';
  };
  
  // Helper function to get status as number for backward compatibility
  const getPositionNumber = (status: string) => {
    if (status === 'active') return 3;
    if (status === 'paused') return 2;
    if (status === 'error') return 1;
    return 0;
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Connected Cameras ({cameras.length}/{availableDevices.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameras.length === 0 ? (
          <div className="flex items-center justify-center py-3 text-gray-500">
            <p className="text-sm">No cameras configured</p>
          </div>
        ) : (
          cameras.map((camera) => (
            <div key={camera.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={camera.lastCapture || ''} alt={camera.name} />
                  <AvatarFallback>
                    <Camera size={16} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{camera.name}</p>
                  <p className="text-xs text-gray-500">
                    {availableDevices.find(d => d.deviceId === camera.deviceId)?.label || "Unknown device"}
                  </p>
                </div>
              </div>
              <div className={`font-medium ${getStatusColor(camera.status)}`}>
                {camera.status}
              </div>
            </div>
          ))
        )}
        
        {availableDevices.length > 0 && availableDevices.length !== cameras.length && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              {availableDevices.length - cameras.length} additional camera(s) available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}