// src/commands/addrole.js
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'addrole',
  description: 'Ajoute un rôle à un membre mentionné',
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("🚫 Vous n'avez pas la permission de gérer les rôles.");
    }
    const member = message.mentions.members.first();
    const role = message.mentions.roles.first();
    if (!member) {
      return message.reply("❌ Vous devez mentionner un membre valide.");
    }
    if (!role) {
      return message.reply("❌ Vous devez mentionner un rôle valide.");
    }
    if (member.roles.cache.has(role.id)) {
      return message.reply(`⚠ Le membre **${member.user.tag}** possède déjà le rôle **${role.name}**.`);
    }
    if (message.member.roles.highest.comparePositionTo(role) <= 0) {
      return message.reply("❌ Vous ne pouvez pas attribuer ce rôle car il est supérieur ou égal à votre rôle.");
    }
    if (message.guild.me.roles.highest.comparePositionTo(role) <= 0) {
      return message.reply("❌ Je ne peux pas attribuer ce rôle car il est supérieur ou égal à mon rôle.");
    }
    try {
      await member.roles.add(role);
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle("✅ Rôle attribué avec succès !")
        .setDescription(`Le rôle **${role.name}** a été ajouté à **${member.user.tag}**`)
        .setFooter({ text: "Gestion des rôles", iconURL: message.guild.iconURL({ dynamic: true }) });
      message.channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    } catch (error) {
      console.error("❌ Erreur lors de l'attribution du rôle :", error);
      message.reply("⚠ Une erreur s'est produite lors de l'attribution du rôle. Vérifiez mes permissions ou contactez un administrateur.");
    }
  },
};
