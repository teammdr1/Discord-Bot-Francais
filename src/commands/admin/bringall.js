const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'bringall',
    description: 'Déplace tous les membres en vocal vers ton salon',

    async execute(client, message, args) {

        if (!message.guild) return;

        // Vérifie permission
        if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
            return message.reply("❌ Tu n'as pas la permission de déplacer des membres.");
        }

        // Vérifie que l'utilisateur est en vocal
        const authorChannel = message.member.voice.channel;
        if (!authorChannel) {
            return message.reply("❌ Tu dois être dans un salon vocal.");
        }

        // Récupère tous les membres connectés en vocal
        const voiceChannels = message.guild.channels.cache.filter(c => c.isVoiceBased());

        let movedCount = 0;

        for (const channel of voiceChannels.values()) {
            for (const member of channel.members.values()) {

                // Ignore si déjà dans le même salon
                if (member.voice.channelId === authorChannel.id) continue;

                try {
                    await member.voice.setChannel(authorChannel);
                    movedCount++;
                } catch (err) {
                    // Ignore si impossible de déplacer (permissions, rôle plus haut, etc.)
                }
            }
        }

        message.channel.send(`✅ ${movedCount} membre(s) déplacé(s) vers **${authorChannel.name}**.`);
    }
};
