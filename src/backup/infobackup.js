const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config.js');

module.exports = {
    name: 'infobackup',
    description: 'Afficher les informations d une sauvegarde',
    async execute(client, message, args) {
        if (message.author.id !== config.ownerId) {
            return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
        }
        try {
            const backupId = args[0];
            if (!backupId) {
                return message.reply('Donne l\'ID de la sauvegarde à afficher.')
            }
            const backupData = await client.api.guilds(message.guild.id).backups(backupId).get();
            const embed = new EmbedBuilder()
                .setTitle('Informations sur la sauvegarde')
                .setDescription(`Voici les informations sur la sauvegarde avec l'ID \`${backupId}\`:`)
                .setColor('#00ff00');
            message.channel.send({ embeds: [embed] });
        }
        catch (err) {
            console.error(err);
            return message.reply("Erreur lors de la récupération des informations de la sauvegarde. Vérifie que l'ID est correct.");
        }
    }
};