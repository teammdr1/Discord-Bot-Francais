const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'vc',
    description: 'Affiche les statistiques du serveur',
    async execute(client, message, args) {
        const guild = message.guild;
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => 
    member.presence && 
    ['online', 'idle', 'dnd'].includes(member.presence.status)
).size;
        const voiceMembers = guild.members.cache.filter(member => member.voice.channel).size;
        const boosted = guild.premiumSubscriptionCount;

        const embed = new EmbedBuilder()
            .setTitle(`Statistiques du serveur ${guild.name}`)
            .setColor('#fff12d')
            .setDescription(`**<:membres:1485211705532485822> Membres :** ${totalMembers}\n**<a:online:1500246316918374410> En ligne :** ${onlineMembers}
**<:vocal:1485211924240142348> En vocal :** ${voiceMembers}
**<a:zy_boost:1492825488723279933> Boosts :** ${boosted}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }));
        message.reply({ embeds: [embed] });
    },
}
