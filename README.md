# ![Discord](https://img.shields.io/badge/Discord-Bot-7289DA?logo=discord\&logoColor=white) Bot Discord français multifonctions

Bot Discord **multifonctions en français** avec commandes de **modération, informations, mini-jeux, gestion et fun**.
Facile à configurer et à déployer sur GitHub, Railway, Replit, ou VPS.

---

## ⚡ Fonctionnalités

### Modération

* `+ban` — Bannir un membre
* `+kick` — Expulser un membre
* `+mute` / `+unmute` — Gérer les mutes
* `+clear` — Supprimer des messages
* Système d’avertissements

### Informations

* `+userinfo` — Infos sur un membre
* `+serverinfo` — Infos sur le serveur
* `+ping` — Ping du bot
* Statistiques diverses

### Gestion

* Gestion des rôles
* Outils administrateurs
* Commandes de serveur utiles

### Mini-jeux

* Jeux rapides dans le chat
* Interactions entre membres

### Fun

* Commandes divertissantes
* Réponses automatiques
* Interactions amusantes

---

## 🚀 Installation

### 1. Prérequis

* Node.js **v18 ou supérieur**
* npm

Vérifiez :

```bash
node -v
npm -v
```

---

### 2. Télécharger le projet

```bash
git clone https://github.com/votre-repo/bot-discord-francais.git
cd bot-discord-francais
```

Ou télécharger le projet en ZIP et extraire.

---

### 3. Installer les dépendances

```bash
npm install
```

Dépendance principale :

* discord.js

---

## ⚙️ Configuration

Le bot utilise **`config.js`** pour les paramètres :

```js
module.exports = {
  token: 'ton-token-ici',
  prefix: '+',
  embedColor: '#49ff02',
  ownerId: 'ton-id-ici'
};
```

Remplacez `ton-token-ici` par le token de votre bot.

---

## 🛠 Création du bot Discord

1. Allez sur : Discord Developer Portal
2. Créez une **application**.
3. Dans **Bot**, cliquez sur **Add Bot** et copiez le **token**.
4. Activez les **intents** nécessaires :

   * MESSAGE CONTENT INTENT
   * SERVER MEMBERS INTENT

---

## 🔗 Inviter le bot

Dans **OAuth2 → URL Generator** :

* Cochez `bot`
* Permissions recommandées : **Administrator**
* Minimum : Manage Messages, Kick Members, Ban Members, Manage Roles

Générez l’URL et invitez le bot sur votre serveur.

---

## ▶️ Lancer le bot

```bash
node index.js
```

Le bot sera en ligne et prêt à utiliser les commandes avec le préfixe `+`.

---

## ☁️ Hébergement (24/7)

### Gratuit

* Replit
* Railway
* Render

### VPS / Cloud

* OVHcloud
* Hetzner
* DigitalOcean

---

## 🗂 Structure du projet

```
bot-discord-francais
│
├ data
│ ├ warnings.json
│
├ src
│ ├ commands
│ │ ├ help.s
│ │ ├ ping.js
│ │ ├ warn.js
│ │ └ etc...
│ │
│ ├ events
│ │ ├ antiraid.js
│ │ ├ captcha.js
│ │ ├ guildMemberAdd.js
│ │ ├ interactionButton.js
│ │ ├ interactionCreate.js
│ │ ├ messageCreate.js
│ │ └ ready.js
│ │
│ ├ structure
│ │ ├ commandHandler.js
│ │ ├ eventHandler.js
│ │ └ slashCommandHandler.js
│ │
│ ├ utils
│ │ └ logger.js
│
├ config.js
├ index.js
└ package.json
```

---

## 📌 Contribution

Contributions bienvenues :

1. Fork du projet
2. Créer une branche
3. Pull Request

---

## 📄 Licence

Projet libre d'utilisation et de modification.
