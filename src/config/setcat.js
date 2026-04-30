const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "setcat",
  async execute(message, args) {

    if (!message.guild || !message.member) {
      return message.reply("Commande utilisable uniquement sur un serveur.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Tu n'as pas la permission de gérer les salons.");
    }

    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.channel;

    const categoryId = message.mentions.channels.first() ? args[1] : args[0];
    const category = message.guild.channels.cache.get(categoryId);

    if (!category || category.type !== 4) {
      return message.reply("Catégorie invalide.");
    }

    await channel.setParent(category.id);
    return message.reply(`Salon déplacé dans **${category.name}**.`);
  },
};
