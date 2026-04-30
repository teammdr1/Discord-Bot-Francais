// src/commands/removerole.js
module.exports = {
  name: 'removerole',
  description: 'Retire un rôle à un membre du serveur',
  async execute(client, message, args) {
    // Vérifie si l'utilisateur a la permission de gérer les rôles
    if (!message.member.permission.has('MANAGE_ROLES')) {
      return message.channel.send("Vous n'avez pas la permission de gérer les rôles.");
    }
    // Vérifie si un membre a été mentionné
    const member = message.mentions.members.first();
    if (!member) {
      return message.channel.send("Veuillez mentionner un membre à qui retirer un rôle.");
    }  // Vérifie si un rôle a été mentionné
    const role = message.mentions.roles.first();
    if (!role) {
      return message.channel.send("Veuillez mentionner un rôle à retirer.");
    }
    // Vérifie si le membre a le rôle
    if (!member.roles.cache.has(role.id)) {
      return message.channel.send("Ce membre n'a pas ce rôle.");
    }
    // Retire le rôle au membre
    try {
      await member.roles.remove(role);
        message.channel.send(`Le rôle ${role.name} a été retiré à ${member.user.tag}.`);
    } catch (error) {
      console.error(error);
      message.channel.send("Une erreur est survenue lors du retrait du rôle.");
    }
}
};
