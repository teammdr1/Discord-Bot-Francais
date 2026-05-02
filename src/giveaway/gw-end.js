const { PermissionsBitField } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const gw = require('../../utils/giveawayManager');

function isManager(member, gcfg) {
    if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
    const mgr = gcfg.giveawayConfig?.managerRoles || [];
    return mgr.some(r => member.roles.cache.has(r));
}

module.exports = {
    name: 'gw-end',
    description: 'Termine un giveaway en cours immédiatement.',
    async execute(client, message, args) {
        const gcfg = guildConfig.getAll(message.guild.id);
        if (!isManager(message.member, gcfg)) {
            return message.reply('❌ Permission insuffisante.');
        }

        const msgId = args[0];
        if (!msgId) {
            const actives = gw.getActiveByGuild(message.guild.id);
            if (actives.length === 0) return message.reply('❌ Aucun giveaway actif sur ce serveur.');
            if (actives.length === 1) {
                await gw.endGiveaway(actives[0], client);
                return message.reply(`✅ Giveaway **${actives[0].prize}** terminé !`);
            }
            return message.reply(`❌ Plusieurs giveaways actifs. Spécifiez l'ID du message. Utilisez \`+gw-list\` pour voir les IDs.`);
        }

        const giveaway = gw.get(msgId);
        if (!giveaway) return message.reply('❌ Giveaway introuvable avec cet ID.');
        if (giveaway.guildId !== message.guild.id) return message.reply('❌ Ce giveaway n\'appartient pas à ce serveur.');
        if (giveaway.ended) return message.reply('❌ Ce giveaway est déjà terminé.');

        await gw.endGiveaway(giveaway, client);
        message.reply(`✅ Giveaway **${giveaway.prize}** terminé avec succès !`);
    }
};
