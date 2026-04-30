const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'rob',
  aliases: ['voler', 'steal'],
  description: 'Tente de voler un autre membre (risque de perdre de l\'argent).',
  usage: '!rob @membre',
  cooldown: 300, // 5 minutes
  async execute(client, message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply('❌ Vous devez mentionner un membre à voler !\nUsage: `!rob @membre`');
    }

    if (target.id === message.author.id) {
      return message.reply('❌ Vous ne pouvez pas vous voler vous-même !');
    }

    if (target.bot) {
      return message.reply('❌ Vous ne pouvez pas voler un bot !');
    }

    // Vérifier si l'utilisateur a assez d'argent pour le risque
    const userData = economy.getUserData(message.author.id);
    if (userData.cash < 100) {
      return message.reply('❌ Vous devez avoir au moins 100 bobux en poche pour tenter un vol !');
    }

    // Vérifier si la cible a de l'argent
    const targetData = economy.getUserData(target.id);
    if (targetData.cash < 50) {
      return message.reply('❌ Cette personne n\'a pas assez d\'argent en poche pour être volée !');
    }

    // Calculer les chances de succès (30% de base + bonus selon le niveau)
    const userStats = economy.getUserStats(message.author.id);
    const successRate = Math.min(30 + (userStats.level * 2), 70); // Max 70%
    const success = Math.random() * 100 < successRate;

    let amount = 0;
    let embed;

    if (success) {
      // Calculer le montant volé (10-30% de l'argent de la cible)
      const stealPercent = 0.1 + (Math.random() * 0.2);
      amount = Math.floor(targetData.cash * stealPercent);
      amount = Math.min(amount, 5000); // Max 5000 bobux

      // Transférer l'argent
      economy.removeCash(target.id, amount);
      economy.addCash(message.author.id, amount);

      // Mettre à jour les stats
      economy.updateStats(message.author.id, 'successfulRobberies', 1);
      economy.updateStats(target.id, 'timesRobbed', 1);

      embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('💰 Vol réussi !')
        .setDescription(`${message.author} a volé ${amount.toLocaleString()} bobux à ${target} !`)
        .addFields(
          { name: '👤 Voleur', value: message.author.username, inline: true },
          { name: '🎯 Victime', value: target.username, inline: true },
          { name: '💵 Montant volé', value: `${amount.toLocaleString()} bobux`, inline: true }
        )
        .setFooter({ text: `Taux de succès: ${successRate.toFixed(1)}%` });
    } else {
      // Échec - perdre de l'argent
      const lossAmount = Math.floor(userData.cash * 0.1); // Perdre 10% de son argent
      economy.removeCash(message.author.id, lossAmount);

      // Mettre à jour les stats
      economy.updateStats(message.author.id, 'failedRobberies', 1);

      embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🚔 Vol raté !')
        .setDescription(`${message.author} s'est fait prendre en essayant de voler ${target} !`)
        .addFields(
          { name: '👤 Voleur', value: message.author.username, inline: true },
          { name: '💸 Amende', value: `${lossAmount.toLocaleString()} bobux`, inline: true },
          { name: '📊 Nouveau solde', value: `${(userData.cash - lossAmount).toLocaleString()} bobux`, inline: true }
        )
        .setFooter({ text: `Taux de succès: ${successRate.toFixed(1)}% • Vous perdez 10% de votre argent` });
    }

    await message.channel.send({ embeds: [embed] });

    // Log l'action
    console.log(`[ECONOMY] ${message.author.username} ${success ? 'a volé' : 'a raté son vol sur'} ${target.username} ${success ? `(${amount} bobux)` : ''}`);
  }
};
