// components/camera/EmptyCameraState.jsx
import React from 'react';
import { Camera } from 'lucide-react';

const EmptyCameraState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Camera size={48} />
      <p className="mt-4">No cameras added</p>
      <p className="text-sm">Click "Add Camera" to start monitoring</p>
    </div>
  );
};

export default EmptyCameraState;