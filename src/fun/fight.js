const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fight',
    description: 'Joue un combat avec choix multiples',

    async execute(client, message, args) {
        if (!args.length) return message.reply(
            "❌ Utilisation : `+fight <attaque|défense|magie|esquive>`"
        );

        const choices = ['attaque', 'défense', 'magie', 'esquive'];
        const userChoice = args[0].toLowerCase();

        if (!choices.includes(userChoice)) {
            return message.reply(
                `❌ Choix invalide. Options : ${choices.join(', ')}`
            );
        }

        // Actions possibles du bot (adversaire)
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        // Détermine le résultat
        let result;
        if (userChoice === botChoice) {
            result = "Égalité ! ⚔️";
        } else if (
            (userChoice === 'attaque' && botChoice === 'magie') ||
            (userChoice === 'magie' && botChoice === 'défense') ||
            (userChoice === 'défense' && botChoice === 'attaque') ||
            (userChoice === 'esquive' && botChoice !== 'esquive')
        ) {
            result = "🎉 Tu gagnes !";
        } else {
            result = "💀 Tu perds !";
        }

        const embed = new EmbedBuilder()
            .setTitle('⚔️ Combat !')
            .addFields(
                { name: 'Ton choix', value: userChoice, inline: true },
                { name: "Adversaire", value: botChoice, inline: true },
                { name: 'Résultat', value: result }
            )
            .setColor('#5865F2')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
