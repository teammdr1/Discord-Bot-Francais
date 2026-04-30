const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'citation',
    description: 'Envoie une citation aléatoire',

    async execute(client, message, args) {

        // Liste de citations (à personnaliser)
        const citations = [
            { text: "La vie est un mystère qu'il faut vivre, et non un problème à résoudre.", author: "Gandhi" },
            { text: "Le succès n’est pas final, l’échec n’est pas fatal : c’est le courage de continuer qui compte.", author: "Winston Churchill" },
            { text: "Il n’y a qu’une façon d’échouer, c’est d’abandonner avant d’avoir réussi.", author: "Georges Clémenceau" },
            { text: "Fais de ta vie un rêve, et d’un rêve, une réalité.", author: "Antoine de Saint-Exupéry" },
            { text: "Le meilleur moyen de prédire l’avenir, c’est de le créer.", author: "Peter Drucker" },
            { text: "On ne voit bien qu’avec le cœur. L’essentiel est invisible pour les yeux.", author: "Antoine de Saint-Exupéry" }
        ];

        const random = citations[Math.floor(Math.random() * citations.length)];

        const embed = new EmbedBuilder()
            .setTitle("💭 Citation du jour")
            .setDescription(`*"${random.text}"*`)
            .setFooter({ text: random.author })
            .setColor('#5865F2')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
