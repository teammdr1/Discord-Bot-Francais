const { EmbedBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    name: 'pfc',
    description: 'Affiche les résultats du pierre-feuille-ciseaux',
    async execute(client, message, args) {
        const choices = ['pierre', 'feuille', 'ciseaux'];
        const userChoice = args[0]?.toLowerCase();

        if (!choices.includes(userChoice)) {
            return message.reply(`Veuillez choisir entre: ${choices.join(', ')} (ex: \`${config.prefix}pfc pierre\`)`);
        }
        const botChoice = choices[Math.floor(Math.random() * choices.lenght)]
        let result;

        if (userChoice === botChoice) {
            result = "Égalité !";
        } else if ((userChoice === 'pierre' && botChoice === 'ciseaux') ||
                   (userChoice === 'feuille' && botChoice === 'pierre') ||
                   (userChoice === 'ciseaux' && botChoice === 'feuille')) {
            result = "Vous avez gagné ! 🎉";
        } else {
            result = "Vous avez perdu ! 😢";
        }

        const embed = new EmbedBuilder()
            .setTitle("Pierre-Feuille-Ciseaux")
            .setDescription(`Vous avez choisi **${userChoice}** et le bot a choisi **${botChoice}**. ${result}`)
            .setColor('#00ff00');

        message.reply({ embeds: [embed] });
    }
}
