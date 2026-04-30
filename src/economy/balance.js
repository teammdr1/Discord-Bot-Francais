const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'balance',
  aliases: ['bal', 'money', 'solde'],
  description: 'Affiche votre solde économique.',
  async execute(client, message, args) {
    const target = message.mentions.users.first() || message.author;
    const userData = economy.getUserData(target.id);
    const stats = economy.getUserStats(target.id);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`💰 Solde de ${target.username}`)
      .addFields(
        { name: '💵 Portefeuille', value: `${userData.cash.toLocaleString()} bobux`, inline: true },
        { name: '🏦 Banque', value: `${userData.bank.toLocaleString()} bobux`, inline: true },
        { name: '💎 Total', value: `${stats.total.toLocaleString()} bobux`, inline: true },
        { name: '📊 Statistiques', value: `Travaux: ${stats.workCount}\nDaily: ${stats.dailyCount}\nTotal gagné: ${stats.totalEarned.toLocaleString()} bobux`, inline: false }
      )
      .setFooter({ text: target.id === message.author.id ? 'Utilisez +balance @user pour voir le solde d\'autrui' : '' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('refresh_balance')
        .setLabel('🔄 Actualiser')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('deposit_all')
        .setLabel('📥 Tout déposer')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(userData.cash === 0),
      new ButtonBuilder()
        .setCustomId('withdraw_all')
        .setLabel('📤 Tout retirer')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(userData.bank === 0)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};