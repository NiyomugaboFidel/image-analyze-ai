"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraProvider } from "../context/CameraContextProvider";
import ChatHeader from "@/components/ chart-header";
import { Sidebar } from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthoContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userAuth, setUserAuth] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserAuth(localStorage.getItem("auth_user"));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !userAuth) {
      router.push("/auth/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, userAuth, router]);

  if (isLoading || !isAuthenticated) {
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