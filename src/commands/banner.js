const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'banner',
    description: 'Affiche la bannière d\'un membre ou du serveur',
    async execute(client, message, args) {
        if (!message.guild) return;
        if (args[0] && args[0].toLowerCase() === "server") {
            await message.guild.fetch();
            const bannerURL = message.guild.bannerURL({ size: 4096, dynamic: true });
            if (!bannerURL) {
                return message.reply("❌ Ce serveur n'a pas de bannière.");
            }
            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Bannière du serveur`)
                .setImage(bannerURL)
                .setColor('#5865F2');
            return message.channel.send({ embeds: [embed] });
        }
        let target = message.mentions.users.first() || message.author;
        try {
            const user = await message.client.users.fetch(target.id, { force: true });
            const bannerURL = user.bannerURL({ size: 4096, dynamic: true });
            if (!bannerURL) {
                return message.reply("❌ Cet utilisateur n'a pas de bannière.");
            }
            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Bannière de ${user.tag}`)
                .setImage(bannerURL)
                .setColor('#5865F2');
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply("Impossible de récupérer la bannière.");
        }
    }
};
