const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'chiasse',
    description: 'Envoie un gif de chiasse',
    async execute(client, message, args) {
        const embed = new EmbedBuilder()
            .setDescription(`${message.author} a la chiasse !`)
            .setImage()
            .setColor('#2f3136')
        message.channel.send({ embeds: [embed]});
    }
} 
