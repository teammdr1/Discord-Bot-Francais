const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unlockall",
  description: "Débloque tous les salons textuels du serveur",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Vous n'avez pas la permission de gérer les salons.");
    }

    let count = 0;
    message.guild.channels.cache.forEach(ch => {
      if (ch.type === 0) { // Textuel
        ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true }).catch(() => {});
        count++;
      }
    });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`Tous les salons textuels sont maintenant déverrouillés ! (${count} salons)`);
    message.channel.send({ embeds: [embed] });
  }
};
