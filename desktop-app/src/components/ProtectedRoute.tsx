'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from './Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - État:', { 
      isAuthenticated, 
      isLoading, 
      error, 
      hasRedirected 
    });

    if (!isLoading && !isAuthenticated && !hasRedirected) {
      console.log('🔄 Redirection vers la page de connexion...');
      setHasRedirected(true);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, hasRedirected, error]);

  if (isLoading) {
    console.log('⏳ Affichage du loader...');
    return <Loader />;
  }

  if (!isAuthenticated) {
    console.log('❌ Non authentifié, redirection...');
    return null; // Sera redirigé vers /login
  }

  console.log('✅ Authentifié, affichage du contenu');
  return <>{children}</>;
}; 