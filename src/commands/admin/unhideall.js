const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unhideall",
  description: "Rend visibles tous les salons du serveur",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Vous n'avez pas la permission de gérer les salons.");
    }

    let count = 0;
    message.guild.channels.cache.forEach(ch => {
      if (ch.permissionsFor(message.guild.roles.everyone).has("ViewChannel") === false) {
        ch.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: true }).catch(() => {});
        count++;
      }
    });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`Tous les salons sont maintenant visibles ! (${count} salons modifiés)`);
    message.channel.send({ embeds: [embed] });
  }
};
