'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry, UserProfile } from '../types/user';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Données fictives pour le développement
const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'godricbeaumarchais',
    token: 15000,
    rank: 1,
    discordId: '149234955703025664',
    avatar: undefined
  },
  {
    id: '2',
    username: 'Alice',
    token: 12000,
    rank: 2,
    discordId: '123456789',
    avatar: undefined
  },
  {
    id: '3',
    username: 'Bob',
    token: 10000,
    rank: 3,
    discordId: '987654321',
    avatar: undefined
  },
  {
    id: '4',
    username: 'Charlie',
    token: 8000,
    rank: 4,
    discordId: '456789123',
    avatar: undefined
  },
  {
    id: '5',
    username: 'Diana',
    token: 6000,
    rank: 5,
    discordId: '789123456',
    avatar: undefined
  }
];

const mockUserProfile: UserProfile = {
  id: '1',
  username: 'godricbeaumarchais',
  discordId: '149234955703025664',
  token: 15000,
  avatar: undefined,
  discriminator: undefined,
  roleId: '1',
  role: {
    id: '1',
    name: 'Admin',
    discordId: '123456789'
  }
};

export const Leaderboard: React.FC = () => {
  const { token } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Essayer de récupérer les vraies données
        try {
          console.log('🔑 Token disponible pour leaderboard:', !!token);
          const leaderboardData = await api.getLeaderboard(token || undefined);
          console.log('📊 Données leaderboard complètes:', JSON.stringify(leaderboardData, null, 2));
          
          // Transformer les données pour correspondre à notre structure
          const transformedUsers: LeaderboardEntry[] = leaderboardData.users.map((user: { username: string; token: number; id?: string; discordId?: string; avatar?: string }, index: number) => ({
            id: user.id || `user-${index}`,
            username: user.username,
            token: user.token || 0,
            rank: index + 1,
            discordId: user.discordId || '',
            avatar: user.avatar
          }));
          
          setLeaderboard(transformedUsers);

          if (token) {
            try {
              const userProfile = await api.getUserProfile(token);
              console.log('👤 Données profil complètes:', JSON.stringify(userProfile, null, 2));
              console.log('💰 Token du profil:', userProfile.token, 'Type:', typeof userProfile.token);
              setCurrentUser(userProfile);
            } catch (profileError) {
              console.warn('Impossible de récupérer le profil utilisateur:', profileError);
            }
          }
          
          setUseMockData(false);
        } catch (apiError) {
          console.warn('Erreur API, utilisation des données fictives:', apiError);
          setLeaderboard(mockLeaderboard);
          setCurrentUser(mockUserProfile);
          setUseMockData(true);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du leaderboard:', err);
        setError('Impossible de charger le leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-8">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => {
            setLeaderboard(mockLeaderboard);
            setCurrentUser(mockUserProfile);
            setUseMockData(true);
            setError(null);
          }}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Utiliser les données de démonstration
        </button>
      </div>
    );
  }

  // Fonction sécurisée pour formater les tokens
  const formatTokens = (tokenValue: number | undefined | null): string => {
    console.log('🔢 Formatage des tokens:', tokenValue, 'Type:', typeof tokenValue);
    if (tokenValue === undefined || tokenValue === null) {
      return '0';
    }
    return tokenValue.toLocaleString();
  };

  // Debug: Afficher les informations de débogage
  console.log('🎯 État actuel:', {
    currentUser: currentUser ? {
      id: currentUser.id,
      username: currentUser.username,
      token: currentUser.token,
      tokenType: typeof currentUser.token
    } : null,
    useMockData,
    leaderboardLength: leaderboard.length
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
      {/* Header avec tokens du joueur */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">🏆 Classement</h2>
        {currentUser && (
          <div className="flex items-center space-x-2 bg-green-600/20 border border-green-500/20 rounded-lg px-4 py-2">
            <span className="text-green-400 font-semibold">💰</span>
            <span className="text-white font-bold">{formatTokens(currentUser.token)}</span>
            <span className="text-green-400 text-sm">Atmas</span>
          </div>
        )}
      </div>

      {/* Mode développement */}
      {useMockData && (
        <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-3 mb-4">
          <p className="text-yellow-400 text-sm">
            🧪 Mode développement : Données fictives affichées
          </p>
        </div>
      )}

      {/* Liste des joueurs */}
      <div className="space-y-3">
        {leaderboard.map((user) => (
          <div
            key={user.id}
            className={`
              flex items-center justify-between p-4 rounded-lg transition-all duration-200
              ${currentUser?.id === user.id 
                ? 'bg-green-600/20 border border-green-500/20' 
                : 'bg-gray-700 hover:bg-gray-600'
              }
            `}
          >
            <div className="flex items-center space-x-4">
              {/* Rang */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${user.rank <= 3 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-600 text-white'
                }
              `}>
                {user.rank}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-white text-lg">👤</span>
                )}
              </div>

              {/* Nom d'utilisateur */}
              <div>
                <h3 className="text-white font-semibold">{user.username}</h3>
                {currentUser?.id === user.id && (
                  <span className="text-green-400 text-xs">(Vous)</span>
                )}
              </div>
            </div>

            {/* Tokens */}
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">💰</span>
              <span className="text-white font-bold">{formatTokens(user.token)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Message si pas de données */}
      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-gray-400">Aucun joueur dans le classement</p>
        </div>
      )}
    </div>
  );
}; 