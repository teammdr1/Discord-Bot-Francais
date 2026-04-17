const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban-alt',
    description: 'Ban un compte suspect (compte récent)',

    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply("❌ Tu n'as pas la permission de bannir.");
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("Utilisation : `+ban-alt @membre`");
        }

        // Nombre de jours max pour considérer comme alt
        const maxDays = 7;

        const accountAge = (Date.now() - member.user.createdAt) / (1000 * 60 * 60 * 24);

        if (accountAge > maxDays) {
            return message.reply("⚠️ Ce compte n'est pas considéré comme récent.");
        }

        try {
            await member.ban({ reason: "Compte suspect (alt récent)" });
            message.channel.send(`✅ ${member.user.tag} a été banni (compte récent : ${Math.floor(accountAge)} jour(s)).`);
        } catch (error) {
            message.reply("❌ Impossible de bannir ce membre.");
        }
    }
};
