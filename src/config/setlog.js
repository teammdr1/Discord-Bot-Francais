const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setlog',
  description: 'Définit le salon de logs (arrivées/départs)',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Veuillez mentionner un salon. Ex : `+setlog #logs`');
    }
    guildConfig.set(message.guild.id, 'logChannelId', channel.id);
    message.reply(`✅ Salon de logs défini sur ${channel}`);
  }
};
