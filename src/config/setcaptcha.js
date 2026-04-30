const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setcaptcha',
  description: 'Active ou désactive le captcha pour les nouveaux membres',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }
    const action = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(action)) {
      return message.reply('❌ Utilisez `+setcaptcha on` ou `+setcaptcha off`');
    }
    const enabled = action === 'on';
    guildConfig.set(message.guild.id, 'captchaEnabled', enabled);
    message.reply(`✅ Captcha ${enabled ? 'activé' : 'désactivé'} sur ce serveur.`);
  }
};
