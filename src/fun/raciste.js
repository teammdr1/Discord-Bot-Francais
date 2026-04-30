const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'raciste',
    description: 'Calcule un pourcentage de racisme (fun) d’un membre',

    async execute(client, message, args) {
        // Membre mentionné ou auteur
        const member = message.mentions.members.first() || message.member;

        // Pourcentage aléatoire entre 0 et 100
        const percentage = Math.floor(Math.random() * 101);

        const embed = new EmbedBuilder()
            .setTitle(`<:WillehadOuiCMoi:1497130793997439098> Test de racisme`)
            .setDescription(`${member.user.tag} est à **${percentage}% raciste !**`)
            .setColor('#0f0f0f')
            .setFooter({ text: 'Ceci est une commande troll, ne la prenez pas au sérieux !' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
