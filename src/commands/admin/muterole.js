const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'muterole',
    description: 'Définit le rôle de mute pour le serveur',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("🚫 Vous n'avez pas la permission de gérer les rôles.");
        }
        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply("Vous devez mentionner un rôle valide.");
        }
        guildConfig.set(message.guild.id, 'muteRoleId', role.id);

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle("Rôle de mute défini avec succès !")
            .setDescription(`Le rôle de mute a été défini sur **${role.name}**`);
        message.channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    },
};
