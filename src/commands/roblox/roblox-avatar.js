const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');

module.exports = {
    name: 'roblox-avatar',
    description: 'Affiche l\'avatar d\'un utilisateur Roblox',
    async execute(client, message, args) {
        if (!args[0]) return message.reply('❌ Utilisation : `+roblox-avatar <username>`');

        const username = args[0];
        try {
            const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'User-Agent': 'DiscordBot' },
                body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
            });
            const userData = await userRes.json();
            if (!userData?.data || !userData.data[0]) return message.reply('❌ Utilisateur introuvable.');

            const user = userData.data[0];
            const userId = user.id;

            const avatarRes = await fetch(
                `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`
            );
            const avatarData = await avatarRes.json();
            const avatarUrl = avatarData?.data?.[0]?.imageUrl;
            if (!avatarUrl) return message.reply('❌ Impossible de récupérer l\'avatar.');

            const container = new ContainerBuilder().setAccentColor(0xFFE000);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🖼️ Avatar Roblox — [${user.name}](https://www.roblox.com/users/${userId}/profile)`
                )
            );
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1));
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(avatarUrl).setDescription(user.name)
                )
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('-# Roblox Avatar')
            );

            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
            console.error(err);
            return message.reply('❌ Impossible de récupérer l\'avatar.');
        }
    }
};
