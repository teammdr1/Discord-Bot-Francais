const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pat',
    description: 'Patte un membre mentionné',
    async execute(client, message, args) {
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("Vous devez mentionner un utilisateur pour le patter.");
        }
        const embed = new EmbedBuilder()
        .setColor('#464ec2')
        .setTitle(`${message.author.username} pat ${member.user.username} !`)
        .setDescription(`${message.author} pat ${member} !`)
        const messageSent = await message.channel.send({embeds : [embed]});
    },
};
