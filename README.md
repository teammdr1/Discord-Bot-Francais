# 🤖 Bot Discord Multifonctions

[![Discord](https://img.shields.io/badge/Discord-Bot-7289DA?logo=discord&logoColor=white)](https://discord.gg/tqxJPf4YFc)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)

Un bot Discord français ultra-complet avec modération avancée, économie, musique, tickets et bien plus. Facile à déployer et configurer.

---

## ✨ Fonctionnalités Principales

### 🛡️ Modération Avancée
- Anti-raid automatique avec captcha
- Système de sanctions complet (ban, kick, mute, warn)
- Logs détaillés des actions
- Protection contre les raids et spams

### 💰 Système Économique
- Balance personnelle et bancaire
- Récompenses quotidiennes (`+daily`)
- Casino intégré (coinflip, slots, roulette)
- Leaderboard des plus riches
- Système de paiement entre utilisateurs

### 🎵 Musique & Divertissement
- Lecteur audio complet (YouTube, SoundCloud)
- Playlist management
- Commandes fun et mini-jeux
- Avatars personnalisés et interactions sociales

### 🎫 Support & Tickets
- Système de tickets personnalisable
- Catégorisation automatique
- Rôles de support dédiés
- Interface intuitive

---

## 🚀 Installation Rapide

### Prérequis
- **Node.js v18+** et **npm**
- Un bot Discord (créé sur [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

```bash
# Cloner le repo
git clone https://github.com/teammdr1/TheNetwork.git
cd TheNetwork

# Installer les dépendances
npm install

# Configurer le bot
# Éditez config.js avec votre token Discord
```

### Configuration

Modifiez `config.js` :

```js
module.exports = {
  token: "VOTRE_TOKEN_DISCORD",
  prefix: "+",
  embedColor: "#49ff02",
  ownerId: "VOTRE_ID_DISCORD",
  supportServerInvite: "https://discord.gg/votre-serveur"
};
```

### Lancement

```bash
node index.js
```

Le bot sera en ligne !

---

## 🗂 Structure du Projet

```
├── index.js              # Point d'entrée principal
├── config.js             # Configuration du bot
├── version.js            # Gestion des versions
├── data/                 # Stockage JSON (économie, tickets, etc.)
└── src/
    ├── assets/         # Images et polices d'écritures
    ├── commands/         # Commandes préfixées
    ├── slashCommands/    # Commandes slash
    ├── events/           # Gestionnaires d'événements
    ├── structure/        # Handlers principaux
    └── utils/            # Fonctions utilitaires
```

---

## ☁️ Déploiement 24/7

### Plateformes Gratuites
- **Railway** : Déploiement automatique depuis GitHub
- **Render** : Support Node.js natif
- **Replit** : Édition en ligne avec déploiement

### VPS/Cloud
- **OVHcloud** : Serveurs français performants
- **Hetzner** : Excellent rapport qualité/prix
- **DigitalOcean** : Droplets avec monitoring

### Variables d'environnement
```bash
DISCORD_TOKEN=votre_token
OWNER_ID=votre_id
```

---

## 📚 Commandes Disponibles

### Modération
- `+ban @user [raison]` - Bannir un utilisateur
- `+kick @user [raison]` - Expulser un utilisateur
- `+mute @user [durée]` - Muter un utilisateur
- `+warn @user [raison]` - Avertir un utilisateur

### Économie
- `+balance` - Voir sa balance
- `+daily` - Récompense quotidienne
- `+pay @user montant` - Payer un utilisateur
- `+leaderboard` - Classement des plus riches

### Musique
- `+play [url/titre]` - Jouer de la musique
- `+skip` - Passer à la piste suivante
- `+queue` - Voir la file d'attente
- `+stop` - Arrêter la musique

### Utilitaires
- `+help` - Liste des commandes
- `+ping` - Latence du bot
- `+serverinfo` - Infos du serveur
- `+userinfo @user` - Infos d'un utilisateur

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. **Fork** le projet
2. Créez une **branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

*Développé avec ❤️ pour la communauté Discord francophone*
