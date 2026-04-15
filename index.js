const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config");
const guildConfig = require("./src/utils/guildConfig");

const LOG_FILE = path.join(__dirname, "role_logs.txt");

function logAction(message) {
  const date = new Date().toISOString();
  const line = `[${date}] ${message}\n`;
  console.log(line.trim());
  fs.appendFile(LOG_FILE, line, () => {});
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.GuildMember]
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.prefix = config.prefix;
client.config = config;

require('./src/structure/commandHandler')(client);
require('./src/structure/slashCommandHandler')(client);
require('./src/structure/eventHandler')(client);

// ===== STATUT (rôle basé sur le statut perso) =====
client.on("presenceUpdate", async (_, newPresence) => {
  const member = newPresence?.member;
  if (!member || !member.guild) return;
  if (client.checkMember) {
    const cfg = guildConfig.getAll(member.guild.id);
    await client.checkMember(member, cfg).catch(() => {});
  }
});

// ===== ARRIVÉE =====
client.on('guildMemberAdd', async (member) => {
  const cfg = guildConfig.getAll(member.guild.id);

  if (cfg.welcomeChannelId) {
    const welcomeChannel = member.guild.channels.cache.get(cfg.welcomeChannelId);
    if (welcomeChannel) {
      const memberCount = member.guild.memberCount;
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('👋 Un nouveau membre rejoint le serveur !')
        .setDescription(`Bienvenue ${member} ! 🥳\nTu es maintenant l'un des **${memberCount} membres** !`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) });
      welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(() => {});
    }
  }

  if (cfg.logChannelId) {
    const logChannel = member.guild.channels.cache.get(cfg.logChannelId);
    if (logChannel) {
      logChannel.send(`📥 ${member} a rejoint le serveur !`).catch(() => {});
    }
  }
});

// ===== DÉPART =====
client.on('guildMemberRemove', async (member) => {
  const cfg = guildConfig.getAll(member.guild.id);
  if (!cfg.logChannelId) return;
  const logChannel = member.guild.channels.cache.get(cfg.logChannelId);
  if (!logChannel) return;
  const memberCount = member.guild.memberCount;
  const leaveEmbed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle(`${member.user.tag} nous a quitté...`)
    .setDescription(`Il reste **${memberCount} membres** sur le serveur.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) });
  logChannel.send({ embeds: [leaveEmbed] }).catch(() => {});
});

// ===== LOGS GLOBAUX MESSAGES =====
function formatLog(type, message, extra = "") {
  const date = new Date().toISOString();
  const guildName = message.guild ? message.guild.name : "DM";
  const author = message.author ? message.author.tag : "Inconnu";
  const content = message.content || "[Pas de contenu]";
  console.log(`[${date}] [${type}] [${guildName}] ${author} : ${content} ${extra}`);
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  formatLog("ENVOYÉ", message);
});

client.on("messageDelete", (message) => {
  if (!message.author || message.author.bot) return;
  formatLog("SUPPRIMÉ", message);
});

client.on("messageUpdate", (oldMessage, newMessage) => {
  if (!newMessage.author || newMessage.author.bot) return;
  const oldContent = oldMessage.content || "[Pas de contenu]";
  const newContent = newMessage.content || "[Pas de contenu]";
  const date = new Date().toISOString();
  const guildName = newMessage.guild ? newMessage.guild.name : "DM";
  const author = newMessage.author.tag;
  console.log(`[${date}] [MODIFIÉ] [${guildName}] ${author}\nAncien : ${oldContent}\nNouveau : ${newContent}`);
});

// ===== MESSAGE DEPUIS TERMINAL =====
process.stdin.setEncoding('utf8');
process.stdin.resume();
process.stdin.on('data', async (data) => {
  const message = data.toString().trim();
  if (!message) return;
  try {
    const channel = await client.channels.fetch('1466007980569919636');
    if (!channel) { logAction('Salon introuvable pour message terminal'); return; }
    await channel.send(message);
    console.log('Message envoyé :', message);
  } catch (err) {
    console.error('Erreur envoi message terminal :', err);
  }
});

// ===== ERREURS =====
process.on('unhandledRejection', (reason) => {
  logAction(`Rejet non géré : ${reason}`);
});

process.on('SIGTERM', () => {
  logAction('Bot arrêté (SIGTERM)');
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  logAction('Bot arrêté (SIGINT)');
  client.destroy();
  process.exit(0);
});

// ===== LOGIN =====
client.login(config.token);
