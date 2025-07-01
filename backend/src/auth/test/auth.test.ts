// Tests pour l'authentification Discord OAuth2

import { JwtDecoder } from '../utils/jwt-decoder';

// Test de décodage JWT
function testJwtDecoding() {
  console.log('=== Test de décodage JWT ===');
  
  // Token d'exemple (à remplacer par un vrai token)
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  const decoded = JwtDecoder.decode(sampleToken);
  console.log('Token décodé:', decoded);
  
  const isExpired = JwtDecoder.isExpired(sampleToken);
  console.log('Token expiré:', isExpired);
  
  const userInfo = JwtDecoder.getUserInfo(sampleToken);
  console.log('Informations utilisateur:', userInfo);
}

// Test des routes d'authentification
async function testAuthRoutes() {
  console.log('=== Test des routes d\'authentification ===');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test de l'URL d'authentification
    const authUrlResponse = await fetch(`${baseUrl}/auth/discord`);
    const authUrlData = await authUrlResponse.json();
    console.log('URL d\'authentification:', authUrlData.authUrl);
    
    // Test de vérification de token (avec un token invalide)
    const verifyResponse = await fetch(`${baseUrl}/auth/verify?token=invalid-token`);
    const verifyData = await verifyResponse.json();
    console.log('Vérification token invalide:', verifyData);
    
  } catch (error) {
    console.error('Erreur lors des tests:', error);
  }
}

// Test de protection des routes
async function testProtectedRoutes() {
  console.log('=== Test des routes protégées ===');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test sans token
    const profileResponse = await fetch(`${baseUrl}/user/profile`);
    console.log('Profil sans token:', profileResponse.status);
    
    // Test avec token invalide
    const profileWithTokenResponse = await fetch(`${baseUrl}/user/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });
    console.log('Profil avec token invalide:', profileWithTokenResponse.status);
    
  } catch (error) {
    console.error('Erreur lors des tests des routes protégées:', error);
  }
}

// Fonction principale de test
export async function runAuthTests() {
  console.log('Démarrage des tests d\'authentification...\n');
  
  testJwtDecoding();
  console.log('\n');
  
  await testAuthRoutes();
  console.log('\n');
  
  await testProtectedRoutes();
  console.log('\n');
  
  console.log('Tests terminés!');
}

// Exécuter les tests si le fichier est exécuté directement
if (require.main === module) {
  runAuthTests();
} 