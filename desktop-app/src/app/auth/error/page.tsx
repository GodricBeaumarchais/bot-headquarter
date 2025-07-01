'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthErrorPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('Une erreur est survenue');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('message');
    
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    }
    
    // Rediriger vers login après 5 secondes
    setTimeout(() => {
      router.push('/login');
    }, 5000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Erreur d'authentification
          </h2>
          <p className="text-red-400 mb-4">
            {error}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Redirection automatique vers la page de connexion dans 5 secondes...
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
} 