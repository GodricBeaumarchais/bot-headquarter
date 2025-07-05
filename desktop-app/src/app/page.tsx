'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

const apps: App[] = [
  {
    id: 'banque',
    name: 'Banque',
    description: 'Gestion des finances et transactions',
    icon: '🏦',
    color: 'bg-green-600',
    href: '/apps/banque'
  }
];

export default function HomePage() {
  const { user, logout, token } = useAuth();
  const [profileData, setProfileData] = useState<{discordId?: string} | null>(null);

  // Récupérer les données du profil pour avoir le discordId complet
  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        console.log('🔍 Données profil pour header:', data);
        setProfileData(data);
      })
      .catch(err => console.error('Erreur récupération profil:', err));
    }
  }, [token]);

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
                      src={`https://cdn.discordapp.com/avatars/${profileData?.discordId || user.discordId}/${user.avatar}.png`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                      onLoad={() => console.log('✅ Image chargée avec succès')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('❌ Erreur de chargement image:', target.src);
                        console.log('🔍 Discord ID:', profileData?.discordId || user.discordId);
                        console.log('🔍 Avatar:', user.avatar);
                      }}
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Bienvenue, {user?.username} ! 🎉
            </h2>
            <p className="text-gray-400 text-lg">
              Sélectionnez une application pour commencer
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="group cursor-pointer"
                onClick={() => window.location.href = app.href}
              >
                <div className={`
                  w-[200px] h-[200px] ${app.color} rounded-xl shadow-lg 
                  flex flex-col items-center justify-center 
                  transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl
                  hover:shadow-2xl
                `}>
                  <div className="text-6xl mb-4">
                    {app.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg text-center">
                    {app.name}
                  </h3>
                  <p className="text-white/80 text-sm text-center mt-2 px-4">
                    {app.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {apps.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune application disponible
              </h3>
              <p className="text-gray-400">
                Les applications seront ajoutées prochainement
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
