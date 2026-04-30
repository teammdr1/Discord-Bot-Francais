const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const config = require("./config");
const guildConfig = require("./src/utils/guildConfig");
const snipe = require("./src/commands/other/snipe");
const { Player } = require("discord-player");

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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.GuildMember],
});

client.player = new Player(client);
client.commands = new Collection();
client.slashCommands = new Collection();
client.prefix = config.prefix;
client.config = config;

snipe.init(client);

require("./src/structure/commandHandler")(client);
require("./src/structure/slashCommandHandler")(client);
require("./src/structure/eventHandler")(client);

const invitesCache = new Map();

async function findUsedInvite(guild) {
  if (!guild) return null;

  let newInvites;
  try {
    newInvites = await guild.invites.fetch();
  } catch {
    return null;
  }

  const cached = invitesCache.get(guild.id);
  let used = null;

  if (cached) {
    newInvites.forEach((inv) => {
      const oldUses = cached.get(inv.code) || 0;
      if (inv.uses > oldUses) used = inv;
    });
  }

  invitesCache.set(guild.id, new Map(newInvites.map((i) => [i.code, i.uses])));
  return used;
}

async function getBotAdder(guild, botId) {
  try {
    const logs = await guild.fetchAuditLogs({
      type: 28,
      limit: 5,
    });

    const entry = logs.entries.find((e) => e.target?.id === botId);
    return entry?.executor || null;
  } catch {
    return null;
  }
}

client.once("ready", async () => {
  client.guilds.cache.forEach(async (guild) => {
    try {
      const invites = await guild.invites.fetch();

      invitesCache.set(guild.id, new Map(invites.map((i) => [i.code, i.uses])));
    } catch {
      invitesCache.set(guild.id, new Map());
    }
  });
});

client.player.events.on("playerStart", (queue, track) => {
  queue.metadata.channel.send(`▶️ ${track.title}`);
});

client.on("presenceUpdate", async (_, newPresence) => {
  const member = newPresence?.member;
  if (!member || !member.guild) return;

  if (client.checkMember) {
    const cfg = guildConfig.getAll(member.guild.id);
    await client.checkMember(member, cfg).catch(() => {});
  }
});

client.on("guildMemberAdd", async (member) => {
  const cfg = guildConfig.getAll(member.guild.id);
  const createdAt = member.user.createdAt;
  const now = new Date();
  const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const diffYears = Math.floor(diffDays / 365);
  const ageText = diffYears > 0 ? `${diffYears} ans` : `${diffDays} jours`;
  const memberCount = member.guild.memberCount;

  let inviterText = "Invitation inconnue";

  if (member.user.bot) {
    const adder = await getBotAdder(member.guild, member.id);
    inviterText = adder
      ? `Bot ajouté par **${adder.tag}**`
      : "Bot ajouté (source inconnue)";
  } else {
    const usedInvite = await findUsedInvite(member.guild);
    inviterText = usedInvite
      ? `Invité par **${usedInvite.inviter.tag}**`
      : "Invitation inconnue";
  }
  const welcomeEmbed = new EmbedBuilder()
    .setColor("#00ff00")
    .setTitle("👋 Nouveau membre")
    .setDescription(
      `**${member} vient de nous rejoindre**\n\n` +
        `Compte créé il y a **${ageText}**\n` +
        `${inviterText}`,
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: member.guild.name,
      iconURL: member.guild.iconURL({ dynamic: true }),
    });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("member_count")
      .setLabel(`👥 ${memberCount} membres`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
  );
  if (cfg.welcomeChannelId) {
  const channel = member.guild.channels.cache.get(cfg.welcomeChannelId);

  if (channel) {
    let content = "";

    if (cfg.welcomePingRoleId) {
      content = `<@&${cfg.welcomePingRoleId}>`;
    }

    channel.send({
      content: content,
      embeds: [welcomeEmbed],
      components: [row],
      allowedMentions: {
        roles: cfg.welcomePingRoleId ? [cfg.welcomePingRoleId] : []
      }
    }).catch(() => {});
  }
}
  if (cfg.logChannelId) {
    const logChannel = member.guild.channels.cache.get(cfg.logChannelId);
    if (logChannel) {
      logChannel.send(`📥 ${member} a rejoint le serveur`).catch(() => {});
    }
  }
  if (cfg.welcomeRoleId) {
  const role = member.guild.roles.cache.get(cfg.welcomeRoleId);
  if (role) {
    member.roles.add(role).catch(() => {});
  }
}
});

client.on("guildMemberRemove", async (member) => {
  const cfg = guildConfig.getAll(member.guild.id);
  if (!cfg.logChannelId) return;

  const logChannel = member.guild.channels.cache.get(cfg.logChannelId);
  if (!logChannel) return;

  const memberCount = member.guild.memberCount;

  const leaveEmbed = new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle(`${member.user.tag} nous a quitté...`)
    .setDescription(`Il reste **${memberCount} membres** sur le serveur.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: member.guild.name,
      iconURL: member.guild.iconURL({ dynamic: true }),
    });

  logChannel.send({ embeds: [leaveEmbed] }).catch(() => {});
});

function formatLog(type, message, extra = "") {
  const date = new Date().toISOString();
  const guildName = message.guild ? message.guild.name : "DM";
  const author = message.author ? message.author.tag : "Inconnu";
  const content = message.content || "[Pas de contenu]";

  console.log(
    `[${date}] [${type}] [${guildName}] ${author} : ${content} ${extra}`,
  );
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

  console.log(
    `[${date}] [MODIFIÉ] [${guildName}] ${author}\nAncien : ${oldContent}\nNouveau : ${newContent}`,
  );
});

process.stdin.setEncoding("utf8");
process.stdin.resume();

process.stdin.on("data", async (data) => {
  const message = data.toString().trim();
  if (!message) return;

  try {
    const channel = await client.channels.fetch("1485010294211219476");
    if (!channel) return logAction("Salon introuvable");

    await channel.send(message);
  } catch (err) {
    console.error(err);
  }
});

process.on("unhandledRejection", (reason) => {
  logAction(`Rejet non géré : ${reason}`);
});

process.on("SIGINT", () => {
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  client.destroy();
  process.exit(0);
});

client.login(config.token);
