const fs = require('fs');
const path = require('path');
const guildConfig = require('../../utils/guildConfig');

const warningsFilePath = path.join(__dirname, '../../data/warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsFilePath)) return {};
  try { return JSON.parse(fs.readFileSync(warningsFilePath, 'utf8')); } catch { return {}; }
}

function saveWarnings(data) {
  fs.writeFileSync(warningsFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'warn',
  description: 'Avertit un membre avec une raison spécifique',
  async execute(client, message, args) {
    const authorizedRoles = guildConfig.get(message.guild.id, 'warnRoles') || [];
    const memberRoles = message.member.roles.cache.map(r => r.id);
    const isAdmin = message.member.permissions.has('Administrator');
    const isAuthorized = isAdmin || memberRoles.some(id => authorizedRoles.includes(id));

    if (!isAuthorized) {
      return message.reply("❌ Vous n'avez pas les permissions nécessaires.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Vous devez mentionner un membre.");

    if (member.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) {
      return message.reply("❌ Vous ne pouvez pas avertir un membre avec un rôle supérieur ou égal au vôtre.");
    }

    const reason = args.slice(1).join(' ');
    if (!reason) return message.reply("❌ Vous devez fournir une raison.");

    const warnings = loadWarnings();
    const guildId = message.guild.id;
    if (!warnings[guildId]) warnings[guildId] = {};
    if (!warnings[guildId][member.id]) warnings[guildId][member.id] = [];
    warnings[guildId][member.id].push({ reason, moderator: message.author.tag, timestamp: Date.now() });

    try {
      saveWarnings(warnings);
    } catch (err) {
      return message.reply("❌ Erreur lors de l'enregistrement de l'avertissement.");
    }

    message.reply(`✅ ${member.user.tag} a été averti : ${reason}`);
    try { await member.send(`⚠️ Vous avez été averti sur **${message.guild.name}** : ${reason}`); } catch {}
  },
};
