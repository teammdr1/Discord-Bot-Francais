const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economy = require('../../utils/economy');

const WORK_COOLDOWN = 60 * 60 * 1000; // 1 heure
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
  description: 'Travaille pour gagner de l\'argent.',
  async execute(client, message, args) {
    const userData = economy.getUserData(message.author.id);
    const now = Date.now();
    const remaining = WORK_COOLDOWN - (now - (userData.lastWork || 0));

    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⏰ Temps de repos nécessaire')
        .setDescription(`Tu dois encore attendre **${hours}h ${minutes}min** avant de pouvoir retravailler.`)
        .setFooter({ text: 'Utilise cette commande plus tard !' });

      return message.channel.send({ embeds: [embed] });
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    economy.addCash(message.author.id, amount);
    economy.updateStats(message.author.id, 'workCount', 1);

    // Mettre à jour lastWork
    const updatedUser = economy.getUserData(message.author.id);
    updatedUser.lastWork = now;
    economy.updateUser(message.author.id, updatedUser);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`${job.emoji} Travail effectué !`)
      .setDescription(`Tu as travaillé comme **${job.name}** et gagné **${amount.toLocaleString()} bobux** !`)
      .addFields(
        { name: '💼 Métier', value: job.name, inline: true },
        { name: '💰 Gain', value: `${amount.toLocaleString()} bobux`, inline: true },
        { name: '⏰ Prochain travail', value: 'Dans 1 heure', inline: true }
      )
      .setFooter({ text: `Total de travaux: ${economy.getUserStats(message.author.id).workCount}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('work_again')
        .setLabel('🔄 Travailler à nouveau')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
