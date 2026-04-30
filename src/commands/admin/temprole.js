const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "temprole",
  description: "Ajoute un rôle temporaire à un ou plusieurs membres",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("Vous n'avez pas la permission de gérer les rôles.");
    }

    const members = message.mentions.members;
    if (!members.size) return message.reply("Mentionnez au moins un membre.");

    const role = message.mentions.roles.first();
    if (!role) return message.reply("Mentionnez un rôle à ajouter.");

    const duration = args[args.indexOf(role.id) + 1];
    if (!duration) return message.reply("Spécifiez une durée en minutes.");

    const ms = parseInt(duration) * 60 * 1000;
    if (isNaN(ms)) return message.reply("Durée invalide.");

    members.forEach(member => {
      member.roles.add(role).catch(() => {});
      setTimeout(() => member.roles.remove(role).catch(() => {}), ms);
    });

    message.reply(`Le rôle ${role.name} a été ajouté temporairement à ${members.size} membre(s) pour ${duration} minutes.`);
  }
};
