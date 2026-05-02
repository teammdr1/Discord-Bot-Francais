const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'seepub',
    description: 'Affiche la publicité/présentation du serveur',
    async execute(client, message, args) {
        const cfg = guildConfig.getAll(message.guild.id);
        const description = cfg.serverDescription;
        if (!description) {
            return message.reply('❌ Aucune description configurée. Utilisez `+setdesc <texte>` pour en définir une.');
        }

        const container = new ContainerBuilder().setAccentColor(0x00FF15);
        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 📢 Publicité — ${message.guild.name}`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(message.guild.iconURL({ dynamic: true, size: 128 }) || 'https://cdn.discordapp.com/embed/avatars/0.png')
                )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(description));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${message.guild.name}`)
        );

        message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};
