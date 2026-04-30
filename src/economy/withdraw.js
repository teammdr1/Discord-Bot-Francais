const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'withdraw',
  aliases: ['retirer', 'wd'],
  description: 'Retire de l\'argent de votre compte bancaire.',
  usage: '!withdraw <montant>',
  async execute(client, message, args) {
    const amount = parseInt(args[0]);

    if (!amount || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Vous devez spécifier un montant valide à retirer.\nUsage: `!withdraw <montant>`');
    }

    const userData = economy.getUserData(message.author.id);

    if (userData.bank < amount) {
      return message.reply(`❌ Vous n'avez que ${userData.bank.toLocaleString()} bobux en banque !`);
    }

    // Effectuer le retrait
    const success = economy.withdraw(message.author.id, amount);

    if (!success) {
      return message.reply('❌ Une erreur est survenue lors du retrait.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏦 Retrait bancaire')
      .setDescription(`${message.author} a retiré ${amount.toLocaleString()} bobux de sa banque.`)
      .addFields(
        { name: '💵 Retiré', value: `${amount.toLocaleString()} bobux`, inline: true },
        { name: '💰 En poche', value: `${(userData.cash + amount).toLocaleString()} bobux`, inline: true },
        { name: '🏦 En banque', value: `${(userData.bank - amount).toLocaleString()} bobux`, inline: true }
      )
      .setFooter({ text: 'Retrait effectué avec succès' });

    await message.channel.send({ embeds: [embed] });

    // Log l'action
    console.log(`[ECONOMY] ${message.author.username} a retiré ${amount} bobux de sa banque`);
  }
};