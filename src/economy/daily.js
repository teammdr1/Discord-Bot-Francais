const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economy = require('../../utils/economy');

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 heures
const DAILY_REWARDS = [
  { amount: 100, emoji: '🥉', name: 'Bronze' },
  { amount: 250, emoji: '🥈', name: 'Argent' },
  { amount: 500, emoji: '🥇', name: 'Or' },
  { amount: 1000, emoji: '💎', name: 'Diamant' },
  { amount: 2000, emoji: '👑', name: 'Royal' }
];

const STREAK_BONUSES = [
  { streak: 7, bonus: 500, name: 'Semaine complète' },
  { streak: 14, bonus: 1500, name: 'Deux semaines' },
  { streak: 30, bonus: 5000, name: 'Mois complet' },
  { streak: 100, bonus: 25000, name: 'Century Club' }
];

module.exports = {
  name: 'daily',
  description: 'Récupère ta récompense quotidienne.',
  async execute(client, message, args) {
    const userData = economy.getUserData(message.author.id);
    const now = Date.now();
    const lastDaily = userData.lastDaily || 0;
    const timeDiff = now - lastDaily;

    // Vérifier si c'est le bon moment
    if (timeDiff < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - timeDiff;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⏰ Récompense déjà récupérée')
        .setDescription(`Tu dois attendre **${hours}h ${minutes}min** avant de récupérer ta prochaine récompense quotidienne.`)
        .setFooter({ text: 'Reviens plus tard !' });

      return message.channel.send({ embeds: [embed] });
    }

    // Calculer la streak
    const yesterday = now - (24 * 60 * 60 * 1000);
    const isStreakMaintained = lastDaily >= yesterday - (2 * 60 * 60 * 1000); // Tolérance de 2h
    const currentStreak = isStreakMaintained ? (userData.dailyStreak || 0) + 1 : 1;

    // Sélectionner une récompense aléatoire
    const reward = DAILY_REWARDS[Math.floor(Math.random() * DAILY_REWARDS.length)];

    let totalAmount = reward.amount;
    let streakBonus = 0;

    // Vérifier les bonus de streak
    for (const bonus of STREAK_BONUSES) {
      if (currentStreak >= bonus.streak) {
        streakBonus = bonus.bonus;
        totalAmount += bonus.bonus;
      }
    }

    // Ajouter l'argent
    economy.addCash(message.author.id, totalAmount);
    economy.updateStats(message.author.id, 'dailyCount', 1);

    // Mettre à jour lastDaily et dailyStreak
    const updatedUser = economy.getUserData(message.author.id);
    updatedUser.lastDaily = now;
    updatedUser.dailyStreak = currentStreak;
    economy.updateUser(message.author.id, updatedUser);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎁 Récompense quotidienne récupérée !')
      .setDescription(`${reward.emoji} Tu as gagné **${reward.amount.toLocaleString()} bobux** avec la récompense **${reward.name}** !`)
      .addFields(
        { name: '🔥 Série actuelle', value: `${currentStreak} jour(s)`, inline: true },
        { name: '💰 Total gagné', value: `${totalAmount.toLocaleString()} bobux`, inline: true },
        { name: '⏰ Prochaine récompense', value: 'Dans 24 heures', inline: true }
      );

    if (streakBonus > 0) {
      const bonusInfo = STREAK_BONUSES.find(b => b.streak <= currentStreak);
      embed.addFields({
        name: '🎯 Bonus de série',
        value: `+${streakBonus.toLocaleString()} bobux (${bonusInfo.name})`,
        inline: false
      });
    }

    embed.setFooter({ text: `Total de récompenses quotidiennes: ${economy.getUserStats(message.author.id).dailyCount}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('claim_daily_again')
        .setLabel('🎁 Récupérer à nouveau')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};