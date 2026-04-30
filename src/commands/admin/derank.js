const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "derank",
  description: "Retire un rôle à un ou plusieurs membres",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("Vous n'avez pas la permission de gérer les rôles.");
    }

    const role = message.mentions.roles.first();
    if (!role) return message.reply("Veuillez mentionner un rôle à retirer.");

    const members = message.mentions.members;
    if (!members.size) return message.reply("Veuillez mentionner au moins un membre.");

    let count = 0;
    members.forEach(member => {
      if (member.roles.highest.position >= message.member.roles.highest.position) return;
      member.roles.remove(role).catch(() => {});
      count++;
    });

    message.reply(`Le rôle ${role.name} a été retiré à ${count} membres.`);
  }
};
