const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unmuteall",
  description: "Unmute tous les membres actuellement mute",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply("Vous n'avez pas la permission de unmute des membres.");
    }

    const mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase().includes("mute"));
    if (!mutedRole) return message.reply("Aucun rôle mute trouvé sur le serveur.");

    const mutedMembers = mutedRole.members;
    if (!mutedMembers.size) return message.reply("Aucun membre n'est actuellement mute.");

    mutedMembers.forEach(member => {
      member.roles.remove(mutedRole).catch(() => {});
    });

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`Tous les membres mute ont été unmute ! (${mutedMembers.size} membres)`);
    message.channel.send({ embeds: [embed] });
  }
};
