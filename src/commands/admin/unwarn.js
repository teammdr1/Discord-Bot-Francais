const fs = require('fs');
const path = require('path');

const warningsFilePath = path.join(__dirname, '../../data/warnings.json');

module.exports = {
  name: 'unwarn',
  description: "Retire le dernier avertissement d'un membre",
  async execute(client, message, args) {
    if (!message.member.permissions.has('Administrator') &&
        !message.member.permissions.has('ModerateMembers')) {
      return message.reply("❌ Vous n'avez pas les permissions nécessaires.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Vous devez mentionner un membre.');

    if (!fs.existsSync(warningsFilePath)) {
      return message.reply("Ce membre n'a aucun avertissement.");
    }

    const warnings = JSON.parse(fs.readFileSync(warningsFilePath, 'utf8'));
    const guildId = message.guild.id;

    if (!warnings[guildId]?.[member.id] || warnings[guildId][member.id].length === 0) {
      return message.reply("Ce membre n'a aucun avertissement sur ce serveur.");
    }

    warnings[guildId][member.id].pop();
    fs.writeFileSync(warningsFilePath, JSON.stringify(warnings, null, 2));
    message.reply(`✅ Un avertissement retiré pour ${member.user.tag}.`);
  },
};
