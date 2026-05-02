const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const economy = require('../../utils/economy');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'classement'],
  description: 'Affiche le classement des membres les plus riches.',

  async execute(client, message, args) {
    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const leaderboard = economy.getLeaderboard(100);

    if (!leaderboard.length) {
      const container = new ContainerBuilder()
        .setAccentColor(0xff0000);

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🏆 Leaderboard`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Aucun utilisateur enregistré.`
        )
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const totalPages = Math.ceil(leaderboard.length / perPage);
    const pageData = leaderboard.slice(offset, offset + perPage);

    const container = new ContainerBuilder()
      .setAccentColor(0xffd700);

    // ── title ──
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🏆 Leaderboard`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true)
    );

    // ── entries ──
    const text = pageData.map((entry, i) => {
      const rank = offset + i + 1;
      const medal =
        rank === 1 ? '🥇' :
        rank === 2 ? '🥈' :
        rank === 3 ? '🥉' : '🏅';

      const user = message.guild.members.cache.get(entry.id);

      return `${medal} **#${rank} ${user?.user.username || 'Utilisateur inconnu'}**\n` +
             `💰 ${entry.total.toLocaleString()} bobux\n`;
    }).join('\n');

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(text)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true)
    );

    // ── page info ──
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `📄 Page **${page}/${totalPages}** • 👥 ${leaderboard.length} joueurs`
      )
    );

    // ── user rank ──
    const userRank = leaderboard.findIndex(e => e.id === message.author.id) + 1;

    if (userRank > 0) {
      const userEntry = leaderboard[userRank - 1];

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `📊 Votre position : **#${userRank}** — ${userEntry.total.toLocaleString()} bobux`
        )
      );
    }

    // ── buttons ──
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`lb_prev_${page}`)
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),

      new ButtonBuilder()
        .setCustomId(`lb_refresh_${page}`)
        .setLabel('🔄')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`lb_next_${page}`)
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages)
    );

    container.addActionRowComponents(row);

    return message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
