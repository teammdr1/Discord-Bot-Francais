const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'coinflip',
  aliases: ['cf', 'pileface', 'coin'],
  description: 'Joue à pile ou face avec une mise.',
  usage: '!coinflip <mise> <pile/face>',
  cooldown: 5, // 5 secondes
  async execute(client, message, args) {
    const bet = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();

    // Validation des arguments
    if (!bet || isNaN(bet) || bet <= 0) {
      return message.reply('❌ Vous devez spécifier une mise valide (nombre positif).\nUsage: `!coinflip <mise> <pile/face>`');
    }

    if (!choice || !['pile', 'face', 'p', 'f'].includes(choice)) {
      return message.reply('❌ Vous devez choisir "pile" ou "face".\nUsage: `!coinflip <mise> <pile/face>`');
    }

    // Vérifier si l'utilisateur a assez d'argent
    const userData = economy.getUserData(message.author.id);
    if (userData.cash < bet) {
      return message.reply(`❌ Vous devez avoir au moins ${bet} bobux en poche pour jouer !`);
    }

    // Limite de mise
    if (bet > 10000) {
      return message.reply('❌ La mise maximale est de 10 000 bobux !');
    }

    // Résultat aléatoire
    const result = Math.random() < 0.5 ? 'pile' : 'face';
    const win = (choice === 'p' && result === 'pile') ||
                (choice === 'f' && result === 'face') ||
                (choice === result);

    let winnings = 0;
    let embed;

    if (win) {
      winnings = bet; // Gains égaux à la mise
      economy.addCash(message.author.id, winnings);
      economy.updateStats(message.author.id, 'coinflipWins', 1);

      embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🪙 Pile ou Face - Gagné !')
        .setDescription(`**${result.toUpperCase()}** ! Vous avez gagné !`)
        .addFields(
          { name: '💵 Mise', value: `${bet} bobux`, inline: true },
          { name: '💰 Gains', value: `+${winnings.toLocaleString()} bobux`, inline: true },
          { name: '🏦 Nouveau solde', value: `${(userData.cash + winnings).toLocaleString()} bobux`, inline: true }
        );
    } else {
      economy.updateStats(message.author.id, 'coinflipLosses', 1);

      embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🪙 Pile ou Face - Perdu !')
        .setDescription(`**${result.toUpperCase()}** ! Vous avez perdu !`)
        .addFields(
          { name: '💵 Mise', value: `${bet} bobux`, inline: true },
          { name: '💸 Pertes', value: `-${bet.toLocaleString()} bobux`, inline: true },
          { name: '🏦 Nouveau solde', value: `${(userData.cash - bet).toLocaleString()} bobux`, inline: true }
        );
    }

    embed.setFooter({ text: `Vous avez choisi: ${choice === 'p' ? 'Pile' : choice === 'f' ? 'Face' : choice.toUpperCase()}` });

    // Boutons pour rejouer
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`cf_pile_${bet}_${message.author.id}`)
        .setLabel('🪙 Pile')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`cf_face_${bet}_${message.author.id}`)
        .setLabel('🪙 Face')
        .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });

    // Log l'action
    console.log(`[ECONOMY] ${message.author.username} a joué coinflip: ${choice} vs ${result} - ${win ? `Gagné ${winnings}` : `Perdu ${bet}`} bobux`);
  }
};