module.exports = {
    name: 'ban',
    description: 'Bannir un membre du serveur',
    async execute(client, message, args) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply("❌ Tu n'as pas la permission de bannir.");
        }
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("Utilisation : `+ban @membre`");
        }
        try {
            await member.ban({ reason: "Banni par " + message.author.tag });
            message.channel.send(`✅ ${member.user.tag} a été banni pour la raison suivante : ${message.author.tag}.`);
        } catch (error) {
            message.reply("❌ Impossible de bannir ce membre.");
        }
    }
};
