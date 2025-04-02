// app/page.tsx
import React from 'react';
import { Header } from '../components/Header';
import { CameraCard } from '../components/CameraCard';
import RecentChats from '../components/RecentsCard';
import ConstructionMonitoringSystem from '../components/VideoPlayer';
import { ChatProvider } from '../context/ChatContext';



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
          <RecentChats />
        </div>
        
        <div className="col-span-12 lg:col-span-9 p-4">
          <ConstructionMonitoringSystem/>
        </div>
            
      
      </div>
      </ChatProvider>
    </div>
  );
}