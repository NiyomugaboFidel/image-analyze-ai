'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 text-white px-4">
      <div className="flex flex-col items-center">
        <AlertTriangle className="w-20 h-20 text-yellow-300 mb-6 animate-bounce" />
        <h1 className="text-6xl font-extrabold mb-2 drop-shadow-lg">404</h1>
        <h2 className="text-2xl font-bold mb-4 drop-shadow">Page Not Found</h2>
        <p className="mb-8 text-lg text-blue-100 text-center max-w-md">
          Sorry, the page you are looking for does not exist or has been moved. Please check the URL or return to the homepage.
        </p>
        <Button asChild className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg transition-all duration-200">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
