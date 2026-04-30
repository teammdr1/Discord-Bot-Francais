const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');

const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setup',
  description: 'Panel de configuration interactif',

  async execute(client, message) {

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Permission requise.');
    }

    const config = guildConfig.getAll(message.guild.id);
    const ar = config.antiraidConfig;

    let page = 0;

    function getEmbed(page) {

      const welcomeChannel = config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : '❌ Non configuré';
      const logChannel = config.logChannelId ? `<#${config.logChannelId}>` : '❌ Non configuré';
      const soutienRole = config.soutienRoleId ? `<@&${config.soutienRoleId}>` : '❌ Non configuré';
      const warnRoles = config.warnRoles.length > 0
        ? config.warnRoles.map(id => `<@&${id}>`).join(', ')
        : '❌ Non configuré';

      const base = new EmbedBuilder()
        .setColor('#49ff02')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter({ text: `Page ${page + 1}/3 • ${message.guild.name}` })
        .setTimestamp();

      // 🧩 PAGE 1 — GÉNÉRAL
      if (page === 0) {
        return base
          .setTitle('⚙️ Configuration Générale')
          .setDescription(
    `__**📌 Paramètres principaux**__

    > **Préfixe :** \`${config.prefix}\`
    > **Salon bienvenue :** ${welcomeChannel}
    > **Salon logs :** ${logChannel}

    __**🌐 Serveur**__

    > **Backup :** ${config.backupLink || '❌ Non configuré'}
    > **Description :** ${config.serverDescription ? '✅ Configurée' : '❌ Non configurée'}

    \`\`\`yaml
    Navigation :
    ⬅️ ➡️ pour changer de page
    Menu déroulant pour accès rapide
    \`\`\``
          );
      }

      // 🔨 PAGE 2 — MODÉRATION
      if (page === 1) {
        return base
          .setTitle('🔨 Configuration Modération')
          .setDescription(
    `__**👮 Permissions & rôles**__

    > **Rôle soutien :** ${soutienRole}
    > **Statut soutien :** ${config.soutienStatut || '❌ Non configuré'}

    __**🛡️ Sécurité**__

    > **Captcha :** ${config.captchaEnabled ? '✅ Activé' : '❌ Désactivé'}

    __**⚠️ Gestion des warns**__

    > **Rôles autorisés :**
    ${warnRoles}

    \`\`\`diff
    + Configure ici tout ce qui concerne la modération
    \`\`\``
          );
      }

      // 🛡️ PAGE 3 — ANTI-RAID
      if (page === 2) {
        return base
          .setTitle('🛡️ Anti-Raid')
          .setDescription(
    `__**📊 Protection globale**__

    > **Statut :** ${config.antiraidEnabled ? '✅ Activé' : '❌ Désactivé'}

    __**💬 Anti-spam**__

    > **Limite :** ${ar.spamLimit} messages
    > **Intervalle :** ${ar.spamInterval} ms

    __**⚙️ Sanctions**__

    > **Mute :** ${ar.muteDuration} minutes
    > **Kick :** 2ème violation
    > **Ban :** 3ème violation+

    __**👥 Anti-raid (joins)**__

    > **Limite :** ${ar.joinLimit} membres
    > **Intervalle :** ${ar.joinInterval / 1000}s

    \`\`\`fix
    Système actif en temps réel
    \`\`\``
          );
      }
    }

    function getComponents() {

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('setup_prev')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('setup_next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Secondary)
      );

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup_select')
          .setPlaceholder('Aller à une page...')
          .addOptions([
            { label: 'Général', value: '0' },
            { label: 'Modération', value: '1' },
            { label: 'Anti-Raid', value: '2' }
          ])
      );

      return [buttons, menu];
    }

    const msg = await message.channel.send({
      embeds: [getEmbed(page)],
      components: getComponents()
    });

    const collector = msg.createMessageComponentCollector({
      time: 300000
    });

    collector.on('collect', async (interaction) => {

      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ Pas pour toi', ephemeral: true });
      }

      if (interaction.customId === 'setup_prev') {
        page = page > 0 ? page - 1 : 2;
      }

      if (interaction.customId === 'setup_next') {
        page = page < 2 ? page + 1 : 0;
      }

      if (interaction.customId === 'setup_select') {
        page = parseInt(interaction.values[0]);
      }

      await interaction.update({
        embeds: [getEmbed(page)],
        components: getComponents()
      });
    });
  }
};
