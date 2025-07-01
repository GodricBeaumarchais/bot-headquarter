'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const DebugPanel: React.FC = () => {
  const { user, token, isLoading, isAuthenticated, error } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const handleForceRedirect = () => {
    console.log('🚀 Redirection manuelle vers la page principale...');
    router.replace('/');
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Loading: {isLoading ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Has Token: {token ? '✅' : '❌'}</div>
        <div>Has User: {user ? '✅' : '❌'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
        {user && (
          <div className="mt-2 p-2 bg-gray-700 rounded">
            <div>User: {user.username}</div>
            <div>ID: {user.discordId}</div>
          </div>
        )}
        
        <div className="mt-3 space-y-1">
          <button
            onClick={handleForceRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
          >
            🚀 Force Redirect
          </button>
        </div>
      </div>
    </div>
  );
}; 