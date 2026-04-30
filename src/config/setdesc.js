const { PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  name: "setcat",

  async execute(client, message, args) {
    if (!message.guild) return;

    if (!message.member) {
      return message.reply("Commande utilisable uniquement sur un serveur.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Permission requise : Gérer les salons.");
    }

    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.channel;

    const categoryId = message.mentions.channels.first() ? args[1] : args[0];
    const category = message.guild.channels.cache.get(categoryId);

    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply("ID de catégorie invalide.");
    }

    try {
      await channel.setParent(category.id);
      return message.reply(`Salon déplacé dans **${category.name}**.`);
    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors du déplacement du salon.");
    }
  },
};
