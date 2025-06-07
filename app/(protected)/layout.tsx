"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraProvider } from "../context/CameraContextProvider";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthoContext";
import ChatHeader from "@/components/ chart-header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {
      setIsInitialized(true);
      

      if (!isAuthenticated) {
        router.push("/auth/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);


  if (!isInitialized) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 animate-fade-in">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin mb-6 shadow-lg"></div>
          <span className="text-2xl font-bold text-white drop-shadow-lg mb-2">
            Loading your dashboard...
          </span>
          <span className="text-base text-blue-100">
            Please wait while we verify your access
          </span>
        </div>
      </div>
    );
  }

 
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <CameraProvider>
      <ChatHeader />
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar userProfile={user} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </CameraProvider>
  );
}