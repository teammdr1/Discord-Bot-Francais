const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (!message.guild || message.author?.bot) return;
        if (!message.content && message.attachments.size === 0) return;

        let executor = null;
        try {
            await new Promise(r => setTimeout(r, 600));
            const logs = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
            const entry = logs.entries.first();
            if (entry && entry.target?.id === message.author?.id && Date.now() - entry.createdTimestamp < 5000)
                executor = entry.executor;
        } catch {}

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Message Supprimé')
            .setColor('#ED4245')
            .setThumbnail(message.author?.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Auteur', value: message.author ? `${message.author.tag} \`${message.author.id}\`` : 'Inconnu', inline: true },
                { name: '📌 Salon', value: `${message.channel}`, inline: true },
                { name: '🛠️ Supprimé par', value: executor ? `${executor.tag}` : 'L\'auteur lui-même', inline: true }
            )
            .setTimestamp();

        if (message.content) {
            embed.addFields({ name: '📝 Contenu', value: message.content.slice(0, 1000) || '*Vide*', inline: false });
        }
        if (message.attachments.size > 0) {
            embed.addFields({ name: '📎 Fichiers', value: message.attachments.map(a => a.url).join('\n').slice(0, 500), inline: false });
        }

        await sendLog(message.guild, 'messages', embed);
    }
};
