const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setwelcomeping',
  description: 'Définit le rôle à ping dans le message de bienvenue',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur.');
    }

    const role = message.mentions.roles.first();

    if (!role) {
      return message.reply('❌ Mentionne un rôle. Exemple : `+setwelcomeping @notif`');
    }

    guildConfig.set(message.guild.id, 'welcomePingRoleId', role.id);

    message.reply(`✅ Rôle de ping défini sur ${role}`);
  }
};
