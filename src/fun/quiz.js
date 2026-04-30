const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "quiz",
    description: "Lance un quiz",

    async execute(message) {

        const questions = [
            {
                question: "Quel jeu a été créé par Roblox Corporation ?",
                answers: ["Minecraft", "Roblox", "Fortnite", "GTA"],
                correct: 1
            },
            {
                question: "Combien font 5 × 6 ?",
                answers: ["11", "25", "30", "60"],
                correct: 2
            },
            {
                question: "Quelle planète est la plus proche du Soleil ?",
                answers: ["Mars", "Mercure", "Vénus", "Terre"],
                correct: 1
            }
        ];

        const q = questions[Math.floor(Math.random() * questions.length)];

        const embed = new EmbedBuilder()
            .setTitle("Quiz")
            .setDescription(q.question);

        const row = new ActionRowBuilder();

        q.answers.forEach((answer, i) => {

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`quiz_${i}`)
                    .setLabel(answer)
                    .setStyle(ButtonStyle.Primary)
            );

        });

        const gameMessage = await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        const collector = gameMessage.createMessageComponentCollector({
            time: 30000
        });

        collector.on("collect", async interaction => {

            const choice = parseInt(interaction.customId.split("_")[1]);

            if (choice === q.correct) {

                embed.setDescription(`Bonne réponse ! 🎉\n\nLa réponse était **${q.answers[q.correct]}**`);

            } else {

                embed.setDescription(`Mauvaise réponse.\n\nLa bonne réponse était **${q.answers[q.correct]}**`);
            }

            collector.stop();

            await interaction.update({
                embeds: [embed],
                components: []
            });

        });

        collector.on("end", async collected => {

            if (collected.size === 0) {

                embed.setDescription(`Temps écoulé.\n\nLa réponse était **${q.answers[q.correct]}**`);

                gameMessage.edit({
                    embeds: [embed],
                    components: []
                });
            }

        });

    }
};
