'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Download, Pencil, MoreHorizontal, Calendar, Mic, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useCamera } from '../context/CameraContextProvider';

type HeaderProps = {
  title: string;
  duration?: string;
  onReset?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
};

export function Header({ 
  title, 
  duration, 
  onReset = () => window.location.reload(),
  onEdit = () => console.log("Edit clicked"),
  onDownload = () => console.log("Download clicked"),
  onShare = () => console.log("Share clicked")
}: HeaderProps) {
  // Get camera context
  const { cameras } = useCamera();
  
  // State for current date and recording status
  const [currentDate, setCurrentDate] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState("0:00");
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Check if any camera is currently active (recording)
  const isRecording = cameras.some(camera => camera.status === 'active');
  
  // Format date to display day, month, and year
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);
  
  // Update current date every minute
  useEffect(() => {
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(dateInterval);
  }, []);
  
  // Start/stop timer when recording status changes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRecording && !startTime) {
      // Start recording - set start time
      setStartTime(new Date());
    } else if (!isRecording && startTime) {
      // Recording stopped - reset start time
      setStartTime(null);
    }
    
    if (isRecording && startTime) {
      // Update elapsed time every second while recording
      timer = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording, startTime]);
  
  // Toggle recording for all cameras
  const toggleRecording = () => {
    // This function would need to toggle all cameras' status
    // You would need to implement this in your camera context
    console.log("Toggle recording clicked");
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-4 mb-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
                <ChevronLeft size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to Dashboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <h1 className="text-xl font-semibold flex-grow">{title}</h1>
        
        {isRecording && (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Recording
          </Badge>
        )}
      </div>
      
      <div className="flex items-center text-sm text-gray-600 gap-6 ml-10">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span>{duration || (isRecording ? elapsedTime : "0:00")}</span>
        </div>
        
        {cameras.length > 0 && (
          <div className="flex items-center gap-2">
            <Mic size={14} className="text-gray-400" />
            <span>{cameras.filter(cam => cam.status === 'active').length} of {cameras.length} active</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center mt-5 ml-10 justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-700 hover:bg-gray-50"
            onClick={onDownload}
          >
            <Download size={16} className="mr-2 text-gray-500" />
            <span>Download</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-700 hover:bg-gray-50"
            onClick={onEdit}
          >
            <Pencil size={16} className="mr-2 text-gray-500" />
            <span>Edit</span>
          </Button>
          
          <Button 
            variant={isRecording ? "destructive" : "outline"} 
            size="sm" 
            className={isRecording ? "bg-red-500 hover:bg-red-600" : "text-gray-700 hover:bg-gray-50"}
            onClick={toggleRecording}
          >
            <Mic size={16} className="mr-2" />
            <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-700 hover:bg-gray-50"
            onClick={onShare}
          >
            <Share2 size={16} className="mr-2 text-gray-500" />
            <span>Share</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Export Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button 
          onClick={onReset} 
          variant="default" 
          size="sm" 
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          Reset
        </Button>
      </div>
      
      <Separator className="mt-5" />
    </div>
  );
}