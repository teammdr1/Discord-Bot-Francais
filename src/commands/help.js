const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');
const guildConfig = require('../utils/guildConfig');

module.exports = {
  name: 'help',
  description: 'Affiche le menu d\'aide complet avec toutes les catégories et commandes.',
  async execute(client, message, args) {
    const prefix = guildConfig.get(message.guild.id, 'prefix') || '+';

    const categories = {
      '🔍・Informations': [
        { name: `${prefix}alladmins`, description: 'Liste tous les administrateurs du serveur.' },
        { name: `${prefix}all-avatars`, description: 'Affiche les avatars de tous les membres.' },
        { name: `${prefix}allbots`, description: 'Liste tous les bots du serveur.' },
        { name: `${prefix}allchannels`, description: 'Affiche tous les salons du serveur.' },
        { name: `${prefix}allroles`, description: 'Affiche tous les rôles du serveur.' },
        { name: `${prefix}banner`, description: 'Affiche la bannière d\'un utilisateur.' },
        { name: `${prefix}boosts`, description: 'Affiche le nombre de boosts du serveur.' },
        { name: `${prefix}prevnames`, description: 'Affiche les anciens pseudos d\'un membre.' },
        { name: `${prefix}serverinfo`, description: 'Affiche les informations du serveur.' },
        { name: `${prefix}userinfo`, description: 'Affiche des informations sur un utilisateur.' },
        { name: `${prefix}roleinfo`, description: 'Affiche les informations d\'un rôle.' },
        { name: `${prefix}rolelist`, description: 'Liste tous les rôles du serveur.' },
        { name: `${prefix}perm`, description: 'Affiche les permissions d\'un membre.' },
        { name: `${prefix}stats`, description: 'Affiche les statistiques du bot.' },
        { name: `${prefix}ping`, description: 'Affiche la latence du bot.' },
      ],
      '⚔️・Modération': [
        { name: `${prefix}addrole <@users> <@roles>`, description: 'Ajoute un rôle à un ou plusieurs membres.' },
        { name: `${prefix}removerole <@users> <@roles>`, description: 'Retire un rôle à un ou plusieurs membres.' },
        { name: `${prefix}ban <@users> [raison]`, description: 'Bannit un ou plusieurs membres.' },
        { name: `${prefix}unban <ID>`, description: 'Débannit un membre.' },
        { name: `${prefix}unbanall`, description: 'Débannit tous les membres.' },
        { name: `${prefix}kick <@users> [raison]`, description: 'Expulse un ou plusieurs membres.' },
        { name: `${prefix}derank <@users>`, description: 'Enlève tous les rôles d\'un membre.' },
        { name: `${prefix}mute <@users> [raison]`, description: 'Mute un ou plusieurs membres.' },
        { name: `${prefix}unmute <@users>`, description: 'Unmute un ou plusieurs membres.' },
        { name: `${prefix}unmuteall`, description: 'Unmute tous les membres actuellement mutés.' },
        { name: `${prefix}muterole <@role>`, description: 'Attribue le rôle utilisé pour le mute.' },
        { name: `${prefix}timeout <@user> <durée>`, description: 'Met un membre en timeout.' },
        { name: `${prefix}untimeout <@user>`, description: 'Retire le timeout d\'un membre.' },
        { name: `${prefix}warn <@users> <raison>`, description: 'Avertit un ou plusieurs membres.' },
        { name: `${prefix}unwarn <@user> <ID>`, description: 'Retire un avertissement spécifique.' },
        { name: `${prefix}warnlist <@user>`, description: 'Affiche les avertissements d\'un membre.' },
        { name: `${prefix}warnperm`, description: 'Gère les permissions de sanction.' },
        { name: `${prefix}clear <nombre>`, description: 'Supprime un nombre de messages.' },
        { name: `${prefix}slowmode <temps/clear>`, description: 'Active ou désactive le slowmode.' },
        { name: `${prefix}nick <@user> <pseudo/remove>`, description: 'Change le pseudo d\'un membre.' },
        { name: `${prefix}temprole <@users> <@roles> <durée>`, description: 'Ajoute un rôle temporaire.' },
        { name: `${prefix}ban-alt <@user>`, description: 'Bannit les comptes alt d\'un membre.' },
      ],
      '🔒・Gestion des salons': [
        { name: `${prefix}bringall [#salon]`, description: 'Déplace tous les membres vocaux dans un salon.' },
        { name: `${prefix}cleanup all`, description: 'Déconnecte tous les membres vocaux.' },
        { name: `${prefix}cleanup <#salon>`, description: 'Déconnecte les membres d\'un salon vocal.' },
        { name: `${prefix}unlockall`, description: 'Débloque tous les salons textuels.' },
        { name: `${prefix}unhideall`, description: 'Rend tous les salons visibles.' },
        { name: `${prefix}unslowmode`, description: 'Retire le slowmode de tous les salons.' },
        { name: `${prefix}snipe`, description: 'Affiche le dernier message supprimé.' },
        { name: `${prefix}say <texte>`, description: 'Fait parler le bot dans le salon.' },
        { name: `${prefix}embed <texte>`, description: 'Envoie un message en embed.' },
      ],
      '🎫・Tickets': [
        { name: `${prefix}ticket panel [#salon]`, description: 'Envoie le panneau de tickets dans un salon.' },
        { name: `${prefix}ticket addcat <nom> [emoji] [desc]`, description: 'Crée une catégorie de ticket.' },
        { name: `${prefix}ticket removecat <nom>`, description: 'Supprime une catégorie de ticket.' },
        { name: `${prefix}ticket setrole <catégorie> @Role`, description: 'Donne accès staff à une catégorie.' },
        { name: `${prefix}ticket removerole <catégorie> @Role`, description: 'Retire un rôle staff d\'une catégorie.' },
        { name: `${prefix}ticket setcategory <catégorie> <ID>`, description: 'Définit la catégorie Discord des tickets.' },
        { name: `${prefix}ticket setlog #salon`, description: 'Définit le salon de logs des tickets.' },
        { name: `${prefix}ticket setdesc [catégorie] <texte>`, description: 'Modifie la description du panneau ou d\'une catégorie.' },
        { name: `${prefix}ticket setcolor #hex`, description: 'Modifie la couleur du panneau.' },
        { name: `${prefix}ticket config`, description: 'Affiche la configuration des tickets.' },
      ],
      '📋・Logs': [
        { name: `${prefix}logs`, description: 'Panneau interactif de configuration des salons de logs.' },
        { name: `${prefix}logs set <type> #salon`, description: 'Définit un salon pour un type de log (member, messages, voice, roles, boost, channels, moderation).' },
        { name: `${prefix}logs clear <type>`, description: 'Désactive un type de log.' },
        { name: `${prefix}logs clearall`, description: 'Supprime tous les salons de logs configurés.' },
      ],
      '🔒・Permissions': [
        { name: `${prefix}perms role @Role`, description: 'Modifier les permissions d\'un rôle (menu interactif).' },
        { name: `${prefix}perms channel #salon @Role`, description: 'Modifier les overrides de permission d\'un salon (menu interactif).' },
        { name: `${prefix}perms reset #salon`, description: 'Réinitialise toutes les permissions d\'un salon.' },
        { name: `${prefix}perms sync #salon`, description: 'Synchronise un salon avec sa catégorie parente.' },
      ],
      '👑・Owners Bot': [
        { name: `${prefix}owner`, description: 'Lister les owners du bot sur ce serveur.' },
        { name: `${prefix}owner add @user`, description: 'Ajouter un owner (accès total aux commandes du bot).' },
        { name: `${prefix}owner remove @user`, description: 'Retirer un owner.' },
        { name: `${prefix}owner clear`, description: 'Supprimer tous les owners (admin uniquement).' },
      ],
      '🛡️・Sécurité & Config': [
        { name: `${prefix}setup`, description: 'Configure le bot pour ce serveur (assistant interactif).' },
        { name: `${prefix}setprefix <préfixe>`, description: 'Change le préfixe du bot.' },
        { name: `${prefix}setwelcome <#salon>`, description: 'Définit le salon de bienvenue.' },
        { name: `${prefix}setlog <#salon>`, description: 'Définit le salon de logs.' },
        { name: `${prefix}setsoutien <@role>`, description: 'Définit le rôle soutien.' },
        { name: `${prefix}setcaptcha on/off`, description: 'Active ou désactive le captcha.' },
        { name: `${prefix}setantiraid on/off`, description: 'Active ou désactive l\'anti-raid.' },
        { name: `${prefix}setantiraid config`, description: 'Affiche la config anti-raid.' },
        { name: `${prefix}setantiraid limit <n>`, description: 'Limite de messages avant sanction.' },
        { name: `${prefix}setantiraid interval <ms>`, description: 'Intervalle de détection spam (ms).' },
        { name: `${prefix}setantiraid mute <minutes>`, description: 'Durée du mute anti-spam.' },
        { name: `${prefix}setantiraid joins <n>`, description: 'Limite de joins pour déclencher l\'anti-raid.' },
        { name: `${prefix}setantiraid invites on/off`, description: 'Désactive les invitations lors d\'un raid.' },
        { name: `${prefix}setantiraid unlock`, description: 'Déverrouille le serveur après un raid.' },
        { name: `${prefix}setbackup <lien>`, description: 'Définit le lien de backup.' },
        { name: `${prefix}setdesc <texte>`, description: 'Définit la description du serveur.' },
        { name: `${prefix}panel`, description: 'Affiche le panneau de sécurité (captcha/antiraid).' },
      ],
      '🎮・Roblox': [
        { name: `${prefix}roblox-profile <pseudo>`, description: 'Affiche le profil d\'un utilisateur Roblox.' },
        { name: `${prefix}roblox-avatar <pseudo>`, description: 'Affiche l\'avatar Roblox.' },
        { name: `${prefix}roblox-groupinfo <ID>`, description: 'Affiche les infos d\'un groupe Roblox.' },
        { name: `${prefix}roblox-game <ID>`, description: 'Affiche les infos d\'un jeu Roblox.' },
      ],
      '🧩・Jeux': [
        { name: `${prefix}aventure`, description: 'Lance une aventure interactive.' },
        { name: `${prefix}bataille-navale`, description: 'Joue à la bataille navale.' },
        { name: `${prefix}pfc`, description: 'Pierre-feuille-ciseaux.' },
        { name: `${prefix}quiz`, description: 'Pose une question de quiz.' },
        { name: `${prefix}tic-tac-toe`, description: 'Joue au morpion.' },
        { name: `${prefix}fight`, description: 'Lance un mini-jeu de combat.' },
        { name: `${prefix}dissection`, description: 'Mini-jeu de dissection.' },
      ],
      '🎉・Giveaways': [
        { name: `${prefix}gw-create`, description: 'Crée un giveaway (wizard interactif).' },
        { name: `${prefix}gw-create <durée> <gagnants> <prix>`, description: 'Crée un giveaway en une ligne. Ex: `+gw-create 1h 1 iPhone 15`' },
        { name: `${prefix}gw-end [ID]`, description: 'Termine un giveaway immédiatement.' },
        { name: `${prefix}gw-reroll [ID]`, description: 'Reroll les gagnants d\'un giveaway terminé.' },
        { name: `${prefix}gw-list`, description: 'Liste les giveaways actifs et récents.' },
        { name: `${prefix}gw-delete <ID>`, description: 'Supprime définitivement un giveaway.' },
        { name: `${prefix}gw-config`, description: 'Configure les paramètres par défaut (couleur, salon, gagnants, rôles).' },
        { name: `${prefix}gw-panel`, description: 'Panneau de gestion des giveaways avec menus interactifs.' },
      ],
      '🎗️・Divertissement': [
        { name: `${prefix}8ball <question>`, description: 'Pose une question, reçois une réponse aléatoire.' },
        { name: `${prefix}calcul <expression>`, description: 'Effectue un calcul mathématique.' },
        { name: `${prefix}citation`, description: 'Affiche une citation aléatoire.' },
        { name: `${prefix}chiasse`, description: 'Affiche un GIF humoristique.' },
        { name: `${prefix}claque [@user]`, description: 'Affiche un GIF de claque.' },
        { name: `${prefix}cry [@user]`, description: 'Affiche un GIF de pleurs.' },
        { name: `${prefix}gay [@user]`, description: 'Calcule un pourcentage humoristique.' },
        { name: `${prefix}lc <@user1> <@user2>`, description: 'Calcule un pourcentage d\'amour.' },
        { name: `${prefix}pat [@user]`, description: 'Affiche un GIF de tapotement.' },
        { name: `${prefix}punch [@user]`, description: 'Affiche un GIF de coup de poing.' },
        { name: `${prefix}speed`, description: 'Teste ta vitesse de frappe.' },
        { name: `${prefix}vote`, description: 'Crée un vote rapide.' },
      ],
    };

    const totalCommands = Object.values(categories).flat().length;

    // ─── Boutons de liens ───
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const linkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🤖 Inviter le bot')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteUrl),
      new ButtonBuilder()
        .setLabel('💬 Serveur Support')
        .setStyle(ButtonStyle.Link)
        .setURL(config.supportServerInvite)
    );

    // ─── Embed d'accueil ───
    const homeEmbed = new EmbedBuilder()
      .setColor('#49ff02')
      .setTitle('🏡 Menu d\'accueil')
      .setDescription('Bienvenue dans le menu d\'aide !\nSélectionnez une catégorie dans le menu déroulant pour voir les commandes.')
      .addFields(
        {
          name: '⚙️ Utilisation',
          value: `\`<...>\` = obligatoire • \`[...]\` = optionnel`,
          inline: false
        },
        {
          name: '📊 Informations',
          value: `Préfixe : \`${prefix}\`\nCommandes : \`${totalCommands}\`\nServeurs : \`${client.guilds.cache.size}\``,
          inline: true
        },
        {
          name: '📂 Catégories',
          value: Object.keys(categories).join('\n'),
          inline: true
        }
      )
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `${client.user.username} • Sélectionnez une catégorie`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    // ─── Select menu ───
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('📂 Choisissez une catégorie...')
      .addOptions(Object.keys(categories).map((cat, i) => ({
        label: cat.replace(/[^\w\s・-]/gu, '').trim() || cat,
        description: `${categories[cat].length} commande(s)`,
        value: i.toString(),
        emoji: cat.match(/^\p{Emoji}/u)?.[0] || '📋'
      })));

    const rowMenu = new ActionRowBuilder().addComponents(selectMenu);

    // ─── Boutons de navigation ───
    const backButton = new ButtonBuilder().setCustomId('help_back').setLabel('◀ Précédent').setStyle(ButtonStyle.Secondary).setDisabled(true);
    const nextButton = new ButtonBuilder().setCustomId('help_next').setLabel('Suivant ▶').setStyle(ButtonStyle.Secondary).setDisabled(true);
    const closeButton = new ButtonBuilder().setCustomId('help_close').setLabel('✖ Fermer').setStyle(ButtonStyle.Danger);
    const homeButton = new ButtonBuilder().setCustomId('help_home').setLabel('🏡 Accueil').setStyle(ButtonStyle.Success);
    const navRow = new ActionRowBuilder().addComponents(homeButton, backButton, nextButton, closeButton);

    const helpMessage = await message.channel.send({ embeds: [homeEmbed], components: [rowMenu, navRow, linkRow] });

    let currentCategory = null;
    let currentPage = 0;
    const commandsPerPage = 10;

    function buildCategoryEmbed(catName, page) {
      const commands = categories[catName];
      const totalPages = Math.ceil(commands.length / commandsPerPage);
      const slice = commands.slice(page * commandsPerPage, (page + 1) * commandsPerPage);
      return new EmbedBuilder()
        .setColor('#ebff00')
        .setTitle(`${catName}`)
        .setDescription(slice.map(c => `> **\`${c.name}\`**\n> ${c.description}`).join('\n\n'))
        .setFooter({ text: `Page ${page + 1}/${totalPages} • ${commands.length} commande(s)`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
    }

    function updateNav(commands, page) {
      const totalPages = Math.ceil(commands.length / commandsPerPage);
      backButton.setDisabled(page === 0);
      nextButton.setDisabled(page + 1 >= totalPages);
    }

    const collector = helpMessage.createMessageComponentCollector({ time: 180000 });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ Ce menu ne vous appartient pas.', ephemeral: true });
      }
      if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

      if (interaction.isStringSelectMenu() && interaction.customId === 'help_select') {
        const index = parseInt(interaction.values[0]);
        currentCategory = Object.keys(categories)[index];
        currentPage = 0;
        const commands = categories[currentCategory];
        updateNav(commands, currentPage);
        return interaction.update({ embeds: [buildCategoryEmbed(currentCategory, currentPage)], components: [rowMenu, navRow, linkRow] });
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'help_close') {
          await interaction.update({ content: '✖ Menu fermé.', embeds: [], components: [] });
          return collector.stop();
        }

        if (interaction.customId === 'help_home') {
          currentCategory = null;
          currentPage = 0;
          backButton.setDisabled(true);
          nextButton.setDisabled(true);
          return interaction.update({ embeds: [homeEmbed], components: [rowMenu, navRow, linkRow] });
        }

        if (!currentCategory) {
          return interaction.reply({ content: '❌ Sélectionnez d\'abord une catégorie.', ephemeral: true });
        }

        const commands = categories[currentCategory];
        if (interaction.customId === 'help_back' && currentPage > 0) currentPage--;
        if (interaction.customId === 'help_next' && (currentPage + 1) * commandsPerPage < commands.length) currentPage++;
        updateNav(commands, currentPage);
        return interaction.update({ embeds: [buildCategoryEmbed(currentCategory, currentPage)], components: [rowMenu, navRow, linkRow] });
      }
    });

    collector.on('end', () => {
      helpMessage.edit({ components: [] }).catch(() => {});
    });
  }
};
