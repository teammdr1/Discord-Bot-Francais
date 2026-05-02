const {
    AuditLogEvent,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require('discord.js');
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

        const container = new ContainerBuilder().setAccentColor(0xFEE75C);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## ✏️ Salon Modifié')
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**📌 Salon :** ${newChannel}\n` +
                `**🛠️ Par :** ${executor ? executor.tag : 'Inconnu'}\n\n` +
                `**📝 Modifications**\n${changes.join('\n')}`
            )
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`)
        );

        await sendLog(newChannel.guild, 'channels', container);
    }
};
