const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../../data/warnings.json');

module.exports = {
  name: 'warnlist',
  description: "Affiche les warnings d'un utilisateur",
  async execute(client, message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.channel.send('❌ Veuillez mentionner un membre.');

    if (!fs.existsSync(warningsFilePath)) {
      return message.channel.send('Aucun avertissement enregistré.');
    }

    const warnings = JSON.parse(fs.readFileSync(warningsFilePath, 'utf8'));
    const guildId = message.guild.id;
    const userWarnings = warnings[guildId]?.[member.id];

    if (!userWarnings || userWarnings.length === 0) {
      return message.channel.send(`${member.user.tag} n'a aucun avertissement sur ce serveur.`);
    }

    let msg = `Avertissements de **${member.user.tag}** (${userWarnings.length}) :\n\n`;
    userWarnings.forEach((warn, index) => {
      const date = new Date(warn.timestamp).toLocaleString('fr-FR');
      msg += `**${index + 1}.** ${warn.reason}\nModérateur : ${warn.moderator} | Date : ${date}\n\n`;
    });

    message.channel.send(msg);
  }
};
