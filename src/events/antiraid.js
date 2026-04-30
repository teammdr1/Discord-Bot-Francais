const guildConfig = require('../utils/guildConfig');

// Suivi du spam par message: guildId:userId → { count, resetTimer }
const spamTracker = new Map();
// Suivi des violations: guildId:userId → { count }
const violations = new Map();

function isWhitelisted(member, cfg) {
    const whitelist = cfg.antiraidWhitelist || { users: [], roles: [] };
    if (whitelist.users.includes(member.id)) return true;
    if (member.roles.cache.some(role => whitelist.roles.includes(role.id))) return true;
    if (member.permissions.has('Administrator')) return true;
    return false;
}

async function sanctionMember(message, violationCount, cfg, arCfg) {
    const { guild, member, author, channel } = message;
    const logChannel = cfg.logChannelId ? guild.channels.cache.get(cfg.logChannelId) : null;

    if (!member.moderatable) {
        channel.send(`⚠️ Impossible de sanctionner ${author} (permissions insuffisantes).`).catch(() => {});
        return;
    }

    if (violationCount === 1) {
        // Pallier 1 : Mute
        const muteDuration = (arCfg.muteDuration || 5) * 60 * 1000;
        await member.timeout(muteDuration, 'Anti-Raid: Spam');
        channel.send(`🔇 ${author} a été muté **${arCfg.muteDuration || 5} min** pour spam (pallier 1).`).catch(() => {});
        if (logChannel) logChannel.send(`🔇 **Anti-Raid** | Mute | ${author.tag} | Violation n°${violationCount}`).catch(() => {});

    } else if (violationCount === 2) {
        // Pallier 2 : Kick
        await member.timeout(null).catch(() => {});
        await member.kick('Anti-Raid: Spam répété (pallier 2)');
        channel.send(`👢 ${author} a été **expulsé** pour spam répété (pallier 2).`).catch(() => {});
        if (logChannel) logChannel.send(`👢 **Anti-Raid** | Kick | ${author.tag} | Violation n°${violationCount}`).catch(() => {});

    } else {
        // Pallier 3+ : Ban
        await guild.members.ban(author.id, { reason: 'Anti-Raid: Spam persistant (pallier 3)', deleteMessageSeconds: 60 });
        channel.send(`🔨 ${author} a été **banni** pour spam persistant (pallier 3).`).catch(() => {});
        if (logChannel) logChannel.send(`🔨 **Anti-Raid** | Ban | ${author.tag} | Violation n°${violationCount}`).catch(() => {});
    }
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.member || !message.guild) return;

        const cfg = guildConfig.getAll(message.guild.id);
        if (!cfg.antiraidEnabled) return;
        if (isWhitelisted(message.member, cfg)) return;

        const arCfg = cfg.antiraidConfig || {};
        const spamLimit = arCfg.spamLimit || 5;
        const spamInterval = arCfg.spamInterval || 2000;

        const key = `${message.guild.id}:${message.author.id}`;

        // Suivi des messages dans la fenêtre de temps
        let userData = spamTracker.get(key);
        if (!userData) {
            userData = { count: 1 };
            spamTracker.set(key, userData);
            setTimeout(() => spamTracker.delete(key), spamInterval);
            return;
        }

        userData.count++;
        if (userData.count <= spamLimit) return;

        // Seuil de spam atteint → comptabiliser la violation
        spamTracker.delete(key);

        let userViolations = violations.get(key) || { count: 0 };
        userViolations.count++;
        violations.set(key, userViolations);

        // Réinitialise les violations après 1 heure
        setTimeout(() => violations.delete(key), 60 * 60 * 1000);

        try {
            await sanctionMember(message, userViolations.count, cfg, arCfg);
        } catch (err) {
            console.log(`Erreur anti-raid: ${err.message}`);
        }
    }
};
