const { PermissionsBitField } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const gw = require('../../utils/giveawayManager');

module.exports = {
    name: 'gw-delete',
    description: 'Supprime définitivement un giveaway (et son message).',
    async execute(client, message, args) {
        const gcfg = guildConfig.getAll(message.guild.id);
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ Permission **Gérer le serveur** requise.');
        }

        const msgId = args[0];
        if (!msgId) return message.reply(`❌ Fournissez l'ID du message. Ex : \`+gw-delete <messageId>\``);

        const giveaway = gw.get(msgId);
        if (!giveaway) return message.reply('❌ Giveaway introuvable.');
        if (giveaway.guildId !== message.guild.id) return message.reply('❌ Ce giveaway n\'appartient pas à ce serveur.');

        const channel = message.guild.channels.cache.get(giveaway.channelId);
        if (channel) {
            const msg = await channel.messages.fetch(giveaway.messageId).catch(() => null);
            if (msg) await msg.delete().catch(() => {});
        }

        gw.remove(msgId);
        message.reply(`✅ Giveaway **${giveaway.prize}** supprimé.`);
    }
};
