const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'addwhitelist',
  description: 'Ajoute un membre ou un rôle à la whitelist anti-raid.',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const arg = args[0];
    if (!arg) {
      return message.reply('❌ Utilisation : `+addwhitelist @user|@role`.');
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
      if (whitelist.users.includes(member.id)) {
        return message.reply('❌ Ce membre est déjà dans la whitelist.');
      }
      whitelist.users.push(member.id);
      guildConfig.setNested(guildId, 'antiraidWhitelist', 'users', whitelist.users);
      return message.reply(`✅ ${member.user.tag} a été ajouté à la whitelist anti-raid.`);
    }

    if (role) {
      if (whitelist.roles.includes(role.id)) {
        return message.reply('❌ Ce rôle est déjà dans la whitelist.');
      }
      whitelist.roles.push(role.id);
      guildConfig.setNested(guildId, 'antiraidWhitelist', 'roles', whitelist.roles);
      return message.reply(`✅ Le rôle ${role.name} a été ajouté à la whitelist anti-raid.`);
    }
  }
};