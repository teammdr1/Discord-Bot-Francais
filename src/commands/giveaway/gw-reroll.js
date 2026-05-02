const { PermissionsBitField } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const gw = require('../../utils/giveawayManager');

function isManager(member, gcfg) {
    if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
    const mgr = gcfg.giveawayConfig?.managerRoles || [];
    return mgr.some(r => member.roles.cache.has(r));
}

module.exports = {
    name: 'gw-reroll',
    description: 'Relance la sélection d\'un gagnant pour un giveaway terminé.',
    async execute(client, message, args) {
        const gcfg = guildConfig.getAll(message.guild.id);
        if (!isManager(message.member, gcfg)) {
            return message.reply('❌ Permission insuffisante.');
        }

        let giveaway;
        if (args[0]) {
            giveaway = gw.get(args[0]);
        } else {
            const all = gw.getByGuild(message.guild.id).filter(g => g.ended).sort((a, b) => b.endTime - a.endTime);
            giveaway = all[0];
        }

        if (!giveaway) return message.reply('❌ Giveaway introuvable. Fournissez l\'ID du message ou utilisez dans le bon serveur.');
        if (!giveaway.ended) return message.reply('❌ Ce giveaway n\'est pas encore terminé. Utilisez `+gw-end <ID>` d\'abord.');
        if (giveaway.entries.length === 0) return message.reply('❌ Aucun participant dans ce giveaway.');

        await guild_reroll(giveaway, message, gcfg);
    }
};

async function guild_reroll(giveaway, message, gcfg) {
    let eligible = [...giveaway.entries];
    if (giveaway.requiredRoleId) {
        await message.guild.members.fetch().catch(() => {});
        eligible = eligible.filter(uid => {
            const m = message.guild.members.cache.get(uid);
            return m && m.roles.cache.has(giveaway.requiredRoleId);
        });
    }

    if (eligible.length === 0) return message.reply('❌ Aucun participant éligible pour ce reroll.');

    const newWinners = eligible.sort(() => Math.random() - 0.5).slice(0, giveaway.winners);
    gw.update(giveaway.messageId, { winnerIds: newWinners });

    const channel = message.guild.channels.cache.get(giveaway.channelId);
    const winnersText = newWinners.map(id => `<@${id}>`).join(', ');

    if (channel) {
        await channel.send({
            content: `🔄 **Reroll** — Nouveau(x) gagnant(s) pour **${giveaway.prize}** : ${winnersText} ! 🎉\n> Rerollé par ${message.author}`,
            allowedMentions: { users: newWinners }
        }).catch(() => {});
    }
    message.reply(`✅ Reroll effectué ! Nouveau(x) gagnant(s) : ${winnersText}`);
}
