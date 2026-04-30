module.exports = {
    name: 'ban',
    description: 'Bannir un membre du serveur',
    async execute(client, message, args) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply("❌ Tu n'as pas la permission de bannir.");
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            return message.reply("❌ Utilisation : `+ban @membre [raison]`.");
        }

        if (target.id === message.author.id) {
            return message.reply("❌ Tu ne peux pas te bannir toi-même.");
        }

        if (target.id === client.user.id) {
            return message.reply("❌ Je ne peux pas me bannir moi-même.");
        }

        if (message.guild.ownerId !== message.author.id && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply("❌ Ce membre a un rôle égal ou supérieur au tien.");
        }

        if (!target.bannable) {
            return message.reply("❌ Je ne peux pas bannir ce membre. Vérifie mes permissions et mon rôle.");
        }

        const reason = args.slice(1).join(' ') || `Banni par ${message.author.tag}`;

        try {
            await target.ban({ reason });
            message.channel.send(`✅ ${target.user.tag} a été banni. Raison : ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Impossible de bannir ce membre.');
        }
    }
};
