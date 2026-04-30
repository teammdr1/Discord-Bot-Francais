const { EmbedBuilder } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'whitelist',
  description: 'Affiche la whitelist anti-raid du serveur.',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }

    const guildId = message.guild.id;
    const cfg = guildConfig.getAll(guildId);
    const whitelist = cfg.antiraidWhitelist || { users: [], roles: [] };

    const users = whitelist.users.map(id => {
      const member = message.guild.members.cache.get(id);
      return member ? `${member.user.tag} (<@${id}>)` : `<@${id}>`;
    });
    const roles = whitelist.roles.map(id => {
      const role = message.guild.roles.cache.get(id);
      return role ? `${role.name} (<@&${id}>)` : `<@&${id}>`;
    });

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Whitelist Anti-Raid')
      .setColor('#32a852')
      .setDescription('Voici les utilisateurs et rôles autorisés à être exclus des sanctions anti-raid.')
      .addFields(
        { name: '👤 Utilisateurs', value: users.length ? users.join('\n') : 'Aucun utilisateur whitelisté.', inline: false },
        { name: '🛡️ Rôles', value: roles.length ? roles.join('\n') : 'Aucun rôle whitelisté.', inline: false }
      )
      .setFooter({ text: `Total whitelist : ${users.length + roles.length}` });

    return message.channel.send({ embeds: [embed] });
  }
};