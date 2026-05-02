const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    PermissionsBitField,
} = require('discord.js');

module.exports = {
    name: 'roleinfo',
    description: 'Affiche les informations d\'un rôle',
    async execute(client, message, args) {
        if (!message.guild) return;
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('❌ Tu n\'as pas la permission de voir les rôles.');
        }
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply('❌ Mentionne un rôle ou mets son ID.');

        const hexColor = '#' + role.color.toString(16).padStart(6, '0');
        const accent = role.color || 0x5865F2;
        const perms = role.permissions.toArray();

        const container = new ContainerBuilder().setAccentColor(accent);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## 🎖️ ${role.toString()} — ${role.name}\n` +
                `🆔 \`${role.id}\` · 🎨 \`${hexColor}\` · Position **#${role.position}**`
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `👥 **Membres :** ${role.members.size}\n` +
                `📢 **Mentionable :** ${role.mentionable ? '✅ Oui' : '❌ Non'} · ` +
                `🏷️ **Affiché séparément :** ${role.hoist ? '✅ Oui' : '❌ Non'}\n` +
                `🤖 **Géré par intégration :** ${role.managed ? '✅ Oui' : '❌ Non'}`
            )
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### 🔑 Permissions (${perms.length})\n` +
                (perms.length > 0 ? perms.map(p => `\`${p}\``).join(' ') : '*Aucune*')
            )
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# Créé <t:${Math.floor(role.createdTimestamp / 1000)}:R>`)
        );

        message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
};
