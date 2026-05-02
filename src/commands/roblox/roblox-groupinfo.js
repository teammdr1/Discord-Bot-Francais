const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');

module.exports = {
    name: 'roblox-groupinfo',
    description: 'Affiche les infos d\'un groupe Roblox',
    async execute(client, message, args) {
        if (!args[0]) return message.reply('❌ Utilisation : `+roblox-groupinfo <groupId>`');

        const groupId = args[0];
        try {
            const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
            const data = await res.json();
            if (!data || !data.id) return message.reply('❌ Groupe introuvable.');

            const thumbRes = await fetch(
                `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=420x420&format=Png`
            );
            const thumbData = await thumbRes.json();
            const icon = thumbData?.data?.[0]?.imageUrl || null;

            let ownerName = 'Aucun';
            if (data.owner && data.owner.userId) {
                const ownerRes = await fetch(`https://users.roblox.com/v1/users/${data.owner.userId}`);
                const ownerData = await ownerRes.json();
                ownerName = ownerData?.name || 'Inconnu';
            }

            const container = new ContainerBuilder().setAccentColor(0xFF4500);
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `## 👥 [${data.name}](https://www.roblox.com/groups/${groupId})\n` +
                            `${data.description || '*Aucune description*'}`
                        )
                    )
                    .setThumbnailAccessory(
                        icon
                            ? new ThumbnailBuilder().setURL(icon)
                            : new ThumbnailBuilder().setURL('https://cdn.discordapp.com/embed/avatars/0.png')
                    )
            );
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**🆔 ID :** \`${data.id}\` · **👑 Propriétaire :** ${ownerName}\n` +
                    `**👥 Membres :** ${data.memberCount} · **🌐 Public :** ${data.publicEntryAllowed ? 'Oui' : 'Non'}`
                )
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('-# Roblox Group Info')
            );

            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
            console.error(err);
            return message.reply('❌ Impossible de récupérer les infos du groupe.');
        }
    }
};
