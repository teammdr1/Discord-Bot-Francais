const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'allbots',
    description: 'Affiche la liste des bots du serveur',
    async execute(client, message, args) {
        if (!message.guild) return;
        await message.guild.members.fetch();
        const bots = message.guild.members.cache.filter(member => member.user.bot);
        if (bots.size === 0) {
            return message.reply("Aucun bot trouvé sur ce serveur.");
        }
        const botList = bots
            .map(member => `• ${member.user.tag}`)
            .join('\n');
        const embed = new EmbedBuilder()
            .setTitle('🤖 Liste des Bots')
            .setDescription(botList)
            .setColor('#5865F2')
            .setFooter({ text: `Total : ${bots.size} bot(s)` })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};
