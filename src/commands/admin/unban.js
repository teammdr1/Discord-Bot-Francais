// src/commands/unban.js
module.exports = {
  name: 'unban',
  description: 'Débannit un membre du serveur',
  async execute(client, message, args) {
  const authorizedRoleIDs = [
      "1209279725944709141",
      "1205816038403346493",
        "1224344265606430720",
        "1205815414228131841",
        "1246765271197286430"
    ];
    const memberRoles = message.member.roles.cache.map(role => role.id);
    // Vérifie si l'utilisateur est autorisé à utiliser la commande
    const isAuthorized = memberRoles.some(roleID => authorizedRoleIDs.includes(roleID));    
    if (!isAuthorized) {
      return message.reply("Vous n'avez pas les permissions nécessaires.");
    }
    const userId = args[0];
    if (!userId) {
      return message.reply("Vous devez fournir l'ID de l'utilisateur à débannir.");
    }
    try {
      const banList = await message.guild.bans.fetch();
      const bannedUser = banList.get(userId);
        if (!bannedUser) {
        return message.reply("Cet utilisateur n'est pas banni.");
      }
      await message.guild.bans.remove(userId);
      return message.reply(`L'utilisateur avec l'ID ${userId} a été débanni avec succès.`);
    } catch (error) {
      console.error("Erreur lors du débannissement de l'utilisateur :", error);
      return message.reply("Une erreur est survenue lors du débannissement de l'utilisateur.");
    }
    },
};
    
