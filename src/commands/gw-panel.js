const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    PermissionsBitField
} = require('discord.js');
const guildConfig = require('../utils/guildConfig');
const gw = require('../utils/giveawayManager');

module.exports = {
    name: 'gw-panel',
    description: 'Panneau de gestion des giveaways.',
    async execute(client, message, args) {
        const gcfg = guildConfig.getAll(message.guild.id);
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const mgr = gcfg.giveawayConfig?.managerRoles || [];
            if (!mgr.some(r => message.member.roles.cache.has(r))) {
                return message.reply('❌ Permission insuffisante.');
            }
        }

        await sendPanel(message.channel, message.guild, client, message.author.id);
    }
};

async function sendPanel(channel, guild, client, authorId) {
    const actives = gw.getActiveByGuild(guild.id).sort((a, b) => a.endTime - b.endTime);
    const prefix = guildConfig.get(guild.id, 'prefix') || '+';

    const embed = new EmbedBuilder()
        .setTitle('🎉 Panneau de gestion — Giveaways')
        .setColor('#F1C40F')
        .setDescription(
            actives.length === 0
                ? '❌ Aucun giveaway actif actuellement.'
                : actives.map((g, i) =>
                    `**${i + 1}. ${g.prize}**\n` +
                    `🎟️ ${g.entries.length} participants · 🏆 ${g.winners} gagnant(s)\n` +
                    `⏱️ <t:${Math.floor(g.endTime / 1000)}:R> · <#${g.channelId}>\n` +
                    `🆔 \`${g.messageId}\``
                ).join('\n\n')
        )
        .addFields({
            name: '📋 Commandes rapides',
            value: `\`${prefix}gw-create\` — Créer\n\`${prefix}gw-list\` — Lister\n\`${prefix}gw-end <ID>\` — Terminer\n\`${prefix}gw-reroll <ID>\` — Reroller\n\`${prefix}gw-delete <ID>\` — Supprimer\n\`${prefix}gw-config\` — Configuration`,
            inline: false
        })
        .setFooter({ text: `${actives.length} giveaway(s) actif(s)` })
        .setTimestamp();

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('gw_panel_create').setLabel('➕ Créer un Giveaway').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('gw_panel_config').setLabel('⚙️ Configuration').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('gw_panel_list').setLabel('📋 Actualiser').setStyle(ButtonStyle.Secondary)
    );

    const components = [actionRow];

    if (actives.length > 0) {
        const selectOptions = actives.slice(0, 25).map(g => ({
            label: g.prize.slice(0, 100),
            description: `${g.entries.length} participants · Se termine <t:${Math.floor(g.endTime / 1000)}:R>`.slice(0, 100),
            value: g.messageId,
            emoji: '🎉'
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('gw_panel_select')
            .setPlaceholder('🎯 Gérer un giveaway...')
            .addOptions(selectOptions);
        components.push(new ActionRowBuilder().addComponents(selectMenu));
    }

    return channel.send({ embeds: [embed], components });
}
