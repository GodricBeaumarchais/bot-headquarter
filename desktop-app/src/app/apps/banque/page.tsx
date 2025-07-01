'use client';

import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Leaderboard } from '../../../components/Leaderboard';

export default function BanquePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🏦</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    Banque
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-white font-medium">
                  {user?.username}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Leaderboard */}
          

          {/* Application Content */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                🏦 Application Banque
              </h2>
              <p className="text-gray-400 text-lg">
                Gestion des finances et transactions
              </p>
            </div>

            {/* Placeholder Content */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
              <Leaderboard />
              </h3>
              <p className="text-gray-400">
                Le contenu de l&apos;application Banque sera ajouté prochainement.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 