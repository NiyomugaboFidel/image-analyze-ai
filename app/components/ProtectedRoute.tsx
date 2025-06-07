// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthoContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    if (!isAuthenticated && !storedUser) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return <>{children}</>;
};

export default ProtectedRoute;