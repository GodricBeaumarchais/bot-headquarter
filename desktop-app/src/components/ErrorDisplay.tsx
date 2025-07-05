'use client';

import { useAuth } from '../contexts/AuthContext';

export const ErrorDisplay: React.FC = () => {
  const { error } = useAuth();

  if (!error) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500/50 text-red-100 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <span className="font-semibold">Erreur d'authentification</span>
      </div>
      <p className="mt-2 text-sm">{error}</p>
      <div className="mt-3 text-xs text-red-300">
        <p>• Vérifiez que votre backend est démarré sur {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}</p>
        <p>• Utilisez le bouton "Clear" pour nettoyer le localStorage</p>
        <p>• Vérifiez les logs de la console pour plus de détails</p>
      </div>
    </div>
  );
}; 