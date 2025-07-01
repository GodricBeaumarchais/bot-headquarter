import { LeaderboardResponse, UserProfile } from '../types/user';

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

console.log('🔧 Configuration API:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

export const api = {
  // Récupérer le leaderboard
  async getLeaderboard(token?: string): Promise<LeaderboardResponse> {
    const url = `${API_BASE_URL}/users/leaderboard`;
    console.log('🌐 Tentative de connexion au leaderboard:', url);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Ajouter le token d'authentification si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token d\'authentification ajouté');
    } else {
      console.log('⚠️ Aucun token d\'authentification disponible');
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        mode: 'cors',
        credentials: 'include',
      });

      console.log('📡 Réponse du leaderboard:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP leaderboard:', errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Données leaderboard reçues:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du leaderboard:', error);
      
      // Gestion spécifique des erreurs CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🚫 Erreur CORS détectée');
        throw new Error(`Erreur CORS: Impossible de se connecter au serveur ${url}. Vérifiez que le backend est démarré et que CORS est configuré.`);
      }
      
      throw error;
    }
  },

  // Récupérer le profil utilisateur
  async getUserProfile(token: string): Promise<UserProfile> {
    const url = `${API_BASE_URL}/users/profile`;
    console.log('🌐 Tentative de connexion au profil:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'include',
      });

      console.log('📡 Réponse du profil:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP profil:', errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Données profil reçues:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      
      // Gestion spécifique des erreurs CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🚫 Erreur CORS détectée');
        throw new Error(`Erreur CORS: Impossible de se connecter au serveur ${url}. Vérifiez que le backend est démarré et que CORS est configuré.`);
      }
      
      throw error;
    }
  },
}; 