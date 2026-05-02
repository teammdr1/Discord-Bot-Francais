const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require('discord.js');

module.exports = {
    name: 'rolelist',
    description: 'Liste tous les rôles du serveur',
    async execute(client, message) {
        if (!message.guild) return;
        const roles = message.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .filter(r => r.name !== '@everyone')
            .map(r => r.toString());

        const container = new ContainerBuilder().setAccentColor(0x5865F2);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 📜 Rôles — ${message.guild.name}`)
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(roles.join(' · ') || '*Aucun rôle*')
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${roles.length} rôle(s) au total`)
        );

        message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};
