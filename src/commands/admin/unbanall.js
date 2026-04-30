const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unbanall",
  description: "Débannit tous les membres bannis du serveur",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("Vous n'avez pas la permission de débannir des membres.");
    }

    const bans = await message.guild.bans.fetch();
    if (!bans.size) return message.reply("Aucun membre n'est actuellement banni.");

    bans.forEach(ban => {
      message.guild.members.unban(ban.user.id).catch(() => {});
    });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`Tous les membres bannis ont été débannis ! (${bans.size} personnes)`);
    message.channel.send({ embeds: [embed] });
  }
};
