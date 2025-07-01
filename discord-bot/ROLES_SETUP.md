# 🔧 Configuration des Rôles Admin

## 📋 Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` :

```env
# IDs des rôles Discord
DEFAULT_ROLE_ID=1234567890123456789
ADMIN_ROLE_ID=9876543210987654321
```

## 🎯 Comment obtenir les IDs des rôles

1. **Activez le mode développeur** dans Discord :
   - Paramètres Discord → Avancés → Mode développeur

2. **Récupérez l'ID du rôle par défaut** :
   - Clic droit sur le rôle "Membre" ou rôle de base
   - "Copier l'identifiant"

3. **Récupérez l'ID du rôle admin** :
   - Clic droit sur le rôle "Admin" ou "Modérateur"
   - "Copier l'identifiant"

## 👑 Attribution des rôles admin

### Méthode 1 : Via la base de données (recommandée)

1. **Connectez-vous à votre base de données PostgreSQL**
2. **Exécutez cette requête** pour promouvoir un utilisateur admin :

```sql
UPDATE "User" 
SET "roleId" = 2 
WHERE "discordId" = 'VOTRE_ID_DISCORD_ICI';
```

### Méthode 2 : Via Prisma Studio

1. **Lancez Prisma Studio** :
   ```bash
   npx prisma studio
   ```

2. **Allez dans la table `User`**
3. **Trouvez votre utilisateur**
4. **Changez `roleId` de `1` à `2`**

## 🛠️ Commandes Admin disponibles

Une fois promu admin, vous aurez accès à ces commandes :

- `/generate` - Générer des tokens pour un utilisateur
- `/remove` - Retirer des tokens d'un utilisateur  
- `/exchange` - Échanger des tokens entre deux utilisateurs

## 🔒 Sécurité

- ✅ Seuls les utilisateurs avec `roleId = 2` peuvent utiliser les commandes admin
- ✅ Toutes les commandes admin sont `ephemeral` (visibles uniquement par l'admin)
- ✅ Les utilisateurs sont notifiés par DM des modifications de leur compte
- ✅ Vérifications de solde avant retrait/échange

## 📊 Structure des rôles

| ID | Nom | Description |
|----|-----|-------------|
| 1 | default | Rôle par défaut pour tous les utilisateurs |
| 2 | admin | Rôle administrateur avec accès aux commandes admin |

## 🚀 Migration de base de données

Exécutez cette commande pour créer les nouvelles tables :

```bash
npx prisma migrate dev --name add-roles-system
``` 