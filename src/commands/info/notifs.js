const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');

module.exports = {
    name: 'notifs',
    description: 'Affiche un message concernant les rôles du serveur',
    async execute(client, message, args) {
        const container = new ContainerBuilder().setAccentColor(0xFFFB00);

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## 🎭 Obtenir des rôles — ${message.guild.name}`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(message.guild.iconURL({ dynamic: true, size: 128 }) || 'https://cdn.discordapp.com/embed/avatars/0.png')
                )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'Pour modifier vos rôles, rendez-vous dans **Channels & Roles** : <id:customize>\n\nCliquez sur les différentes options pour obtenir les rôles qui vous correspondent !'
            )
        );

        message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};
