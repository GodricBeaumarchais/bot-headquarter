'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorMessage = urlParams.get('message');
    
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }
    
    if (token) {
      try {
        login(token);
        router.push('/');
      } catch (err) {
        setError('Erreur lors de la connexion');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } else {
      setError('Token manquant');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [login, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Erreur de connexion
            </h2>
            <p className="text-red-400 mb-4">
              {error}
            </p>
            <p className="text-gray-400 text-sm">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connexion réussie !
          </h2>
          <p className="text-gray-400">
            Redirection vers votre dashboard...
          </p>
        </div>
      </div>
    </div>
  );
} 