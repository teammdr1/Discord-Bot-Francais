const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setprefix',
  description: 'Change le préfixe du bot pour ce serveur',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }
    const newPrefix = args[0];
    if (!newPrefix || newPrefix.length > 5) {
      return message.reply('❌ Veuillez fournir un préfixe valide (1 à 5 caractères).');
    }
    guildConfig.set(message.guild.id, 'prefix', newPrefix);
    message.reply(`✅ Préfixe changé en \`${newPrefix}\``);
  }
};
