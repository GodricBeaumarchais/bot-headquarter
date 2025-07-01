# Guide de Débogage - Problèmes d'Authentification

## Problèmes identifiés

### 1. Boucle de Fast Refresh
Les logs montrent des rebuilds constants de Turbopack, ce qui peut indiquer :
- Des changements d'état qui déclenchent des re-renders en boucle
- Des dépendances manquantes dans les `useEffect`

### 2. Erreur de connexion
- Le backend n'est pas accessible
- Le token est invalide ou expiré
- Problème de CORS

### 3. Redirection en boucle
- Entre la page principale et la page de login
- État d'authentification incohérent

## Solutions implémentées

### 1. Logs de débogage
- Ajout de logs détaillés dans `AuthContext.tsx`
- Panneau de débogage visible en bas à droite
- Affichage des erreurs en haut de l'écran

### 2. Gestion d'erreur améliorée
- Capture des erreurs réseau
- Fallback vers le token local si le backend est inaccessible
- Messages d'erreur explicites

### 3. Prévention des boucles
- État `hasRedirected` dans `ProtectedRoute`
- Vérification de `isLoading` avant redirection
- Configuration pour désactiver la vérification backend

## Outils de débogage

### Panneau de débogage
- Bouton "Debug" en bas à droite
- Affiche l'état de l'authentification en temps réel
- Montre les erreurs et les informations utilisateur

### Bouton de nettoyage
- Bouton "Clear" en bas à gauche
- Nettoie le localStorage
- Redémarre l'application

### Affichage d'erreurs
- Bannière rouge en haut de l'écran
- Instructions pour résoudre les problèmes
- Liens vers les logs de la console

## Étapes de débogage

1. **Ouvrir la console du navigateur** (F12)
2. **Vérifier les logs** avec les emojis 🔍, 🔑, 🚪, etc.
3. **Utiliser le panneau de débogage** pour voir l'état en temps réel
4. **Cliquer sur "Clear"** si nécessaire pour nettoyer le localStorage
5. **Vérifier que le backend est démarré** sur http://localhost:3001

## Configuration

### Désactiver la vérification backend
En développement, la vérification backend est automatiquement désactivée.
Pour la réactiver manuellement :

```javascript
// Dans la console du navigateur
localStorage.setItem('skip_backend_verification', 'false');
window.location.reload();
```

### Activer la vérification backend
```javascript
// Dans la console du navigateur
localStorage.setItem('skip_backend_verification', 'true');
window.location.reload();
```

## Problèmes courants

### Backend non accessible
- Vérifier que le serveur backend est démarré
- Vérifier l'URL dans `authConfig.ts`
- Vérifier les logs du backend

### Token invalide
- Le token peut être expiré
- Utiliser le bouton "Clear" pour nettoyer
- Se reconnecter via Discord

### CORS
- Vérifier la configuration CORS du backend
- Ajouter `http://localhost:3000` aux origines autorisées

## Logs à surveiller

- `🔍 Vérification de l'authentification...`
- `📦 Token trouvé dans le localStorage`
- `🌐 Vérification du token avec le backend...`
- `✅ Token valide, utilisateur connecté`
- `❌ Token invalide, suppression du localStorage`
- `🔄 Redirection vers la page de connexion...` 