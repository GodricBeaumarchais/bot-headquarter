'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ForceRedirect } from '../../components/ForceRedirect';

export default function LoginPage() {
  const { isAuthenticated, login, isLoading, error } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const handleRedirect = useCallback(() => {
    if (!hasRedirected) {
      console.log('✅ Redirection vers la page principale...');
      setHasRedirected(true);
      router.replace('/');
    }
  }, [hasRedirected, router]);

  // Rediriger si déjà connecté
  useEffect(() => {
    console.log('🔐 LoginPage - État:', { isAuthenticated, isLoading, error, hasRedirected });
    
    if (isAuthenticated && !isLoading && !hasRedirected) {
      handleRedirect();
    }
  }, [isAuthenticated, isLoading, error, hasRedirected, handleRedirect]);

  // Gérer le callback d'authentification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && !isProcessing && !hasRedirected) {
      console.log('🎫 Token trouvé dans l\'URL, traitement de la connexion...');
      setIsProcessing(true);
      
      try {
        login(token);
        console.log('✅ Connexion réussie, redirection...');
        handleRedirect();
      } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        setIsProcessing(false);
      }
    }
  }, [login, isProcessing, hasRedirected, handleRedirect]);

  const handleDiscordLogin = useCallback(() => {
    console.log('🎮 Redirection vers Discord OAuth...');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/auth/discord`;
  }, []);

  // Si on est en train de rediriger, afficher un loader
  if (isLoading || isProcessing || (isAuthenticated && !hasRedirected)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white">
            {isAuthenticated ? 'Redirection vers le dashboard...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  // Si déjà authentifié, ne pas afficher le formulaire de connexion
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white">Redirection vers le dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ForceRedirect />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Bot Headquarters
            </h1>
            <p className="text-gray-400 text-lg">
              Connectez-vous pour accéder à votre dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">
                Erreur: {error}
              </p>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Connexion Discord
                </h2>
                <p className="text-gray-400 mt-2">
                  Utilisez votre compte Discord pour vous connecter
                </p>
              </div>

              <button
                onClick={handleDiscordLogin}
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>{isProcessing ? 'Connexion en cours...' : 'Se connecter avec Discord'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 