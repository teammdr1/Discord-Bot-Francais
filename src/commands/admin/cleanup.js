const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "cleanup",
  description: "Déconnecte tous les membres d'un salon vocal spécifique",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
      return message.reply("Vous n'avez pas la permission de déplacer les membres.");
    }

    const channel = message.mentions.channels.first();
    if (!channel || channel.type !== 2) {
      return message.reply("Veuillez mentionner un salon vocal valide.");
    }

    let count = 0;
    channel.members.forEach(member => {
      member.voice.disconnect().catch(() => {});
      count++;
    });

    message.reply(`${count} membres ont été déconnectés de ${channel.name}.`);
  }
};
