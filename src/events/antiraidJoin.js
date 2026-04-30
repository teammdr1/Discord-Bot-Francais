const guildConfig = require('../utils/guildConfig');

// Suivi des joins par guild: guildId → { count }
const joinTracker = new Map();
const raidCooldowns = new Map();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const { guild } = member;
        const cfg = guildConfig.getAll(guild.id);
        if (!cfg.antiraidEnabled) return;

        const arCfg = cfg.antiraidConfig || {};
        const joinLimit = arCfg.joinLimit || 10;
        const joinInterval = arCfg.joinInterval || 10000;
        const raidRecoveryMinutes = arCfg.raidRecovery || 10;

        if (raidCooldowns.has(guild.id)) return;

        const guildId = guild.id;
        let data = joinTracker.get(guildId);

        if (!data) {
            data = { count: 1 };
            joinTracker.set(guildId, data);
            setTimeout(() => {
                const current = joinTracker.get(guildId);
                if (current && current.count < joinLimit) {
                    joinTracker.delete(guildId);
                }
            }, joinInterval);
        } else {
            data.count++;
        }

        if (data.count < joinLimit) return;

        joinTracker.delete(guildId);
        raidCooldowns.set(guild.id, true);
        const logChannel = cfg.logChannelId ? guild.channels.cache.get(cfg.logChannelId) : null;
        const previousVerification = guild.verificationLevel;

        // Action 1 : Passer le niveau de vérification en TRÈS ÉLEVÉ
        try {
            await guild.setVerificationLevel(4);
            if (logChannel) {
                logChannel.send(
                    `🚨 **Anti-Raid Join** | ${data.count} membres ont rejoint en moins de ${joinInterval / 1000}s !\n` +
                    `🔒 Niveau de vérification passé en **TRÈS ÉLEVÉ**.`
                ).catch(() => {});
            }
        } catch (err) {
            console.log(`Erreur anti-raid join (vérification): ${err.message}`);
        }

        // Action 2 : Supprimer les invitations si configuré
        if (arCfg.disableInvites) {
            try {
                const invites = await guild.invites.fetch();
                for (const invite of invites.values()) {
                    await invite.delete('Anti-Raid: Raid de joins détecté').catch(() => {});
                }
                if (logChannel) {
                    logChannel.send(`🚫 **Anti-Raid Join** | Toutes les invitations ont été supprimées.`).catch(() => {});
                }
            } catch (err) {
                console.log(`Erreur anti-raid join (invitations): ${err.message}`);
            }
        }

        // Action 3 : Restreindre les permissions @everyone (envoyer des messages)
        try {
            const everyone = guild.roles.everyone;
            const channels = guild.channels.cache.filter(c => c.type === 0);
            for (const channel of channels.values()) {
                await channel.permissionOverwrites.edit(everyone, {
                    SendMessages: false
                }).catch(() => {});
            }
            if (logChannel) {
                logChannel.send(`🔒 **Anti-Raid Join** | Envoi de messages désactivé pour @everyone.\nUtilisez \`+setantiraid unlock\` pour rétablir les permissions.`).catch(() => {});
            }
        } catch (err) {
            console.log(`Erreur anti-raid join (permissions): ${err.message}`);
        }

        // Restauration automatique du niveau de vérification
        setTimeout(async () => {
            raidCooldowns.delete(guild.id);
            try {
                await guild.setVerificationLevel(previousVerification);
                if (logChannel) {
                    logChannel.send(`✅ **Anti-Raid Join** | Niveau de vérification restauré après ${raidRecoveryMinutes} minutes.`).catch(() => {});
                }
            } catch (err) {
                console.log(`Erreur anti-raid join (restauration): ${err.message}`);
            }
        }, raidRecoveryMinutes * 60 * 1000);
    }
};
