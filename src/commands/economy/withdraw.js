const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const economy = require('../../utils/economy');

module.exports = {
  name: 'withdraw',
  aliases: ['retirer', 'wd'],
  description: 'Retire de l’argent de la banque.',

  async execute(client, message, args) {
    const amount = parseInt(args[0]);

    if (!amount || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Montant invalide.');
    }

    const userData = economy.getUserData(message.author.id);

    if (userData.bank < amount) {
      return message.reply('❌ Fonds insuffisants en banque.');
    }

    economy.withdraw(message.author.id, amount);

    const container = new ContainerBuilder()
      .setAccentColor(0x00ff00);

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🏦 Retrait\n` +
        `💵 **Retiré :** ${amount.toLocaleString()} bobux\n` +
        `💰 **En poche :** ${(userData.cash + amount).toLocaleString()} bobux\n` +
        `🏦 **En banque :** ${(userData.bank - amount).toLocaleString()} bobux`
      )
    );

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`withdraw_again_${message.author.id}`)
          .setLabel('🔁 Retirer encore')
          .setStyle(ButtonStyle.Secondary)
      )
    );

    return message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
};
