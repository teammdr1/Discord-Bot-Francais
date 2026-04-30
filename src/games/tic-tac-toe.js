const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    name: "tic-tac-toe",
    description: "Joue au tic tac toe avec un autre joueur",

    async execute(message, args) {

        const opponent = message.mentions.users.first();

        if (!opponent) {
            return message.reply("Mentionne un joueur.");
        }

        if (opponent.bot) {
            return message.reply("Tu ne peux pas jouer contre un bot.");
        }

        if (opponent.id === message.author.id) {
            return message.reply("Tu ne peux pas jouer contre toi-même.");
        }

        const players = [message.author.id, opponent.id];
        let currentPlayer = 0;

        const board = Array(9).fill(null);

        function generateBoard() {

            const rows = [];

            for (let i = 0; i < 3; i++) {

                const row = new ActionRowBuilder();

                for (let j = 0; j < 3; j++) {

                    const index = i * 3 + j;

                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ttt_${index}`)
                            .setLabel(board[index] ?? " ")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(board[index] !== null)
                    );

                }

                rows.push(row);
            }

            return rows;
        }

        function checkWinner() {

            const wins = [
                [0,1,2],
                [3,4,5],
                [6,7,8],
                [0,3,6],
                [1,4,7],
                [2,5,8],
                [0,4,8],
                [2,4,6]
            ];

            for (const combo of wins) {

                const [a,b,c] = combo;

                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    return board[a];
                }

            }

            if (!board.includes(null)) return "draw";

            return null;
        }

        const embed = new EmbedBuilder()
            .setTitle("Tic Tac Toe")
            .setDescription(`Tour de <@${players[currentPlayer]}>`);

        const gameMessage = await message.channel.send({
            embeds: [embed],
            components: generateBoard()
        });

        const collector = gameMessage.createMessageComponentCollector({
            time: 600000
        });

        collector.on("collect", async interaction => {

            if (!players.includes(interaction.user.id)) {
                return interaction.reply({ content: "Tu ne joues pas dans cette partie.", ephemeral: true });
            }

            if (interaction.user.id !== players[currentPlayer]) {
                return interaction.reply({ content: "Ce n'est pas ton tour.", ephemeral: true });
            }

            const index = parseInt(interaction.customId.split("_")[1]);

            if (board[index]) return;

            board[index] = currentPlayer === 0 ? "X" : "O";

            const winner = checkWinner();

            if (winner) {

                collector.stop();

                if (winner === "draw") {
                    embed.setDescription("Match nul.");
                } else {

                    const winnerId = winner === "X" ? players[0] : players[1];
                    embed.setDescription(`<@${winnerId}> a gagné !`);
                }

                return interaction.update({
                    embeds: [embed],
                    components: generateBoard()
                });
            }

            currentPlayer = currentPlayer === 0 ? 1 : 0;

            embed.setDescription(`Tour de <@${players[currentPlayer]}>`);

            await interaction.update({
                embeds: [embed],
                components: generateBoard()
            });

        });

    }
};
