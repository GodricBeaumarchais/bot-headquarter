const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Game {
  id: string;
  gameId: string;
  challenger: {
    username: string;
    discordId: string;
  };
  opponent: {
    username: string;
    discordId: string;
  };
  betAmount: number;
  status: string;
  createdAt: string;
}

export interface GameRound {
  id: string;
  roundNumber: number;
  challengerChoice: string | null;
  opponentChoice: string | null;
  winnerId: string | null;
}

export interface FullGame extends Game {
  winner: {
    username: string;
    discordId: string;
  } | null;
  currentRound: number;
  totalRounds: number;
  rounds: GameRound[];
}

export const gameService = {
  // Récupérer les jeux en attente
  async getPendingGames(token: string): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/games/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des jeux en attente');
    }

    return response.json();
  },

  // Récupérer un jeu spécifique
  async getGame(gameId: string, token: string): Promise<FullGame> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Jeu non trouvé');
    }

    return response.json();
  },

  // Accepter un jeu
  async acceptGame(gameId: string, token: string): Promise<FullGame> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'acceptation du jeu');
    }

    return response.json();
  },

  // Refuser un jeu
  async declineGame(gameId: string, token: string): Promise<FullGame> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/decline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du refus du jeu');
    }

    return response.json();
  },

  // Faire un choix dans une manche
  async makeChoice(gameId: string, choice: 'ROCK' | 'PAPER' | 'SCISSORS', token: string): Promise<GameRound> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/choice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ choice })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du choix');
    }

    return response.json();
  }
}; 