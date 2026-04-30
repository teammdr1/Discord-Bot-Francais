const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'deposit',
  aliases: ['dep', 'deposer'],
  description: 'Dépose de l\'argent dans votre compte bancaire.',
  usage: '!deposit <montant>',
  async execute(client, message, args) {
    const amount = parseInt(args[0]);

    if (!amount || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Vous devez spécifier un montant valide à déposer.\nUsage: `!deposit <montant>`');
    }

    const userData = economy.getUserData(message.author.id);

    if (userData.cash < amount) {
      return message.reply(`❌ Vous n'avez que ${userData.cash.toLocaleString()} bobux en poche !`);
    }

    // Effectuer le dépôt
    const success = economy.deposit(message.author.id, amount);

    if (!success) {
      return message.reply('❌ Une erreur est survenue lors du dépôt.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏦 Dépôt bancaire')
      .setDescription(`${message.author} a déposé ${amount.toLocaleString()} bobux en banque.`)
      .addFields(
        { name: '💵 Déposé', value: `${amount.toLocaleString()} bobux`, inline: true },
        { name: '💰 En poche', value: `${(userData.cash - amount).toLocaleString()} bobux`, inline: true },
        { name: '🏦 En banque', value: `${(userData.bank + amount).toLocaleString()} bobux`, inline: true }
      )
      .setFooter({ text: 'Dépôt effectué avec succès' });

    await message.channel.send({ embeds: [embed] });

    // Log l'action
    console.log(`[ECONOMY] ${message.author.username} a déposé ${amount} bobux en banque`);
  }
};
