const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'classement'],
  description: 'Affiche le classement des membres les plus riches.',
  async execute(client, message, args) {
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const leaderboard = economy.getLeaderboard(100); // Top 100

    if (!leaderboard.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🏆 Classement des richesses')
        .setDescription('Aucun membre n\'a encore de solde enregistré.')
        .setFooter({ text: 'Soyez le premier à gagner des bobux !' });

      return message.channel.send({ embeds: [embed] });
    }

    const totalPages = Math.ceil(leaderboard.length / perPage);
    const pageData = leaderboard.slice(offset, offset + perPage);

    const fields = pageData.map((entry, index) => {
      const rank = offset + index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
      const user = message.guild.members.cache.get(entry.id);

      return {
        name: `${medal} #${rank} ${user ? user.user.username : 'Utilisateur inconnu'}`,
        value: `💰 **${entry.total.toLocaleString()} bobux**\n💵 ${entry.cash.toLocaleString()} | 🏦 ${entry.bank.toLocaleString()}`,
        inline: false,
      };
    });

    const embed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle('🏆 Classement des richesses')
      .setDescription(`Page ${page}/${totalPages} • Total: ${leaderboard.length} membres`)
      .addFields(fields)
      .setFooter({ text: 'Classement mis à jour automatiquement' })
      .setTimestamp();

    // Ajouter la position de l'utilisateur actuel
    const userRank = leaderboard.findIndex(entry => entry.id === message.author.id) + 1;
    if (userRank > 0) {
      const userEntry = leaderboard[userRank - 1];
      embed.addFields({
        name: '📊 Votre position',
        value: `#${userRank} • ${userEntry.total.toLocaleString()} bobux`,
        inline: false
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`lb_prev_${page}`)
        .setLabel('◀ Précédent')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId(`lb_refresh_${page}`)
        .setLabel('🔄 Actualiser')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`lb_next_${page}`)
        .setLabel('Suivant ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
