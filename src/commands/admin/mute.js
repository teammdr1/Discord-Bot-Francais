const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'mute',
  description: 'Mute un membre du serveur',
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.channel.send("❌ Tu n'as pas la permission de mute des membres.");
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.channel.send('❌ Utilisation : `+mute @membre <durée> [raison]`.');
    }

    if (target.id === message.author.id) {
      return message.channel.send("❌ Tu ne peux pas te mute toi-même.");
    }

    if (target.id === client.user.id) {
      return message.channel.send("❌ Je ne peux pas me mute moi-même.");
    }

    if (message.guild.ownerId !== message.author.id && target.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send("❌ Ce membre a un rôle égal ou supérieur au tien.");
    }

    if (!target.moderatable) {
      return message.channel.send("❌ Je ne peux pas mute ce membre. Vérifie mes permissions et mon rôle.");
    }

    const durationArg = args[1];
    if (!durationArg) {
      return message.channel.send('❌ Veuillez indiquer une durée (ex: 10m, 1h, 30s).');
    }

    const time = parseTime(durationArg);
    if (!time) {
      return message.channel.send('❌ Durée invalide. Exemple : 10m, 1h, 30s.');
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

    try {
      await target.timeout(time, reason);
      message.channel.send(`✅ ${target.user.tag} a été muté pendant ${durationArg}. Raison : ${reason}`);
    } catch (error) {
      console.error(error);
      message.channel.send('❌ Une erreur est survenue lors du mute du membre.');
    }
  },
};

function parseTime(time) {
  const unit = time.slice(-1).toLowerCase();
  const number = parseInt(time.slice(0, -1), 10);
  if (isNaN(number) || number <= 0) return null;

  if (unit === 's') return number * 1000;
  if (unit === 'm') return number * 60 * 1000;
  if (unit === 'h') return number * 60 * 60 * 1000;
  if (unit === 'd') return number * 24 * 60 * 60 * 1000;

  return null;
}
