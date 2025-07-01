'use client';

import { useAuth } from '../contexts/AuthContext';

export const ClearStorageButton: React.FC = () => {
  const { logout } = useAuth();

  const handleClearStorage = () => {
    console.log('🧹 Nettoyage du localStorage...');
    localStorage.clear();
    logout();
    window.location.reload();
  };

  return (
    <button
      onClick={handleClearStorage}
      className="fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs z-50"
      title="Nettoyer le localStorage et redémarrer"
    >
      🧹 Clear
    </button>
  );
}; 