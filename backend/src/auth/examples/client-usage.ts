// Exemple d'utilisation côté client (JavaScript/TypeScript)

class DiscordAuthClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  /**
   * Redirige vers l'authentification Discord
   */
  async initiateAuth(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/discord`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Erreur lors de l\'initiation de l\'auth:', error);
    }
  }

  /**
   * Vérifie un token JWT
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify?token=${token}`);
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  }

  /**
   * Récupère le profil utilisateur
   */
  async getProfile(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Décode un JWT côté client
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Vérifie si un token est expiré
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    return Date.now() >= payload.exp * 1000;
  }
}

// Exemple d'utilisation
const authClient = new DiscordAuthClient();

// Gestion du callback d'authentification
function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Stocker le token
    localStorage.setItem('auth_token', token);
    
    // Vérifier le token
    authClient.verifyToken(token).then(isValid => {
      if (isValid) {
        console.log('Authentification réussie!');
        // Rediriger vers la page principale
        window.location.href = '/dashboard';
      } else {
        console.error('Token invalide');
        window.location.href = '/login';
      }
    });
  }
}

// Exemple de requête authentifiée
async function makeAuthenticatedRequest() {
  const token = localStorage.getItem('auth_token');
  
  if (!token || authClient.isTokenExpired(token)) {
    // Token expiré ou manquant, rediriger vers l'auth
    authClient.initiateAuth();
    return;
  }
  
  try {
    const profile = await authClient.getProfile(token);
    console.log('Profil utilisateur:', profile);
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
  }
}

// Exemple de décodage du token pour obtenir les infos utilisateur
function getUserInfo() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    const userInfo = authClient.decodeToken(token);
    console.log('Informations utilisateur:', userInfo);
    return userInfo;
  }
  return null;
} 