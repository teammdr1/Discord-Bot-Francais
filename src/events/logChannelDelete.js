const {
    AuditLogEvent,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require('discord.js');
const { sendLog } = require('../utils/logHelper');

const typeNames = { 0: 'Textuel', 2: 'Vocal', 4: 'Catégorie', 5: 'Annonce', 13: 'Stage', 15: 'Forum' };

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!channel.guild) return;
        let executor = null;
        try {
            await new Promise(r => setTimeout(r, 600));
            const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
            const entry = logs.entries.first();
            if (entry && Date.now() - entry.createdTimestamp < 5000) executor = entry.executor;
        } catch {}

        const container = new ContainerBuilder().setAccentColor(0xED4245);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## 📋 Salon Supprimé')
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**📌 Salon :** \`${channel.name}\`\n` +
                `**📂 Type :** ${typeNames[channel.type] || 'Inconnu'}\n` +
                `**🛠️ Par :** ${executor ? executor.tag : 'Inconnu'}\n` +
                `**🆔 ID :** \`${channel.id}\``
            )
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`)
        );

        await sendLog(channel.guild, 'channels', container);
    }
};
