# OAuth Configuration Guide

Guide complet pour configurer l'authentification OAuth avec GitHub et Google.

---

## Table des matières

- [GitHub OAuth](#github-oauth)
- [Google OAuth](#google-oauth)
- [Configuration locale](#configuration-locale)
- [Configuration production](#configuration-production)
- [Dépannage](#dépannage)

---

## GitHub OAuth

### 1. Créer une application OAuth sur GitHub

1. Connectez-vous à votre compte GitHub
2. Allez dans **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
   - Ou directement : https://github.com/settings/developers

3. Remplissez le formulaire :

| Champ | Valeur (Local) | Valeur (Production) |
|-------|----------------|---------------------|
| **Application name** | `kimi-template Dev` | `kimi-template` |
| **Homepage URL** | `http://localhost:3000` | `https://votredomaine.com` |
| **Application description** | (Optionnel) Description de votre app | |
| **Authorization callback URL** | `http://localhost:3000/api/auth/callback/github` | `https://votredomaine.com/api/auth/callback/github` |

> **⚠️ Avertissement sécurité :** N'utilisez que des informations que vous considérez comme publiques. Évitez d'utiliser des données sensibles comme des URLs internes.

> **Note :** Contrairement aux GitHub Apps, une OAuth App ne peut avoir qu'une seule URL de callback. Si vous avez besoin de plusieurs environnements (local, staging, production), vous devrez créer des applications OAuth séparées.

4. **(Optionnel)** Si votre OAuth app utilisera le device flow (ex: CLI), cochez **Enable Device Flow**

5. Cliquez sur **Register application** (ou **New OAuth App**)

6. Sur la page suivante, notez :
   - **Client ID**
   - **Client Secret** (cliquez sur "Generate a new client secret" si besoin)

### ⚠️ Configuration requise pour GitHub Apps

Si vous utilisez une **GitHub App** (au lieu d'une OAuth App), vous devez activer la permission email :
1. Allez dans **Permissions and Events** → **Account Permissions**
2. Définissez **Email addresses** sur **Read-Only**
3. Sauvegardez les changements

Sans cette configuration, vous obtiendrez l'erreur `email_not_found`.

> **Note :** Envisagez de créer une GitHub App plutôt qu'une OAuth App. Les GitHub Apps offrent des permissions plus fines et une meilleure sécurité. De plus, une limite de 100 OAuth apps par utilisateur/organisation s'applique.
>
> Plus d'infos : [Differences between GitHub Apps and OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)

---

## Google OAuth

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. **(Optionnel)** Activez la **People API** si vous avez besoin d'informations de profil détaillées :
   - Menu hamburger → **APIs & Services** → **Library**
   - Recherchez "Google People API" → **Enable**
   
   > Note : Pour l'authentification de base avec Better Auth, seuls les scopes OpenID Connect sont requis. People API n'est nécessaire que si vous souhaitez accéder à des données de profil supplémentaires.

### 2. Configurer l'écran de consentement OAuth

1. Allez dans **APIs & Services** → **OAuth consent screen**
2. Choisissez **External** (pour les utilisateurs externes) → **Create**
3. Remplissez les informations requises :
   - **App name** : Nom de votre application
   - **User support email** : Votre email
   - **Developer contact information** : Votre email
4. Cliquez sur **Save and Continue**
5. Dans **Scopes**, ajoutez les scopes OpenID Connect :
   - `openid` (pour l'authentification)
   - `email` (pour accéder à l'adresse email)
   - `profile` (pour accéder aux informations de profil de base)
   
   > Note : Les scopes `userinfo.email` et `userinfo.profile` sont également acceptés mais `email` et `profile` sont les formes canoniques recommandées par Google.

6. Cliquez sur **Save and Continue**

### 2b. Configurer les utilisateurs de test (Mode Testing)

En mode **External** + **Testing**, seuls les utilisateurs de test peuvent accéder à votre application :

1. Dans **OAuth consent screen** → **Audience**
2. Section **Test users** → **Add users**
3. Ajoutez les adresses email des testeurs (y compris la vôtre)
4. Cliquez sur **Save**

⚠️ **Important** : Sans utilisateurs de test, vous obtiendrez une erreur `access_denied` lors de la connexion.

### 2c. Préparer la mise en production (Optionnel)

Pour passer en production après le développement :

1. **Domaines autorisés** : Allez dans **Branding** → **App Domain**
   - Ajoutez votre domaine comme domaine autorisé
   - Fournissez les liens vers :
     - **Application home page** : `https://votredomaine.com`
     - **Privacy Policy** : `https://votredomaine.com/privacy` (obligatoire)
     - **Terms of Service** : `https://votredomaine.com/terms` (obligatoire)

2. **Vérification de l'application** :
   - Une fois en mode **Production**, votre app doit être vérifiée par Google
   - La vérification peut prendre plusieurs jours
   - Sans vérification, l'app est limitée à 100 utilisateurs

### 3. Créer les identifiants OAuth 2.0

1. Allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth client ID**
3. Choisissez **Web application**
4. Remplissez le formulaire :

| Champ | Valeur |
|-------|--------|
| **Name** | `kimi-template Web Client` |
| **Authorized JavaScript origins** | `http://localhost:3000` (local) / `https://votredomaine.com` (prod) |
| **Authorized redirect URIs** | `http://localhost:3000/api/auth/callback/google` (local) / `https://votredomaine.com/api/auth/callback/google` (prod) |

5. Cliquez sur **Create**
6. Notez le **Client ID** et le **Client Secret**

---

## Configuration locale

### 1. Mettre à jour le fichier `.env.local`

```bash
# ==========================================
# Better Auth Configuration
# ==========================================
# ⚠️ REQUIRED: Must match your application URL exactly
# Used to construct OAuth callback URLs
BETTER_AUTH_URL=http://localhost:3000

# ==========================================
# OAuth Providers
# ==========================================

# GitHub OAuth
# https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Google OAuth  
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Redémarrer le serveur

```bash
# Arrêter le serveur
pkill -f "next dev"

# Relancer
pnpm dev
```

### 3. Tester

1. Allez sur `http://localhost:3000/login`
2. Les boutons "GitHub" et "Google" devraient apparaître
3. Cliquez sur l'un des boutons pour tester

---

## Configuration production

### 1. Variables d'environnement

Dans votre hébergeur (Vercel, Railway, etc.), ajoutez :

```
# ⚠️ REQUIRED: Must be your production domain
BETTER_AUTH_URL=https://votredomaine.com

GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
```

### 2. URLs de callback production

Assurez-vous d'avoir configuré ces URLs dans les applications OAuth :

- GitHub : `https://votredomaine.com/api/auth/callback/github`
- Google : `https://votredomaine.com/api/auth/callback/google`

### 3. Configuration Docker

Si vous utilisez Docker, mettez à jour le `docker-compose.prod.yml` :

```yaml
services:
  app:
    environment:
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
```

---

## Vérification de la configuration

### Tester l'authentification OAuth

```bash
# Vérifier que les variables sont chargées
curl http://localhost:3000/api/auth/session

# Les logs devraient montrer :
# "socialProviders: { github: {...}, google: {...} }"
```

### Logs de débogage

Ajoutez temporairement dans `src/lib/auth.ts` :

```typescript
console.log("OAuth Providers configured:", {
  github: !!process.env.GITHUB_CLIENT_ID,
  google: !!process.env.GOOGLE_CLIENT_ID,
});
```

---

## Dépannage

### Problème : "redirect_uri_mismatch"

**Cause** : L'URL de callback ne correspond pas à celle configurée, ou `BETTER_AUTH_URL` n'est pas configuré.

**Solution** :
- ⚠️ **Vérifiez que `BETTER_AUTH_URL` est configuré** : Cette variable est **REQUISE** pour que Better Auth construise correctement les URLs de callback OAuth
- Vérifiez que `BETTER_AUTH_URL` correspond exactement à l'URL enregistrée (protocole + domaine)
- Pour GitHub : doit se terminer par `/api/auth/callback/github`
- Pour Google : doit se terminer par `/api/auth/callback/google`
- Pas de slash à la fin, protocole exact (http vs https)

> **Note** : Sans `BETTER_AUTH_URL`, Better Auth utilisera `localhost` par défaut même en production, causant l'erreur `redirect_uri_mismatch`.

### Problème : "access_denied" ou consentement refusé

**Cause** : L'utilisateur a refusé l'autorisation ou l'app n'est pas vérifiée.

**Solution** :
- Pour Google : L'app doit être en mode "Testing" et l'utilisateur ajouté comme testeur
- Allez dans OAuth consent screen → Audience → Test users
- Vérifiez que l'email de l'utilisateur est dans la liste des test users

### Problème : "email_not_found" (GitHub)

**Cause** : Vous utilisez une GitHub App sans la permission email activée.

**Solution** :
- Allez dans **Permissions and Events** → **Account Permissions**
- Définissez **Email addresses** sur **Read-Only**
- Sauvegardez les changements
- Regénérez le Client Secret si nécessaire

### Problème : Les boutons OAuth n'apparaissent pas

**Cause** : Les variables d'environnement ne sont pas chargées.

**Solution** :
```bash
# Vérifier les variables
echo $GITHUB_CLIENT_ID

# Redémarrer le serveur après modification de .env.local
pnpm dev
```

### Problème : "Client authentication failed"

**Cause** : Le Client ID ou Client Secret est incorrect.

**Solution** :
- Vérifiez qu'il n'y a pas d'espaces dans les valeurs
- Pour GitHub : Régénérez le Client Secret si perdu
- Pour Google : Créez de nouvelles credentials si nécessaire

### Problème : HTTPS requis en production

**Cause** : Google et GitHub exigent HTTPS en production.

**Solution** :
- Assurez-vous que votre site est en HTTPS
- Mettez à jour `BETTER_AUTH_URL=https://votredomaine.com`
- Vérifiez que les URLs de callback utilisent HTTPS

---

## Architecture OAuth

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   User      │────▶│  Your App    │────▶│  GitHub/     │
│   Browser   │     │  /login      │     │  Google      │
└─────────────┘     └──────────────┘     └──────────────┘
       │                     │                     │
       │                     │◄────────────────────┤
       │                     │   Authorization     │
       │                     │   Code + Token      │
       │                     │                     │
       │◄────────────────────┤                     │
       │   Redirect avec     │                     │
       │   callbackURL       │                     │
       │                     │                     │
       │◄────────────────────┤                     │
       │   Session créée     │                     │
       │   Cookie set        │                     │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
```

---

## Ressources

- [Better Auth - OAuth Providers](https://www.better-auth.com/docs/authentication/github)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google+ API Shutdown](https://developers.google.com/+/api-shutdown) (Google+ fermé en 2019)
- [Next.js OAuth with Better Auth](https://www.better-auth.com/docs/integrations/next)

---

## Support

En cas de problème persistant :
1. Vérifiez les logs du serveur
2. Vérifiez les logs côté navigateur (F12 → Console)
3. Vérifiez la Network tab pour voir les requêtes OAuth
4. Consultez la documentation Better Auth : https://www.better-auth.com/docs
