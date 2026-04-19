const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel, client) {
        if (!newChannel.guild) return;

        const changes = [];
        if (oldChannel.name !== newChannel.name)
            changes.push(`**Nom :** \`${oldChannel.name}\` → \`${newChannel.name}\``);
        if (oldChannel.topic !== newChannel.topic)
            changes.push(`**Sujet :** \`${oldChannel.topic || 'aucun'}\` → \`${newChannel.topic || 'aucun'}\``);
        if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser)
            changes.push(`**Slowmode :** \`${oldChannel.rateLimitPerUser}s\` → \`${newChannel.rateLimitPerUser}s\``);
        if (oldChannel.nsfw !== newChannel.nsfw)
            changes.push(`**NSFW :** \`${oldChannel.nsfw}\` → \`${newChannel.nsfw}\``);
        if (String(oldChannel.parentId) !== String(newChannel.parentId))
            changes.push(`**Catégorie :** déplacé`);

        if (changes.length === 0) return;

        let executor = null;
        try {
            await new Promise(r => setTimeout(r, 600));
            const logs = await newChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate, limit: 1 });
            const entry = logs.entries.first();
            if (entry && entry.target?.id === newChannel.id && Date.now() - entry.createdTimestamp < 5000)
                executor = entry.executor;
        } catch {}

        const embed = new EmbedBuilder()
            .setTitle('✏️ Salon Modifié')
            .setColor('#FEE75C')
            .addFields(
                { name: '📌 Salon', value: `${newChannel}`, inline: true },
                { name: '🛠️ Par', value: executor ? `${executor.tag}` : 'Inconnu', inline: true },
                { name: '📝 Modifications', value: changes.join('\n'), inline: false }
            )
            .setTimestamp();

        await sendLog(newChannel.guild, 'channels', embed);
    }
};
