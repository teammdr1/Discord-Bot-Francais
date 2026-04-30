const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "cleanupall",
  description: "Déconnecte tous les membres de tous les salons vocaux",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
      return message.reply("Vous n'avez pas la permission de déplacer les membres.");
    }

    const guild = message.guild;
    let count = 0;

    guild.channels.cache.filter(c => c.type === 2 /* GuildVoice */).forEach(vc => {
      vc.members.forEach(member => {
        member.voice.disconnect().catch(() => {});
        count++;
      });
    });

    message.reply(`Tous les membres ont été déconnectés des salons vocaux (${count} membres).`);
  }
};
