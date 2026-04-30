const guildConfig = require('../../utils/guildConfig');

module.exports = {
  name: 'setsoutien',
  description: 'Configure le rôle et le statut de soutien',
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
    }
    const role = message.mentions.roles.first();
    const statut = args.slice(1).join(' ');
    if (!role) {
      return message.reply('❌ Mentionnez un rôle. Ex : `+setsoutien @Soutien mon-statut`');
    }
    if (!statut) {
      return message.reply('❌ Fournissez le texte de statut à détecter. Ex : `+setsoutien @Soutien /monserveur`');
    }
    guildConfig.setMany(message.guild.id, { soutienRoleId: role.id, soutienStatut: statut });
    message.reply(`✅ Rôle soutien : ${role} | Statut détecté : \`${statut}\``);
  }
};
