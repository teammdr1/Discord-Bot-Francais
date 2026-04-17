const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bugreport',
    description: 'Signale un bug au bot owner',
    
    async execute(client, message, args) {
        if (!args.length) return message.reply("❌ Utilisation : +bugreport <message>");
        
        const report = args.join(" ");
        const ownerId = '1200909869872586752'; // remplace par ton ID Discord

        try {
            const user = await message.client.users.fetch(ownerId);
            const embed = new EmbedBuilder()
                .setTitle(`🐛 Nouveau bug report`)
                .addFields(
                    { name: 'De', value: `${message.author.tag} (${message.author.id})` },
                    { name: 'Message', value: report }
                )
                .setColor('#FF0000')
                .setTimestamp();

            await user.send({ embeds: [embed] });
            message.reply("✅ Bug report envoyé !");
        } catch (err) {
            message.reply("❌ Impossible d’envoyer le bug report.");
        }
    }
};
