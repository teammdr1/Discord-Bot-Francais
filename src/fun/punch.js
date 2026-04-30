const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'punch',
    description: 'Donne un coup de poing à quelqu’un 🥊',

    async execute(client, message, args) {
        const member = message.mentions.members.first();
        if (!member) return message.reply("❌ Mentionne un membre à frapper !");

        // GIFs de punch aléatoires
        const gifs = [
            'https://i.pinimg.com/originals/17/5c/f2/175cf269b6df62b75a5d25a0ed45e954.gif',
            'https://giffiles.alphacoders.com/169/169894.gif',
            'https://i.makeagif.com/media/10-04-2015/2rtp-R.gif',
            'https://i.namu.wiki/i/UaTlA_33BlyaZ2Roi5I3fxY8cAJ2mlpFzRql0rmKpoD6vNyRGhwDcvNrSR-u9IPTaB5LAziVXFZWdelGJGFlOA.gif'
        ];

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setTitle(`${message.author.username} donne un coup de poing à ${member.user.username} ! 🥊`)
            .setImage(gif)
            .setColor('#FF0000')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
