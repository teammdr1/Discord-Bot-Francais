const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: '8ball',
    description: 'Répond à une question comme une Magic 8-Ball',
    async execute(client, message, args) {
        if (!args.length) return message.reply("❌ Pose une question. Exemple : `+8ball Vais-je gagner ?`");
        const question = args.join(" ");
        const answers = [
            "Oui ✅",
            "Non ❌",
            "Peut-être 🤔",
            "Absolument ✅",
            "Je ne pense pas ❌",
            "Certainement ✅",
            "Impossible ❌",
            "Demande plus tard ⏳",
            "Très probable ✅",
            "Pas sûr 🤷"
        ];
        const response = answers[Math.floor(Math.random() * answers.length)];
        const embed = new EmbedBuilder()
            .setTitle("🎱 Magic 8-Ball")
            .addFields(
                { name: "Question", value: question },
                { name: "Réponse", value: response }
            )
            .setColor('#5865F2')
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};
