const {
    PermissionsBitField,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

const guildConfig = require('../../utils/guildConfig');
const gw = require('../../utils/giveawayManager');

module.exports = {
    name: 'gw-list',
    description: 'Liste des giveaways (V2 UI)',

    async execute(client, message, args) {
        const all = gw.getByGuild(message.guild.id);

        const actives = all
            .filter(g => !g.ended)
            .sort((a, b) => a.endTime - b.endTime);

        const ended = all
            .filter(g => g.ended)
            .sort((a, b) => b.endTime - a.endTime)
            .slice(0, 5);

        if (!actives.length && !ended.length) {
            return message.reply('❌ Aucun giveaway trouvé.');
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x2B2D31);

        // ─────────────────────────────
        // HEADER
        // ─────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎉 Giveaways — ${message.guild.name}`
            )
        );

        container.addSeparatorComponents(
            new SeparatorBuilder().setDivider(true)
        );

        // ─────────────────────────────
        // ACTIFS
        // ─────────────────────────────
        if (actives.length > 0) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 🟢 Actifs (${actives.length})`
                )
            );

            for (const g of actives.slice(0, 5)) {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${g.prize}**\n` +
                        `🏆 ${g.winners} gagnant(s)\n` +
                        `🎟️ ${g.entries.length} participants\n` +
                        `⏱️ <t:${Math.floor(g.endTime / 1000)}:R>\n` +
                        `📡 <#${g.channelId}>\n` +
                        `🆔 \`${g.messageId}\``
                    )
                );

                container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(1)
                );
            }
        }

        // ─────────────────────────────
        // TERMINÉS
        // ─────────────────────────────
        if (ended.length > 0) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 🔴 Terminés récents`
                )
            );

            for (const g of ended) {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**${g.prize}**\n` +
                        `🏆 ${
                            g.winnerIds?.length
                                ? g.winnerIds.map(id => `<@${id}>`).join(', ')
                                : 'Aucun gagnant'
                        }\n` +
                        `🎟️ ${g.entries.length} participants\n` +
                        `🆔 \`${g.messageId}\``
                    )
                );

                container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(1)
                );
            }
        }

        // ─────────────────────────────
        // FOOTER INFO
        // ─────────────────────────────
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '-# Utilise les boutons pour gérer les giveaways'
            )
        );

        // ─────────────────────────────
        // ACTIONS (OPTIONNEL)
        // ─────────────────────────────
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('gw_refresh_list')
                .setLabel('🔄 Refresh')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('gw_goto_active')
                .setLabel('🟢 Actifs')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('gw_goto_ended')
                .setLabel('🔴 Terminés')
                .setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({
            components: [container, row],
            flags: MessageFlags.IsComponentsV2,
        });
    }
};
