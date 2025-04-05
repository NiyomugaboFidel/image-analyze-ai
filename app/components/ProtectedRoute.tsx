// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthoContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = getToken();
    console.log('Token:', token);
    console.log('isAuthenticated:', isAuthenticated);
    
    if (!token) {
      // Redirect to login page if no token is found
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, getToken]);

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;