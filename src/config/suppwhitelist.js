const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'suppwhitelist',
  description: 'Retire un membre ou un rôle de la whitelist anti-raid.',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const arg = args[0];
    if (!arg) {
      return message.reply('❌ Utilisation : `+suppwhitelist @user|@role`.');
    }

    const id = arg.replace(/[<@!&>]/g, '');
    const member = message.guild.members.cache.get(id);
    const role = message.guild.roles.cache.get(id);

    if (!member && !role) {
      return message.reply('❌ Mentionne un membre ou un rôle valide.');
    }

    const guildId = message.guild.id;
    const cfg = guildConfig.getAll(guildId);
    const whitelist = cfg.antiraidWhitelist || { users: [], roles: [] };

    if (member) {
      if (!whitelist.users.includes(member.id)) {
        return message.reply('❌ Ce membre n’est pas dans la whitelist.');
      }
      const newUsers = whitelist.users.filter(id => id !== member.id);
      guildConfig.setNested(guildId, 'antiraidWhitelist', 'users', newUsers);
      return message.reply(`✅ ${member.user.tag} a été retiré de la whitelist anti-raid.`);
    }

    if (role) {
      if (!whitelist.roles.includes(role.id)) {
        return message.reply('❌ Ce rôle n’est pas dans la whitelist.');
      }
      const newRoles = whitelist.roles.filter(id => id !== role.id);
      guildConfig.setNested(guildId, 'antiraidWhitelist', 'roles', newRoles);
      return message.reply(`✅ Le rôle ${role.name} a été retiré de la whitelist anti-raid.`);
    }
  }
};