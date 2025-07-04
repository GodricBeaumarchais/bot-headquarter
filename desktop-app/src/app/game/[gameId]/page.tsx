'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { gameService, FullGame } from '../../../services/gameService';

export default function GamePage() {
  const params = useParams();
  const { token, user } = useAuth();
  const [game, setGame] = useState<FullGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<'ROCK' | 'PAPER' | 'SCISSORS' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const gameId = params.gameId as string;

  useEffect(() => {
    if (token && gameId) {
      fetchGame();
    }
  }, [token, gameId]);

  const fetchGame = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const gameData = await gameService.getGame(gameId, token);
      setGame(gameData);
    } catch (error) {
      console.error('Erreur lors de la récupération du jeu:', error);
      setError('Erreur lors du chargement du jeu');
    } finally {
      setLoading(false);
    }
  };

  const makeChoice = async () => {
    if (!token || !selectedChoice) return;

    setSubmitting(true);
    try {
      await gameService.makeChoice(gameId, selectedChoice, token);
      // Rafraîchir le jeu
      await fetchGame();
      setSelectedChoice(null);
    } catch (error) {
      console.error('Erreur lors du choix:', error);
      setError('Erreur lors du choix');
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentRound = () => {
    if (!game) return null;
    return game.rounds.find(round => 
      !round.challengerChoice || !round.opponentChoice
    );
  };

  const getScore = () => {
    if (!game) return { challenger: 0, opponent: 0 };
    
    let challengerWins = 0;
    let opponentWins = 0;

    game.rounds.forEach(round => {
      if (round.winnerId === game.challenger.discordId) {
        challengerWins++;
      } else if (round.winnerId === game.opponent.discordId) {
        opponentWins++;
      }
    });

    return { challenger: challengerWins, opponent: opponentWins };
  };

  const isMyTurn = () => {
    if (!game || !user) return false;
    
    const currentRound = getCurrentRound();
    if (!currentRound) return false;

    const isChallenger = game.challenger.discordId === user.discordId;
    
    if (isChallenger) {
      return !currentRound.challengerChoice;
    } else {
      return !currentRound.opponentChoice;
    }
  };

  const getChoiceEmoji = (choice: string) => {
    switch (choice) {
      case 'ROCK': return '🪨';
      case 'PAPER': return '📄';
      case 'SCISSORS': return '✂️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du jeu...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600">{error || 'Jeu non trouvé'}</p>
        </div>
      </div>
    );
  }

  const score = getScore();
  const currentRound = getCurrentRound();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête du jeu */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">🎮 Chifumi</h1>
            <div className="text-sm text-gray-500">
              ID: {game.gameId}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="font-semibold text-lg">{game.challenger.username}</h3>
              <p className="text-2xl font-bold text-blue-600">{score.challenger}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-4xl">VS</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{game.opponent.username}</h3>
              <p className="text-2xl font-bold text-red-600">{score.opponent}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Mise: <span className="font-semibold">{game.betAmount} tokens</span>
            </p>
            <p className="text-gray-600">
              Statut: <span className={`font-semibold ${
                game.status === 'ACTIVE' ? 'text-green-600' :
                game.status === 'FINISHED' ? 'text-blue-600' :
                game.status === 'CANCELLED' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {game.status === 'ACTIVE' ? 'En cours' :
                 game.status === 'FINISHED' ? 'Terminé' :
                 game.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
              </span>
            </p>
          </div>
        </div>

        {/* Zone de jeu */}
        {game.status === 'ACTIVE' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              Manche {currentRound?.roundNumber || 1}
            </h2>

            {isMyTurn() ? (
              <div className="text-center">
                <p className="text-lg mb-4">C'est votre tour ! Choisissez votre action :</p>
                
                <div className="flex justify-center space-x-4 mb-6">
                  {(['ROCK', 'PAPER', 'SCISSORS'] as const).map((choice) => (
                    <button
                      key={choice}
                      onClick={() => setSelectedChoice(choice)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedChoice === choice
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-4xl mb-2">{getChoiceEmoji(choice)}</div>
                      <div className="font-semibold">
                        {choice === 'ROCK' ? 'Pierre' :
                         choice === 'PAPER' ? 'Papier' : 'Ciseaux'}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedChoice && (
                  <button
                    onClick={makeChoice}
                    disabled={submitting}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {submitting ? 'Envoi...' : 'Confirmer le choix'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-600">
                  En attente du choix de l'autre joueur...
                </p>
                <div className="mt-4">
                  <div className="animate-pulse">
                    <div className="text-4xl">⏳</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Historique des manches */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Historique des manches</h2>
          
          <div className="space-y-4">
            {game.rounds.map((round) => (
              <div key={round.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Manche {round.roundNumber}</h3>
                  {round.winnerId && (
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      round.winnerId === game.challenger.discordId
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {round.winnerId === game.challenger.discordId
                        ? `${game.challenger.username} gagne`
                        : `${game.opponent.username} gagne`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="font-medium">{game.challenger.username}</p>
                    <div className="text-2xl">
                      {round.challengerChoice ? getChoiceEmoji(round.challengerChoice) : '❓'}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{game.opponent.username}</p>
                    <div className="text-2xl">
                      {round.opponentChoice ? getChoiceEmoji(round.opponentChoice) : '❓'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résultat final */}
        {game.status === 'FINISHED' && game.winner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6 text-center">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">🏆 Partie terminée !</h2>
            <p className="text-lg text-yellow-700">
              {game.winner.username} remporte la partie et gagne {game.betAmount * 2} tokens !
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 