import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GameNotification } from './GameNotification';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Bot Headquarters
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <GameNotification />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 