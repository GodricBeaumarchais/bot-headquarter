# Documentation des Endpoints API

## Base URL
```
http://localhost:3001
```

## 🔐 Endpoints d'Authentification

### 1. Obtenir l'URL d'authentification Discord
```http
GET /auth/discord
```

**Description** : Retourne l'URL d'authentification Discord OAuth2

**Réponse** :
```json
{
  "authUrl": "https://discord.com/api/oauth2/authorize?client_id=...&redirect_uri=...&response_type=code&scope=identify%20email"
}
```

**Utilisation** : Redirigez l'utilisateur vers cette URL pour l'authentification Discord

---

### 2. Callback d'authentification Discord
```http
GET /auth/discord/callback?code={code}
```

**Description** : Traite le callback OAuth2 de Discord et génère un JWT

**Paramètres** :
- `code` (string, requis) : Code d'autorisation fourni par Discord

**Processus** :
1. Échange le code contre un token d'accès Discord
2. Récupère les informations utilisateur Discord
3. Met à jour les informations de profil dans la base de données
4. Génère un JWT avec les informations utilisateur
5. Redirige vers le frontend avec le token

**Redirection** :
- Succès : `{FRONTEND_URL}/auth/callback?token={jwt_token}`
- Erreur : `{FRONTEND_URL}/auth/error?message={error_message}`

---

### 3. Vérifier un token JWT
```http
GET /auth/verify?token={jwt_token}
```

**Description** : Vérifie la validité d'un token JWT

**Paramètres** :
- `token` (string, requis) : Le JWT à vérifier

**Réponse - Token valide** :
```json
{
  "valid": true,
  "user": {
    "sub": "123456789012345678",
    "username": "utilisateur",
    "avatar": "hash_avatar",
    "discriminator": "1234",
    "roleId": "uuid_role",
    "iat": 1640995200,
    "exp": 1641600000
  }
}
```

**Réponse - Token invalide** :
```json
{
  "valid": false,
  "error": "jwt expired"
}
```

---

## 👤 Endpoints Utilisateur (Protégés)

*Tous ces endpoints nécessitent un header d'autorisation :*
```http
Authorization: Bearer {jwt_token}
```

### 4. Obtenir le profil utilisateur
```http
GET /user/profile
```

**Description** : Récupère le profil complet de l'utilisateur authentifié

**Headers requis** :
```http
Authorization: Bearer {jwt_token}
```

**Réponse** :
```json
{
  "message": "Profil utilisateur récupéré avec succès",
  "user": {
    "discordId": "123456789012345678",
    "username": "utilisateur",
    "avatar": "hash_avatar",
    "discriminator": "1234",
    "role": {
      "id": "uuid_role",
      "name": "Membre",
      "discordId": "987654321098765432"
    }
  }
}
```

**Codes d'erreur** :
- `401 Unauthorized` : Token manquant ou invalide
- `404 Not Found` : Utilisateur non trouvé

---

### 5. Obtenir les informations utilisateur
```http
GET /user/me
```

**Description** : Récupère les informations de base de l'utilisateur authentifié

**Headers requis** :
```http
Authorization: Bearer {jwt_token}
```

**Réponse** :
```json
{
  "discordId": "123456789012345678",
  "username": "utilisateur",
  "avatar": "hash_avatar",
  "discriminator": "1234",
  "roleId": "uuid_role",
  "role": {
    "id": "uuid_role",
    "name": "Membre",
    "discordId": "987654321098765432"
  }
}
```

---

## 📋 Codes de Statut HTTP

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Requête invalide |
| `401` | Non autorisé (token manquant/invalide) |
| `403` | Accès interdit |
| `404` | Ressource non trouvée |
| `500` | Erreur serveur interne |

---

## 🔒 Sécurité

### Authentification
- Tous les endpoints utilisateur nécessitent un JWT valide
- Le JWT doit être envoyé dans le header `Authorization: Bearer {token}`
- Les tokens expirent après 7 jours par défaut (configurable via `JWT_EXPIRES_IN`)

### Validation
- Les tokens JWT sont vérifiés côté serveur
- Les informations utilisateur sont récupérées depuis la base de données à chaque requête
- Les utilisateurs non existants dans la base de données ne peuvent pas s'authentifier

---

## 📝 Exemples d'Utilisation

### Authentification complète
```javascript
// 1. Obtenir l'URL d'auth
const authResponse = await fetch('http://localhost:3001/auth/discord');
const { authUrl } = await authResponse.json();

// 2. Rediriger vers Discord
window.location.href = authUrl;

// 3. Après callback, récupérer le token depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// 4. Utiliser le token pour les requêtes
const profileResponse = await fetch('http://localhost:3001/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const profile = await profileResponse.json();
```

### Vérification de token
```javascript
const verifyResponse = await fetch(`http://localhost:3001/auth/verify?token=${token}`);
const { valid, user } = await verifyResponse.json();

if (valid) {
  console.log('Utilisateur connecté:', user);
} else {
  console.log('Token invalide, redirection vers login');
}
``` 