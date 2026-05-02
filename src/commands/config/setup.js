const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'setup',
    description: 'Panel de configuration interactif',

    async execute(client, message) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Permission requise.');
        }

        let page = 0;

        function getContainer(page) {
            const config = guildConfig.getAll(message.guild.id);
            const ar = config.antiraidConfig;

            const welcomeChannel = config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : '❌ Non configuré';
            const logChannel = config.logChannelId ? `<#${config.logChannelId}>` : '❌ Non configuré';
            const soutienRole = config.soutienRoleId ? `<@&${config.soutienRoleId}>` : '❌ Non configuré';
            const warnRoles = config.warnRoles?.length > 0
                ? config.warnRoles.map(id => `<@&${id}>`).join(', ')
                : '❌ Non configuré';

            const container = new ContainerBuilder().setAccentColor(0x49FF02);
            const iconURL = message.guild.iconURL({ dynamic: true, size: 128 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';

            if (page === 0) {
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('## ⚙️ Configuration Générale')
                        )
                        .setThumbnailAccessory(new ThumbnailBuilder().setURL(iconURL))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**📌 Paramètres principaux**\n` +
                        `> **Préfixe :** \`${config.prefix}\`\n` +
                        `> **Salon bienvenue :** ${welcomeChannel}\n` +
                        `> **Salon logs :** ${logChannel}\n\n` +
                        `**🌐 Serveur**\n` +
                        `> **Backup :** ${config.backupLink || '❌ Non configuré'}\n` +
                        `> **Description :** ${config.serverDescription ? '✅ Configurée' : '❌ Non configurée'}`
                    )
                );
            }

            if (page === 1) {
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('## 🔨 Configuration Modération')
                        )
                        .setThumbnailAccessory(new ThumbnailBuilder().setURL(iconURL))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**👮 Permissions & rôles**\n` +
                        `> **Rôle soutien :** ${soutienRole}\n` +
                        `> **Statut soutien :** ${config.soutienStatut || '❌ Non configuré'}\n\n` +
                        `**🛡️ Sécurité**\n` +
                        `> **Captcha :** ${config.captchaEnabled ? '✅ Activé' : '❌ Désactivé'}\n\n` +
                        `**⚠️ Gestion des warns**\n` +
                        `> **Rôles autorisés :** ${warnRoles}`
                    )
                );
            }

            if (page === 2) {
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('## 🛡️ Anti-Raid')
                        )
                        .setThumbnailAccessory(new ThumbnailBuilder().setURL(iconURL))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**📊 Protection globale**\n` +
                        `> **Statut :** ${config.antiraidEnabled ? '✅ Activé' : '❌ Désactivé'}\n\n` +
                        `**💬 Anti-spam**\n` +
                        `> **Limite :** ${ar.spamLimit} messages\n` +
                        `> **Intervalle :** ${ar.spamInterval} ms\n\n` +
                        `**⚙️ Sanctions**\n` +
                        `> **Mute :** ${ar.muteDuration} minutes · **Kick :** 2ème violation · **Ban :** 3ème+\n\n` +
                        `**👥 Anti-raid (joins)**\n` +
                        `> **Limite :** ${ar.joinLimit} membres\n` +
                        `> **Intervalle :** ${ar.joinInterval / 1000}s`
                    )
                );
            }

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# Page ${page + 1}/3 · ${message.guild.name}`)
            );

            return container;
        }

        function getActionRows() {
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('setup_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('setup_next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
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
            components: [getContainer(page), ...getActionRows()],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = msg.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: '❌ Pas pour toi', ephemeral: true });
            }

            if (interaction.customId === 'setup_prev') page = page > 0 ? page - 1 : 2;
            if (interaction.customId === 'setup_next') page = page < 2 ? page + 1 : 0;
            if (interaction.customId === 'setup_select') page = parseInt(interaction.values[0]);

            await interaction.update({
                components: [getContainer(page), ...getActionRows()],
                flags: MessageFlags.IsComponentsV2
            });
        });
    }
};
