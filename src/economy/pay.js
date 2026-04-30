const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'pay',
  aliases: ['payer', 'give', 'transfer'],
  description: 'Transfère de l\'argent à un autre membre.',
  usage: '!pay @membre <montant>',
  async execute(client, message, args) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) {
      return message.reply('❌ Vous devez mentionner un membre à qui donner de l\'argent !\nUsage: `!pay @membre <montant>`');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Vous devez spécifier un montant valide à transférer.\nUsage: `!pay @membre <montant>`');
    }

    if (target.id === message.author.id) {
      return message.reply('❌ Vous ne pouvez pas vous transférer de l\'argent à vous-même !');
    }

    if (target.bot) {
      return message.reply('❌ Vous ne pouvez pas transférer de l\'argent à un bot !');
    }

    // Limite de transfert
    if (amount > 50000) {
      return message.reply('❌ Le montant maximum par transfert est de 50 000 bobux !');
    }

    const userData = economy.getUserData(message.author.id);

    if (userData.cash < amount) {
      return message.reply(`❌ Vous n'avez que ${userData.cash.toLocaleString()} bobux en poche !`);
    }

    // Effectuer le transfert
    const success = economy.transfer(message.author.id, target.id, amount);

    if (!success) {
      return message.reply('❌ Une erreur est survenue lors du transfert.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('💸 Transfert d\'argent')
      .setDescription(`${message.author} a transféré ${amount.toLocaleString()} bobux à ${target}.`)
      .addFields(
        { name: '📤 Expéditeur', value: message.author.username, inline: true },
        { name: '📥 Destinataire', value: target.username, inline: true },
        { name: '💵 Montant', value: `${amount.toLocaleString()} bobux`, inline: true }
      )
      .setFooter({ text: 'Transfert effectué avec succès' });

    await message.channel.send({ embeds: [embed] });

    // Log l'action
    console.log(`[ECONOMY] ${message.author.username} a transféré ${amount} bobux à ${target.username}`);
  }
};