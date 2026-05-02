const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require("discord.js");

module.exports = {
    name: "insta",

    async execute(client, message, args) {
        const name = args.join(" ");

        if (!name) {
            return message.reply("❌ Donne un nom Instagram.");
        }

        try {
            const res = await fetch(`https://www.instagram.com/${name}/?__a=1&__d=dis`);
            const text = await res.text();

            // ─────────────────────────────
            // TRY JSON PARSE (old method)
            // ─────────────────────────────
            let user = null;

            try {
                const json = JSON.parse(text.match(/\{.*\}/s)?.[0]);
                user = json?.graphql?.user;
            } catch {}

            // ─────────────────────────────
            // FALLBACK HTML PARSING
            // ─────────────────────────────
            if (!user) {
                const titleMatch = text.match(/<title>(.*?)<\/title>/);

                const container = new ContainerBuilder()
                    .setAccentColor(0x2F3136);

                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `## 📸 Instagram — ${name}`
                    )
                );

                container.addSeparatorComponents(
                    new SeparatorBuilder().setDivider(true)
                );

                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `❌ Impossible de récupérer les données complètes.\n\n` +
                        `👉 Profil peut être privé ou protégé par Instagram.\n\n` +
                        `🔗 https://instagram.com/${name}`
                    )
                );

                if (titleMatch) {
                    container.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(1)
                    );

                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `ℹ️ Info page : ${titleMatch[1]}`
                        )
                    );
                }

                return message.channel.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2,
                });
            }

            // ─────────────────────────────
            // NORMAL DISPLAY
            // ─────────────────────────────
            const container = new ContainerBuilder()
                .setAccentColor(0x2F3136);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 📸 Instagram — ${user.username}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setDivider(true)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `👤 **Nom :** ${user.username}\n` +
                    `🏷️ **Pseudo :** ${user.full_name || "Aucun"}\n` +
                    `🔐 **Privé :** ${user.is_private ? "Oui" : "Non"}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(1)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 📝 Bio\n${user.biography || "Aucune"}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setDivider(true)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 📊 Stats\n` +
                    `📦 Posts : **${user.edge_owner_to_timeline_media.count}**\n` +
                    `👥 Abonnés : **${user.edge_followed_by.count}**\n` +
                    `➕ Abonnements : **${user.edge_follow.count}**`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(1)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `-# 🔗 https://instagram.com/${name}`
                )
            );

            return message.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Erreur Instagram.");
        }
    }
};
