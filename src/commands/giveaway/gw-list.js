const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const gw = require('../../utils/giveawayManager');

module.exports = {
    name: 'gw-list',
    description: 'Affiche la liste des giveaways actifs (et récents) du serveur.',
    async execute(client, message, args) {
        const gcfg = guildConfig.getAll(message.guild.id);
        const showAll = args[0] === 'all';

        const all = gw.getByGuild(message.guild.id);
        const actives = all.filter(g => !g.ended).sort((a, b) => a.endTime - b.endTime);
        const ended = all.filter(g => g.ended).sort((a, b) => b.endTime - a.endTime).slice(0, 5);

        if (actives.length === 0 && ended.length === 0) {
            return message.reply('❌ Aucun giveaway trouvé sur ce serveur.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaways — ' + message.guild.name)
            .setColor('#F1C40F')
            .setTimestamp();

        if (actives.length > 0) {
            embed.addFields({
                name: `🟢 Actifs (${actives.length})`,
                value: actives.map(g =>
                    `**${g.prize}** — 🏆 ${g.winners} gagnant(s) · 🎟️ ${g.entries.length} participants\n` +
                    `⏱️ <t:${Math.floor(g.endTime / 1000)}:R> · 📡 <#${g.channelId}>\n` +
                    `🆔 \`${g.messageId}\``
                ).join('\n\n')
            });
        }

        if (ended.length > 0) {
            embed.addFields({
                name: `🔴 Terminés récents (${ended.length})`,
                value: ended.map(g =>
                    `**${g.prize}** — 🏆 ${g.winnerIds?.length ? g.winnerIds.map(id => `<@${id}>`).join(', ') : 'Aucun gagnant'}\n` +
                    `🎟️ ${g.entries.length} participants · 🆔 \`${g.messageId}\``
                ).join('\n\n')
            });
        }

        embed.setFooter({ text: `Utilisez +gw-reroll <ID> pour reroller · +gw-end <ID> pour terminer` });
        message.channel.send({ embeds: [embed] });
    }
};
