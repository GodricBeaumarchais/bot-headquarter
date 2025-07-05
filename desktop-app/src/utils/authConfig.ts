// Configuration pour l'authentification
export const AUTH_CONFIG = {
  // Désactiver la vérification backend pour le développement
  SKIP_BACKEND_VERIFICATION: process.env.NODE_ENV === 'development',
  
  // URL du backend
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // Timeout pour les requêtes
  REQUEST_TIMEOUT: 5000,
  
  // Clé du localStorage
  TOKEN_KEY: 'auth_token',
  SKIP_VERIFICATION_KEY: 'skip_backend_verification'
};

// Fonction pour initialiser la configuration
export const initAuthConfig = () => {
  if (AUTH_CONFIG.SKIP_BACKEND_VERIFICATION) {
    localStorage.setItem(AUTH_CONFIG.SKIP_VERIFICATION_KEY, 'true');
    console.log('🔧 Vérification backend désactivée pour le développement');
  }
};

// Fonction pour activer/désactiver la vérification backend
export const toggleBackendVerification = (enabled: boolean) => {
  localStorage.setItem(AUTH_CONFIG.SKIP_VERIFICATION_KEY, (!enabled).toString());
  console.log(`🔧 Vérification backend ${enabled ? 'activée' : 'désactivée'}`);
}; 