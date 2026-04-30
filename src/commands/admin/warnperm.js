const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'warnperm',
  description: 'Ajoute ou retire un rôle autorisé à utiliser la commande warn',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const role = message.mentions.roles.first();
    if (!role) return message.reply('❌ Vous devez mentionner un rôle.');

    const warnRoles = guildConfig.get(message.guild.id, 'warnRoles') || [];

    if (warnRoles.includes(role.id)) {
      const updated = warnRoles.filter(id => id !== role.id);
      guildConfig.set(message.guild.id, 'warnRoles', updated);
      message.reply(`✅ Le rôle ${role.name} ne peut plus utiliser la commande warn.`);
    } else {
      warnRoles.push(role.id);
      guildConfig.set(message.guild.id, 'warnRoles', warnRoles);
      message.reply(`✅ Le rôle ${role.name} peut maintenant utiliser la commande warn.`);
    }
  },
};
