const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    name: "github",
    description: "Affiche un profil GitHub (Components V2)",

    async execute(client, message, args) {
        const username = args[0];

        if (!username) {
            return message.reply("❌ Fournis un nom d'utilisateur GitHub.");
        }

        try {
            // ─────────────────────────────
            // USER FETCH
            // ─────────────────────────────
            const res = await fetch(`https://api.github.com/users/${username}`);

            if (!res.ok) {
                return message.reply("❌ Utilisateur GitHub introuvable.");
            }

            const data = await res.json();

            // ─────────────────────────────
            // ORGS FETCH
            // ─────────────────────────────
            let orgsList = "Aucune";

            try {
                const orgsRes = await fetch(data.organizations_url);

                if (orgsRes.ok) {
                    const orgs = await orgsRes.json();
                    if (orgs.length > 0) {
                        orgsList = orgs.map(o => o.login).join(", ");
                    }
                }
            } catch {
                orgsList = "Aucune";
            }

            // ─────────────────────────────
            // CONTAINER V2
            // ─────────────────────────────
            const container = new ContainerBuilder()
                .setAccentColor(0x2B3137);

            // HEADER
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🧑‍💻 GitHub — ${data.login}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setDivider(true)
            );

            // INFO
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `👤 **Utilisateur :** ${data.login}\n` +
                    `🏢 **Entreprise :** ${data.company || "Aucune"}\n` +
                    `📍 **Localisation :** ${data.location || "Aucune"}\n` +
                    `📧 **Email :** ${data.email || "Aucune"}\n` +
                    `📦 **Organisations :** ${orgsList}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(1)
            );

            // BIO
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 📝 Bio\n${data.bio || "Aucune"}`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setDivider(true)
            );

            // STATS
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 📊 Stats\n` +
                    `📦 Repos : **${data.public_repos}**\n` +
                    `👥 Followers : **${data.followers}**\n` +
                    `➕ Following : **${data.following}**`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(1)
            );

            // DATES
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### 📅 Dates\n` +
                    `🆕 Créé : <t:${Math.floor(new Date(data.created_at).getTime() / 1000)}:F>\n` +
                    `🔄 MAJ : <t:${Math.floor(new Date(data.updated_at).getTime() / 1000)}:F>`
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder().setDivider(true)
            );

            // FOOTER
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `-# 🔗 ${data.html_url}`
                )
            );

            // ─────────────────────────────
            // BUTTONS
            // ─────────────────────────────
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("🔗 GitHub")
                    .setStyle(ButtonStyle.Link)
                    .setURL(data.html_url),

                new ButtonBuilder()
                    .setCustomId("github_refresh")
                    .setLabel("🔄 Refresh")
                    .setStyle(ButtonStyle.Secondary)
            );

            return message.channel.send({
                components: [container, row],
                flags: MessageFlags.IsComponentsV2,
            });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Erreur lors de la récupération du profil GitHub.");
        }
    }
};
