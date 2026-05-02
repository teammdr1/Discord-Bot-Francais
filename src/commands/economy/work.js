const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

const economy = require('../../utils/economy');

const WORK_COOLDOWN = 60 * 60 * 1000;

const JOBS = [
  { name: "Développeur", min: 150, max: 350, emoji: "💻" },
  { name: "Livreur", min: 100, max: 250, emoji: "🚚" },
  { name: "Serveur", min: 80, max: 220, emoji: "🍽️" },
  { name: "Graphiste", min: 130, max: 300, emoji: "🎨" },
  { name: "Modérateur", min: 120, max: 280, emoji: "🛡️" },
  { name: "Streamer", min: 200, max: 500, emoji: "🎮" },
  { name: "Musicien", min: 140, max: 320, emoji: "🎵" },
  { name: "Chef cuisinier", min: 160, max: 380, emoji: "👨‍🍳" },
  { name: "Médecin", min: 250, max: 600, emoji: "⚕️" },
  { name: "Policier", min: 180, max: 420, emoji: "👮" }
];

module.exports = {
  name: 'work',

  async execute(client, message, args) {
    const userData = economy.getUserData(message.author.id);

    const now = Date.now();
    const remaining = WORK_COOLDOWN - (now - (userData.lastWork || 0));

    if (remaining > 0) {
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);

      const container = new ContainerBuilder()
        .setAccentColor(0xff0000)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ⏰ Travail impossible\nTu dois attendre **${h}h ${m}min**`
          )
        );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    economy.addCash(message.author.id, amount);
    economy.updateStats(message.author.id, 'workCount', 1);

    const updated = economy.getUserData(message.author.id);
    updated.lastWork = now;
    economy.updateUser(message.author.id, updated);

    const container = new ContainerBuilder()
      .setAccentColor(0x00ff00)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${job.emoji} Travail terminé\n**${job.name}**\n+${amount.toLocaleString()} bobux`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `💼 Cooldown: 1h\n📊 Total travaux: ${economy.getUserStats(message.author.id).workCount}`
        )
      );

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('work_again')
        .setLabel('🔄 Travailler')
        .setStyle(ButtonStyle.Primary)
    );

    return message.channel.send({
      components: [container, buttons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
