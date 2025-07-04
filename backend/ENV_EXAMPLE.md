# Exemple de fichier .env

Créez un fichier `.env` dans le dossier `backend` avec le contenu suivant :

```env
# ========================================
# CONFIGURATION DE LA BASE DE DONNÉES
# ========================================
DATABASE_URL="postgresql://username:password@localhost:5432/bot_headquarter"

# ========================================
# CONFIGURATION DISCORD OAUTH2
# ========================================
# Obtenez ces valeurs sur https://discord.com/developers/applications
DISCORD_CLIENT_ID="1234567890123456789"
DISCORD_CLIENT_SECRET="votre_client_secret_discord_ici"
DISCORD_REDIRECT_URI="http://localhost:3001/auth/discord/callback"

# ========================================
# CONFIGURATION JWT
# ========================================
# Générez une clé secrète forte pour la production
JWT_SECRET="votre-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# ========================================
# CONFIGURATION FRONTEND
# ========================================
FRONTEND_URL="http://localhost:3000"

# ========================================
# CONFIGURATION SERVEUR (optionnel)
# ========================================
PORT=3001
NODE_ENV=development

# ========================================
# CONFIGURATION DISCORD BOT
# ========================================
DISCORD_TOKEN="your_discord_bot_token"

# ========================================
# CONFIGURATION RÔLES DISCORD
# ========================================
DEFAULT_ROLE_ID="1234567890123456789"
ADMIN_ROLE_ID="9876543210987654321"

# ========================================
# CONFIGURATION CANAUX DISCORD
# ========================================
OOTD_CHANNEL_ID="1234567890123456789"
BOT_MAIN_CHANNEL="1234567890123456789"
```

## Instructions de configuration

1. **Base de données** : Remplacez `username`, `password` et `database_name` par vos informations PostgreSQL
2. **Discord** : 
   - Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Créez une nouvelle application
   - Dans l'onglet "OAuth2", copiez le Client ID et Client Secret
   - Ajoutez l'URL de redirection : `http://localhost:3001/auth/discord/callback`
3. **JWT** : Générez une clé secrète forte (utilisez un générateur de clés)
4. **Frontend** : Ajustez l'URL selon votre configuration frontend 