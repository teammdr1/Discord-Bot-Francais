const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'gw-config',
    description: 'Configure les paramètres par défaut des giveaways du serveur.',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Permission **Gérer le serveur** requise.');
        }

        const cfg = guildConfig.getAll(message.guild.id);
        const gc = cfg.giveawayConfig || {};

        const defaultColor = gc.defaultColor || '#F1C40F';
        const defaultChannel = gc.defaultChannelId ? `<#${gc.defaultChannelId}>` : '*Non défini (salon actuel)*';
        const defaultWinners = gc.defaultWinners || 1;
        const managerRoles = gc.managerRoles?.length > 0 ? gc.managerRoles.map(r => `<@&${r}>`).join(', ') : '*Aucun (admins seulement)*';

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuration des Giveaways')
            .setColor(defaultColor)
            .addFields(
                { name: '🎨 Couleur par défaut', value: `\`${defaultColor}\``, inline: true },
                { name: '📡 Salon par défaut', value: defaultChannel, inline: true },
                { name: '👥 Gagnants par défaut', value: `${defaultWinners}`, inline: true },
                { name: '🔑 Rôles gestionnaires', value: managerRoles, inline: false }
            )
            .setFooter({ text: 'Cliquez sur un bouton pour modifier une valeur.' })
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gw_cfg_color').setLabel('🎨 Couleur').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('gw_cfg_channel').setLabel('📡 Salon').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('gw_cfg_winners').setLabel('👥 Gagnants').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('gw_cfg_roles').setLabel('🔑 Rôles gestionnaires').setStyle(ButtonStyle.Secondary)
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gw_cfg_reset').setLabel('🔄 Réinitialiser').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('gw_cfg_close').setLabel('✖ Fermer').setStyle(ButtonStyle.Secondary)
        );

        const cfgMsg = await message.channel.send({ embeds: [embed], components: [row1, row2] });

        const collector = cfgMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 120000
        });

        collector.on('collect', async interaction => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'gw_cfg_close') {
                await interaction.update({ components: [] });
                return collector.stop();
            }

            if (interaction.customId === 'gw_cfg_reset') {
                guildConfig.setNested(message.guild.id, 'giveawayConfig', 'defaultColor', '#F1C40F');
                guildConfig.setNested(message.guild.id, 'giveawayConfig', 'defaultChannelId', null);
                guildConfig.setNested(message.guild.id, 'giveawayConfig', 'defaultWinners', 1);
                guildConfig.setNested(message.guild.id, 'giveawayConfig', 'managerRoles', []);
                await interaction.reply({ content: '✅ Configuration réinitialisée.', ephemeral: true });
                return refreshCfgMsg(interaction, cfgMsg, message.guild.id, row1, row2);
            }

            // Ouvrir un modal selon le bouton
            const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
            const modal = new ModalBuilder();

            if (interaction.customId === 'gw_cfg_color') {
                modal.setCustomId('gw_modal_cfg_color').setTitle('🎨 Couleur par défaut');
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('value').setLabel('Couleur hex (ex: #F1C40F)').setStyle(TextInputStyle.Short)
                        .setValue(gc.defaultColor || '#F1C40F').setRequired(true)
                ));
            } else if (interaction.customId === 'gw_cfg_channel') {
                modal.setCustomId('gw_modal_cfg_channel').setTitle('📡 Salon par défaut');
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('value').setLabel('ID ou #mention du salon').setStyle(TextInputStyle.Short)
                        .setPlaceholder('Ex: 1234567890 ou #giveaways').setRequired(false)
                ));
            } else if (interaction.customId === 'gw_cfg_winners') {
                modal.setCustomId('gw_modal_cfg_winners').setTitle('👥 Gagnants par défaut');
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('value').setLabel('Nombre de gagnants').setStyle(TextInputStyle.Short)
                        .setValue(String(gc.defaultWinners || 1)).setRequired(true)
                ));
            } else if (interaction.customId === 'gw_cfg_roles') {
                modal.setCustomId('gw_modal_cfg_roles').setTitle('🔑 Rôles gestionnaires');
                modal.addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('value')
                        .setLabel('IDs de rôles séparés par des virgules')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Ex: 123456789, 987654321')
                        .setRequired(false)
                ));
            }

            await interaction.showModal(modal);
        });

        collector.on('end', () => {
            cfgMsg.edit({ components: [] }).catch(() => {});
        });
    }
};

async function refreshCfgMsg(interaction, cfgMsg, guildId, row1, row2) {
    const cfg = guildConfig.getAll(guildId);
    const gc = cfg.giveawayConfig || {};
    const embed = new EmbedBuilder()
        .setTitle('⚙️ Configuration des Giveaways')
        .setColor(gc.defaultColor || '#F1C40F')
        .addFields(
            { name: '🎨 Couleur par défaut', value: `\`${gc.defaultColor || '#F1C40F'}\``, inline: true },
            { name: '📡 Salon par défaut', value: gc.defaultChannelId ? `<#${gc.defaultChannelId}>` : '*Non défini*', inline: true },
            { name: '👥 Gagnants par défaut', value: `${gc.defaultWinners || 1}`, inline: true },
            { name: '🔑 Rôles gestionnaires', value: gc.managerRoles?.length > 0 ? gc.managerRoles.map(r => `<@&${r}>`).join(', ') : '*Aucun*', inline: false }
        )
        .setFooter({ text: 'Configuration mise à jour ✅' })
        .setTimestamp();
    await cfgMsg.edit({ embeds: [embed], components: [row1, row2] }).catch(() => {});
}
