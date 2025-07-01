'use client';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  Bot Headquarters
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {user?.avatar && (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-white font-medium">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Bienvenue, {user?.username} ! 🎉
              </h2>
              <p className="text-gray-400 text-lg">
                Vous êtes maintenant connecté avec votre compte Discord
              </p>
            </div>

            {/* User Info Card */}
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Informations de votre compte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Nom d'utilisateur</label>
                    <p className="text-white font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Discord ID</label>
                    <p className="text-white font-mono text-sm">{user?.discordId}</p>
                  </div>
                  {user?.discriminator && (
                    <div>
                      <label className="text-gray-400 text-sm">Discriminateur</label>
                      <p className="text-white font-medium">#{user.discriminator}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Rôle</label>
                    <p className="text-white font-medium">{user?.role?.name}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Rôle Discord ID</label>
                    <p className="text-white font-mono text-sm">{user?.role?.discordId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  Statut : Connecté et authentifié
                </span>
              </div>
              <p className="text-gray-400 mt-2">
                Votre session est active et sécurisée. Vous avez accès à toutes les fonctionnalités.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
