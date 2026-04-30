const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setwelcome',
  description: 'Définit le salon de bienvenue',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('❌ Veuillez mentionner un salon. Ex : `+setwelcome #bienvenue`');
    }
    guildConfig.set(message.guild.id, 'welcomeChannelId', channel.id);
    message.reply(`✅ Salon de bienvenue défini sur ${channel}`);
  }
};
