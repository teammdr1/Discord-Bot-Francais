const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        if (newMember.user?.bot) return;
        const guild = newMember.guild;

        // ── Boost ──
        const wasBosting = !!oldMember.premiumSince;
        const isBoosting = !!newMember.premiumSince;
        if (!wasBosting && isBoosting) {
            const embed = new EmbedBuilder()
                .setTitle('🚀 Nouveau Boost !')
                .setDescription(`${newMember} a commencé à **booster** le serveur ! 🎉`)
                .setColor('#FF73FA')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .addFields({ name: '🚀 Boosts total', value: `${guild.premiumSubscriptionCount || 0}`, inline: true })
                .setTimestamp();
            await sendLog(guild, 'boost', embed);
        } else if (wasBosting && !isBoosting) {
            const embed = new EmbedBuilder()
                .setTitle('💔 Fin de Boost')
                .setDescription(`${newMember} a **arrêté de booster** le serveur.`)
                .setColor('#808080')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            await sendLog(guild, 'boost', embed);
        }

        // ── Rôles ──
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        const added = newRoles.filter(r => !oldRoles.has(r.id));
        const removed = oldRoles.filter(r => !newRoles.has(r.id));

        if (added.size === 0 && removed.size === 0) return;

        // Fetch audit log pour connaître l'auteur
        let executor = null;
        try {
            await new Promise(r => setTimeout(r, 600));
            const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate, limit: 1 });
            const entry = logs.entries.first();
            if (entry && entry.target?.id === newMember.id && Date.now() - entry.createdTimestamp < 5000) {
                executor = entry.executor;
            }
        } catch {}

        if (added.size > 0) {
            const embed = new EmbedBuilder()
                .setTitle('🎖️ Rôle(s) Ajouté(s)')
                .setColor('#57F287')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Membre', value: `${newMember.user.tag} \`${newMember.id}\``, inline: true },
                    { name: '➕ Rôle(s) ajouté(s)', value: added.map(r => `<@&${r.id}>`).join(', '), inline: true },
                    { name: '🛠️ Par', value: executor ? `${executor.tag}` : 'Inconnu', inline: true }
                )
                .setTimestamp();
            await sendLog(guild, 'roles', embed);
        }

        if (removed.size > 0) {
            const embed = new EmbedBuilder()
                .setTitle('🎖️ Rôle(s) Retiré(s)')
                .setColor('#ED4245')
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Membre', value: `${newMember.user.tag} \`${newMember.id}\``, inline: true },
                    { name: '➖ Rôle(s) retiré(s)', value: removed.map(r => `<@&${r.id}>`).join(', '), inline: true },
                    { name: '🛠️ Par', value: executor ? `${executor.tag}` : 'Inconnu', inline: true }
                )
                .setTimestamp();
            await sendLog(guild, 'roles', embed);
        }
    }
};
