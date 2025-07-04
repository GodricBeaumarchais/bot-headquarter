'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gameService, Game } from '../services/gameService';

export const GameNotification: React.FC = () => {
  const { token } = useAuth();
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPendingGames();
    }
  }, [token]);

  const fetchPendingGames = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const games = await gameService.getPendingGames(token);
      setPendingGames(games);
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptGame = async (gameId: string) => {
    if (!token) return;

    try {
      await gameService.acceptGame(gameId, token);
      // Rediriger vers la page de jeu
      window.location.href = `/game/${gameId}`;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du jeu:', error);
      alert('Erreur lors de l\'acceptation du jeu');
    }
  };

  const handleDeclineGame = async (gameId: string) => {
    if (!token) return;

    try {
      await gameService.declineGame(gameId, token);
      // Rafraîchir la liste
      fetchPendingGames();
    } catch (error) {
      console.error('Erreur lors du refus du jeu:', error);
      alert('Erreur lors du refus du jeu');
    }
  };

  if (pendingGames.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
        title="Défis en attente"
      >
        🎮
        <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {pendingGames.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">🎮 Défis en attente</h3>
            
            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : (
              <div className="space-y-3">
                {pendingGames.map((game) => (
                  <div key={game.id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {game.challenger.username} vs {game.opponent.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          Mise: {game.betAmount} tokens
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(game.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptGame(game.gameId)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-2 rounded"
                      >
                        ✅ Accepter
                      </button>
                      <button
                        onClick={() => handleDeclineGame(game.gameId)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded"
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 