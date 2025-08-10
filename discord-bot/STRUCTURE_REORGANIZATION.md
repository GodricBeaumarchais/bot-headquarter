# 🔄 Réorganisation de la Structure du Bot Discord

## 📋 Vue d'ensemble

Cette réorganisation sépare les commandes slash (/) et préfixe (!hq) tout en partageant les mêmes fonctions de comportement pour garantir une cohérence parfaite entre les deux types de commandes.

## 🏗️ Nouvelle Structure

### 📁 Dossiers principaux

```
src/
├── behaviors/           # Fonctions de comportement partagées
│   ├── money/          # Comportements économiques
│   ├── admin/          # Comportements administrateur
│   └── fun/            # Comportements ludiques
├── commands/
│   ├── slash/          # Commandes slash (/)
│   ├── prefix/         # Commandes préfixe (!hq)
│   ├── admin/          # Commandes admin existantes
│   ├── money/          # Commandes money existantes (à supprimer)
│   └── fun/            # Commandes fun existantes (à supprimer)
└── utils/              # Utilitaires
```

### 🔄 Fonctions de comportement partagées

#### 💰 Money Behaviors (`behaviors/money/`)

- **`signIn.ts`** - Création de compte utilisateur
- **`balance.ts`** - Consultation du solde
- **`daily.ts`** - Récompense quotidienne
- **`transfer.ts`** - Transfert entre utilisateurs
- **`leaderboard.ts`** - Classement des joueurs
- **`streak.ts`** - Gestion des streaks

#### 👑 Admin Behaviors (`behaviors/admin/`)

- **`generate.ts`** - Génération de tokens
- **`remove.ts`** - Retrait de tokens
- **`exchange.ts`** - Échange entre utilisateurs

#### 🎮 Fun Behaviors (`behaviors/fun/`)

- **`ootd.ts`** - Statistiques OOTD

### 📝 Commandes Slash (`commands/slash/`)

Chaque commande slash utilise les comportements partagés :

```typescript
// Exemple: commands/slash/balance.ts
import { balanceBehavior } from '../../behaviors/money/balance';

export const execute = async (interaction) => {
    const result = await balanceBehavior(
        interaction.user.id, 
        targetUser.id, 
        targetUser.username
    );
    
    if (result.success) {
        // Créer un embed Discord
        const embed = new EmbedBuilder()...
        await interaction.reply({ embeds: [embed] });
    } else {
        await interaction.reply({ content: result.message, ephemeral: true });
    }
};
```

### 🔤 Commandes Préfixe (`commands/prefix/index.ts`)

Le gestionnaire de commandes préfixe utilise les mêmes comportements :

```typescript
// Exemple dans PrefixCommandHandler
private async handleBalance(message: Message, args: string[]): Promise<void> {
    const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
    const result = await balanceBehavior(message.author.id, targetUser.id, targetUser.username);
    await message.reply(result.message);
}
```

## ✅ Avantages de cette structure

### 🔄 Cohérence garantie
- **Même logique métier** pour les commandes slash et préfixe
- **Même validation** des données
- **Même gestion d'erreurs**
- **Même format de réponse**

### 🛠️ Maintenance simplifiée
- **Un seul endroit** pour modifier la logique d'une commande
- **Tests centralisés** sur les comportements
- **Réduction de la duplication** de code

### 📈 Extensibilité
- **Ajout facile** de nouvelles commandes
- **Réutilisation** des comportements existants
- **Séparation claire** entre logique et interface

## 🔧 Migration des commandes existantes

### ✅ Commandes déjà migrées

**Money :**
- ✅ `signin` → `behaviors/money/signIn.ts`
- ✅ `balance` → `behaviors/money/balance.ts`
- ✅ `daily` → `behaviors/money/daily.ts`
- ✅ `transfer` → `behaviors/money/transfer.ts`
- ✅ `leaderboard` → `behaviors/money/leaderboard.ts`
- ✅ `streak` → `behaviors/money/streak.ts`

**Admin :**
- ✅ `generate` → `behaviors/admin/generate.ts`
- ✅ `remove` → `behaviors/admin/remove.ts`
- ✅ `exchange` → `behaviors/admin/exchange.ts`

**Fun :**
- ✅ `ootd` → `behaviors/fun/ootd.ts`

### 📝 Commandes à migrer

**Admin :**
- ⏳ `ping` - Commande simple, peut rester dans `commands/admin/`
- ⏳ `logs` - Commande complexe avec sous-commandes

**Jeux :**
- ⏳ `chifumi` - Logique complexe, nécessite une migration spéciale

## 🚀 Utilisation

### Commandes Slash
```bash
/signin
/balance @utilisateur
/daily
/transfer @utilisateur 100
/leaderboard 10
/streak @utilisateur
/ootd @utilisateur
/generate @utilisateur 500
/remove @utilisateur 200
/exchange @user1 @user2 150
```

### Commandes Préfixe
```bash
!hq signin
!hq balance @utilisateur
!hq daily
!hq transfer @utilisateur 100
!hq leaderboard 10
!hq streak @utilisateur
!hq ootd @utilisateur
!hq generate @utilisateur 500
!hq remove @utilisateur 200
!hq exchange @user1 @user2 150
```

## 🔍 Structure des comportements

Chaque comportement retourne un objet standardisé :

```typescript
interface BehaviorResult {
    success: boolean;
    message: string;
    embed?: any;        // Pour les commandes slash
    user?: any;         // Données utilisateur
    result?: any;       // Résultats additionnels
}
```

## 📊 Comparaison avant/après

### ❌ Avant (Duplication)
```
commands/money/balance.ts     → Logique spécifique slash
utils/prefixCommandHandler.ts → Logique spécifique préfixe
```

### ✅ Après (Partagé)
```
behaviors/money/balance.ts    → Logique partagée
commands/slash/balance.ts     → Interface slash
commands/prefix/index.ts      → Interface préfixe
```

## 🎯 Prochaines étapes

1. **Tester** toutes les commandes migrées
2. **Migrer** les commandes restantes (`ping`, `logs`, `chifumi`)
3. **Supprimer** les anciens fichiers
4. **Documenter** les nouveaux comportements
5. **Ajouter** des tests unitaires pour les comportements

---

**Cette réorganisation garantit une maintenance plus facile et une cohérence parfaite entre toutes les commandes du bot !** 🚀 