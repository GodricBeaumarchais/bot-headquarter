# 🤖 Headquarter Bot

Un bot Discord pour gérer une économie virtuelle avec des **Atmas** (monnaie du serveur), un système de récompenses quotidiennes, des streaks, et un système OOTD (Outfit of the Day).

## 🚀 Fonctionnalités

- 💰 **Système de monnaie virtuelle** (Atmas)
- 📅 **Récompenses quotidiennes** avec système de streak
- 👗 **Système OOTD** avec réactions automatiques
- 👑 **Système de rôles** (Admin/Default)
- 🏆 **Classement des joueurs**
- 🔄 **Transferts entre joueurs**
- 🛠️ **Commandes admin** pour la gestion

## 📋 Configuration

### Variables d'environnement requises

Créez un fichier `.env` à la racine du projet :

```env
# Token du bot Discord
DISCORD_TOKEN=votre_token_discord_ici

# URL de la base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:port/database

# Configuration OOTD
OOTD_CHANNEL_ID=1234567890123456789

# Configuration des rôles Discord
DEFAULT_ROLE_ID=1234567890123456789
ADMIN_ROLE_ID=9876543210987654321
```

### Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Démarrer le bot
npm run dev
```

## 🎮 Commandes Utilisateur

### 💰 Commandes de base

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/signin` | Créer votre compte (0 Atmas de départ) | `/signin` |
| `/balance [@utilisateur]` | Voir votre solde d'Atmas | `/balance @utilisateur` |
| `/daily` | Récupérer votre récompense quotidienne | `/daily` |
| `/transfer @utilisateur montant` | Transférer des Atmas | `/transfer @utilisateur 50` |
| `/leaderboard [limite]` | Voir le classement des joueurs | `/leaderboard 10` |
| `/streak [@utilisateur]` | Voir votre streak quotidien | `/streak @utilisateur` |
| `/ootd [@utilisateur]` | Voir vos statistiques OOTD | `/ootd @utilisateur` |

### 📝 Commandes avec préfixe

Le bot supporte aussi les commandes avec le préfixe `!hq` :

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!hq signin` | Créer votre compte | `!hq signin` |
| `!hq balance [@utilisateur]` | Voir votre solde | `!hq balance @utilisateur` |
| `!hq daily` | Récupérer la récompense quotidienne | `!hq daily` |
| `!hq transfer @utilisateur montant` | Transférer des Atmas | `!hq transfer @utilisateur 50` |
| `!hq leaderboard [limite]` | Voir le classement | `!hq leaderboard 5` |
| `!hq streak [@utilisateur]` | Voir votre streak | `!hq streak @utilisateur` |
| `!hq help` | Voir toutes les commandes | `!hq help` |

## 👑 Commandes Admin

> ⚠️ **Réservées aux administrateurs uniquement**

| Commande | Description | Exemple |
|----------|-------------|---------|
| `/generate @utilisateur montant` | Générer des Atmas pour un utilisateur | `/generate @utilisateur 100` |
| `/remove @utilisateur montant` | Retirer des Atmas d'un utilisateur | `/remove @utilisateur 50` |
| `/exchange @depuis @vers montant` | Échanger des Atmas entre deux utilisateurs | `/exchange @user1 @user2 25` |

### 🔒 Sécurité des commandes admin

- ✅ Vérification du rôle admin avant exécution
- ✅ Commandes `ephemeral` (visibles uniquement par l'admin)
- ✅ Notifications DM aux utilisateurs concernés
- ✅ Vérifications de solde avant retrait/échange
- ✅ Transactions atomiques pour les échanges

## 👗 Système OOTD (Outfit of the Day)

### Comment ça marche

1. **Postez une photo** dans le salon OOTD configuré
2. **Ajoutez `!hq ootd`** dans votre message
3. **Le bot réagit automatiquement** avec 👗
4. **Les autres membres réagissent** à votre tenue
5. **Vous gagnez 1 Atma par réaction** reçue

### Contrôles anti-triche

- ❌ **Un joueur ne peut réagir qu'une seule fois** par message OOTD
- ❌ **L'auteur ne peut pas réagir** à son propre message
- ✅ **Système de base de données** pour tracker toutes les réactions

### Statistiques OOTD

Utilisez `/ootd [@utilisateur]` pour voir :
- 📸 Nombre de messages OOTD créés
- 👍 Nombre de réactions données
- 💰 Total d'Atmas gagnés via OOTD

## 📅 Système de Récompenses Quotidiennes

### Récompense de base
- **5 Atmas** par jour
- **Streak** : jours consécutifs de connexion

### Bonus de streak
- **Tous les 5 jours** : bonus de streak
- **Calcul** : streak ÷ 5 = Atmas bonus
- **Exemple** : streak de 15 jours = 3 Atmas bonus

### Gestion du streak
- ✅ **Hier** : streak continue (+1)
- ❌ **Plus d'un jour** : streak remis à 1
- ❌ **Aujourd'hui** : déjà récupéré

## 🏆 Classement

Le classement affiche les joueurs les plus riches :
- 🥇 **1er** : Or
- 🥈 **2ème** : Argent  
- 🥉 **3ème** : Bronze
- 📊 **Limite personnalisable** (défaut : 10)

## 🔧 Configuration Avancée

### Promouvoir un administrateur

#### Méthode 1 : Via la base de données
```sql
UPDATE "User" 
SET "roleId" = (SELECT id FROM "Role" WHERE name = 'admin') 
WHERE "discordId" = 'VOTRE_ID_DISCORD';
```

#### Méthode 2 : Via Prisma Studio
```bash
npx prisma studio
```
Puis changez `roleId` de l'utilisateur vers l'ID du rôle admin.

### Obtenir les IDs des rôles Discord

1. **Activez le mode développeur** dans Discord
2. **Clic droit** sur le rôle → "Copier l'identifiant"
3. **Ajoutez l'ID** dans votre fichier `.env`

## 🚨 Dépannage

### Erreurs courantes

| Erreur | Solution |
|--------|----------|
| "Utilisateur non trouvé" | Utilisez `/signin` pour créer un compte |
| "Solde insuffisant" | Vérifiez votre solde avec `/balance` |
| "Déjà récupéré aujourd'hui" | Attendez demain pour le daily |
| "Permissions insuffisantes" | Contactez un administrateur |

### Logs du bot

Le bot affiche des logs détaillés :
- ✅ **Connexion réussie**
- 👗 **Réactions OOTD**
- 💰 **Transferts et transactions**
- 👑 **Actions admin**
- ❌ **Erreurs et exceptions**

## 📊 Structure de la base de données

### Tables principales

- **User** : Utilisateurs et leurs données
- **Role** : Rôles (default/admin)
- **OOTDReaction** : Réactions OOTD

### Relations

- `User` → `Role` (un utilisateur a un rôle)
- `OOTDReaction` → `User` (réactions liées aux utilisateurs)

## 🤝 Contribution

Pour contribuer au projet :

1. **Fork** le repository
2. **Créez une branche** pour votre fonctionnalité
3. **Commitez** vos changements
4. **Poussez** vers la branche
5. **Ouvrez une Pull Request**

## 📄 Licence

Ce projet est sous licence ISC.

---

**Développé avec ❤️ pour la communauté Discord** 