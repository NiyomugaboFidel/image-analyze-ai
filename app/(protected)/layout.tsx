'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraProvider } from '../context/CameraContextProvider';
import ChatHeader from '@/components/ chart-header';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthoContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, getToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's a token
    const token = getToken();
    console.log('Token:', token);
    
    if (!token) {
      // Redirect to login if no token found
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [getToken, router]);

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <>  <CameraProvider>
  <ChatHeader />

  <div className="flex h-screen bg-gray-50">
  <Sidebar userProfile={user} />
  <main className="flex-1 overflow-auto p-4">
    {children}
   
  </main>
</div>
</CameraProvider></>;
}