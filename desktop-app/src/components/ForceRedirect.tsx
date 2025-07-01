'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const ForceRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('🔄 ForceRedirect - Vérification:', { isAuthenticated, isLoading, hasRedirected: hasRedirected.current });
    
    if (isAuthenticated && !isLoading && !hasRedirected.current) {
      console.log('🚀 Force redirection vers la page principale...');
      hasRedirected.current = true;
      
      // Utiliser setTimeout pour s'assurer que la redirection se fait après le rendu
      const timeoutId = setTimeout(() => {
        router.replace('/');
      }, 100);

      // Cleanup function
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, router]);

  return null; // Ce composant ne rend rien
}; 