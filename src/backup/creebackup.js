const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config.js');

module.exports = {
    name: 'creebackup',
    description: 'Crée une sauvegarde du serveur',
    async execute(client, message, args) {
        if (message.author.id !== config.ownerId) {
            return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
        }
        try {
            const backup = await client.api.guilds(message.guild.id).backups.post();
        const embed = new EmbedBuilder()
            .setTitle('Sauvegarde créée !')
            .setDescription(`ID de la sauvegarde : \`${backup.id}\``)
            .setColor('#00f000')
            .setFooter({ text: config.footer })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
        catch (err) {
            console.error(err);
            return message.reply("Erreur lors de la création de la sauvegarde.");
        }
}
};