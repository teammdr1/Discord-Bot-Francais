const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'slots',
  aliases: ['machine', 'casino'],
  description: 'Joue à la machine à sous (coût: 50 bobux).',
  usage: '!slots',
  cooldown: 10, // 10 secondes
  async execute(client, message, args) {
    const bet = 50; // Coût fixe pour jouer

    // Vérifier si l'utilisateur a assez d'argent
    const userData = economy.getUserData(message.author.id);
    if (userData.cash < bet) {
      return message.reply(`❌ Vous devez avoir au moins ${bet} bobux en poche pour jouer !`);
    }

    // Retirer le coût du jeu
    economy.removeCash(message.author.id, bet);

    // Symboles de la machine à sous
    const symbols = ['🍒', '🍊', '🍇', '🍉', '🍋', '⭐', '💎', '7️⃣'];
    const weights = [30, 25, 20, 15, 8, 1.5, 0.4, 0.1]; // Probabilités en pourcentage

    // Fonction pour obtenir un symbole aléatoire pondéré
    function getRandomSymbol() {
      const random = Math.random() * 100;
      let cumulative = 0;
      for (let i = 0; i < symbols.length; i++) {
        cumulative += weights[i];
        if (random <= cumulative) {
          return symbols[i];
        }
      }
      return symbols[0];
    }

    // Générer les 3 symboles
    const slot1 = getRandomSymbol();
    const slot2 = getRandomSymbol();
    const slot3 = getRandomSymbol();

    // Calculer les gains
    let winnings = 0;
    let result = '';

    if (slot1 === slot2 && slot2 === slot3) {
      // Jackpot - 3 symboles identiques
      const multiplier = symbols.indexOf(slot1) + 1;
      winnings = bet * (5 + multiplier * 2); // 5x à 21x selon le symbole
      result = '🎰 JACKPOT !';
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      // 2 symboles identiques
      winnings = bet * 2; // Double de la mise
      result = '💰 Deux identiques !';
    } else {
      // Perdu
      winnings = 0;
      result = '😞 Perdu !';
    }

    // Ajouter les gains si il y en a
    if (winnings > 0) {
      economy.addCash(message.author.id, winnings);
      economy.updateStats(message.author.id, 'slotsWins', 1);
    } else {
      economy.updateStats(message.author.id, 'slotsLosses', 1);
    }

    // Créer l'embed
    const embed = new EmbedBuilder()
      .setColor(winnings > 0 ? '#00ff00' : '#ff0000')
      .setTitle('🎰 Machine à Sous')
      .setDescription(`**${slot1} | ${slot2} | ${slot3}**\n\n${result}`)
      .addFields(
        { name: '💵 Mise', value: `${bet} bobux`, inline: true },
        { name: winnings > 0 ? '💰 Gains' : '💸 Pertes', value: `${winnings > 0 ? '+' : ''}${winnings.toLocaleString()} bobux`, inline: true },
        { name: '🏦 Nouveau solde', value: `${(userData.cash - bet + winnings).toLocaleString()} bobux`, inline: true }
      )
      .setFooter({ text: 'Bonne chance pour le prochain tour !' });

    // Bouton pour rejouer
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`slots_replay_${message.author.id}`)
        .setLabel('🔄 Rejouer (50 bobux)')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });

    // Log l'action
    console.log(`[ECONOMY] ${message.author.username} a joué aux slots: ${slot1}${slot2}${slot3} - ${winnings > 0 ? `Gagné ${winnings}` : 'Perdu'} bobux`);
  }
};