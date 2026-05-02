const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');

module.exports = {
    name: 'bugreport',
    description: 'Signale un bug au bot owner',
    async execute(client, message, args) {
        if (!args.length) return message.reply('❌ Utilisation : +bugreport <message>');

        const report = args.join(' ');
        const ownerId = '1200909869872586752';

        try {
            const user = await message.client.users.fetch(ownerId);

            const container = new ContainerBuilder().setAccentColor(0xED4245);
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `## 🐛 Nouveau bug report\nDe **${message.author.tag}** (\`${message.author.id}\`)`
                        )
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    )
            );
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Message :**\n${report}`)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:f>`)
            );

            await user.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            message.reply('✅ Bug report envoyé !');
        } catch {
            message.reply('❌ Impossible d\'envoyer le bug report.');
        }
    }
};
