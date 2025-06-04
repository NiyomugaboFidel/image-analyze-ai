// app/page.tsx
import CameraMonitoringSystem from '@/app/components/camera/CameraMonitoringSystem';
import { CameraCard } from '@/app/components/CameraCard';
import { Header } from '@/app/components/Header';
import RecentChatsComponent from '@/app/components/RecentsCard';
// import CameraMonitoringSystem from '@/app/components/VideoPlayer';
import { ChatProvider } from '@/app/context/ChatContext';
import React from 'react';



export default function Home() {


  return (
    <div className=" mx-auto p-4">
        <ChatProvider>
      
      <Header 
        title="Construction Camera Control"
        duration="45 min" 
      />
      
      <div className="grid grid-cols-12  mt-6">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          <CameraCard />
          <RecentChatsComponent />
        </div>
        
        <div className="col-span-12 lg:col-span-9 p-4">
          {/* <CameraMonitoringSystem/> */}
          <CameraMonitoringSystem />
        </div>
            
      
      </div>
      </ChatProvider>
    </div>
  );
}