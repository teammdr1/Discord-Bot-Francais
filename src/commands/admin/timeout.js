const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'timeout',
    description: 'Met un membre en timeout (mute temporaire)',

    async execute(client, message, args) {
        if (!message.guild) return;

        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Tu n'as pas la permission de mettre des membres en timeout.");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('❌ Utilisation : `+timeout @membre <minutes> [raison]`.');

        if (target.id === message.author.id) {
            return message.reply("❌ Tu ne peux pas te mettre en timeout toi-même.");
        }

        if (target.id === client.user.id) {
            return message.reply("❌ Je ne peux pas me mettre en timeout moi-même.");
        }

        if (message.guild.ownerId !== message.author.id && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply("❌ Ce membre a un rôle égal ou supérieur au tien.");
        }

        if (!target.moderatable) {
            return message.reply('❌ Je ne peux pas mettre ce membre en timeout (rôle trop haut ou permissions insuffisantes).');
        }

        const duration = args[1];
        if (!duration || isNaN(duration) || parseInt(duration, 10) <= 0) {
            return message.reply('❌ Indique une durée en minutes. Exemple : `+timeout @User 10`.');
        }

        const reason = args.slice(2).join(' ') || 'Aucune raison fournie';
        const durationMs = parseInt(duration, 10) * 60 * 1000;

        try {
            await target.timeout(durationMs, reason);
            message.channel.send(`✅ ${target.user.tag} est en timeout pendant ${duration} minute(s).`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Impossible de mettre ce membre en timeout.');
        }
    }
};
