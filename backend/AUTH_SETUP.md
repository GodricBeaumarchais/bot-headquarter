# Configuration de l'authentification Discord OAuth2

## Variables d'environnement requises

Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Discord OAuth2
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"
DISCORD_REDIRECT_URI="http://localhost:3001/auth/discord/callback"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## Configuration Discord OAuth2

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans l'onglet "OAuth2", ajoutez l'URL de redirection : `http://localhost:3001/auth/discord/callback`
4. Copiez le Client ID et Client Secret dans votre fichier `.env`

## Installation des dépendances

```bash
npm install @nestjs/jwt @nestjs/passport @nestjs/config passport passport-jwt passport-discord discord.js axios
```

## Routes disponibles

### Authentification
- `GET /auth/discord` - Obtenir l'URL d'authentification Discord
- `GET /auth/discord/callback` - Callback OAuth2 Discord
- `GET /auth/verify?token=<jwt_token>` - Vérifier un token JWT

### Utilisateur (protégées)
- `GET /user/profile` - Obtenir le profil utilisateur
- `GET /user/me` - Obtenir les informations de l'utilisateur connecté

## Utilisation

1. L'utilisateur accède à `/auth/discord` pour obtenir l'URL d'authentification
2. Il est redirigé vers Discord pour l'authentification
3. Après authentification, Discord le redirige vers `/auth/discord/callback`
4. Le backend génère un JWT et redirige vers le frontend
5. Le frontend peut utiliser le JWT pour les requêtes authentifiées

## Protection des routes

Utilisez le guard `JwtAuthGuard` pour protéger vos routes :

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected-route')
getProtectedData(@CurrentUser() user: any) {
  return { message: 'Route protégée', user };
}
```

## Décodage du JWT

Le JWT contient les informations suivantes :
- `sub` : Discord ID de l'utilisateur
- `username` : Nom d'utilisateur Discord
- `avatar` : Hash de l'avatar Discord
- `discriminator` : Discriminateur Discord
- `roleId` : ID du rôle dans votre base de données 