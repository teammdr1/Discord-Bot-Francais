module.exports = {
  name: 'kick',
  description: 'Expulse un membre du serveur',
  async execute(client, message, args) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.channel.send("❌ Tu n'as pas la permission d'expulser des membres.");
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.channel.send("❌ Utilisation : `+kick @membre [raison]`.");
    }

    if (target.id === message.author.id) {
      return message.channel.send("❌ Tu ne peux pas t'expulser toi-même.");
    }

    if (target.id === client.user.id) {
      return message.channel.send("❌ Je ne peux pas m'expulser moi-même.");
    }

    if (message.guild.ownerId !== message.author.id && target.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send("❌ Ce membre a un rôle égal ou supérieur au tien.");
    }

    if (!target.kickable) {
      return message.channel.send('❌ Je ne peux pas expulser ce membre. Vérifie mes permissions et mon rôle.');
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    try {
      await target.kick(reason);
      message.channel.send(`✅ ${target.user.tag} a été expulsé. Raison : ${reason}`);
    } catch (error) {
      console.error(error);
      message.channel.send("❌ Une erreur est survenue lors de l'expulsion du membre.");
    }
  },
};
