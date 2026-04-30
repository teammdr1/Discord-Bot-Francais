const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Supprime un nombre de messages dans le salon',

    async execute(client, message, args) {

        if (!message.guild) return;
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Tu n'as pas la permission de supprimer des messages.");
        }
        if (!args[0]) {
            return message.reply("Utilisation : `+clear <nombre | all>`");
        }
        let amount;
        if (args[0].toLowerCase() === "all") {
            amount = 100;
        } else {
            amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                return message.reply("❌ Le nombre doit être entre 1 et 100.");
            }
        }
        try {
            await message.delete().catch(() => {});
            const deleted = await message.channel.bulkDelete(amount, true);
            const msg = await message.channel.send(
                `🧹 **${deleted.size} message(s) supprimé(s)**`
            );
            setTimeout(() => msg.delete().catch(() => {}), 4000);
        } catch (error) {
            message.channel.send("❌ Impossible de supprimer les messages (messages trop anciens ?).");
        }
    }
};
