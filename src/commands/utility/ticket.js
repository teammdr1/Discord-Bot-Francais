const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    PermissionsBitField,
} = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const { randomUUID } = require('crypto');

function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20);
}

function getCat(categories, name) {
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
}

// ═══════════════════════════════════════════
// PANEL TICKETS — Components V2
// ═══════════════════════════════════════════
async function sendPanel(channel, guild) {
    const cfg = guildConfig.getAll(guild.id);
    const tc  = cfg.ticketConfig;

    if (!tc.categories || tc.categories.length === 0) {
        throw new Error('Aucune catégorie de ticket configurée. Utilisez `+ticket addcat <nom>`.');
    }

    const iconURL = guild.iconURL({ dynamic: true, size: 256 })
        || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const accent  = parseInt((tc.panelColor || '#5865F2').replace('#', ''), 16);

    const container = new ContainerBuilder().setAccentColor(isNaN(accent) ? 0x5865F2 : accent);

    // ── En-tête ──
    container.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## 🎫 Support — ${guild.name}\n` +
                    (tc.panelDescription || 'Choisissez une catégorie pour ouvrir un ticket.')
                )
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(iconURL)
            )
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

    // ── Catégories ──
    const catText = tc.categories
        .map(cat => `${cat.emoji || '🎫'} **${cat.name}**\n${cat.description || 'Ouvrir un ticket.'}`)
        .join('\n\n');

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(catText + '\n\n👇 **Sélectionnez une catégorie ci-dessous**')
    );

    // ── Bouton ou select menu ──
    if (tc.categories.length === 1) {
        const cat = tc.categories[0];
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_create_${cat.id}`)
                    .setLabel('Créer un ticket')
                    .setEmoji(cat.emoji || '🎫')
                    .setStyle(ButtonStyle.Primary)
            )
        );
    } else {
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_select_category')
                    .setPlaceholder('Choisir une catégorie...')
                    .addOptions(
                        tc.categories.map(cat => ({
                            label: cat.name,
                            value: cat.id,
                            description: cat.description?.slice(0, 80) || 'Ouvrir un ticket',
                            emoji: cat.emoji || '🎫',
                        }))
                    )
            )
        );
    }

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${guild.name} · Système de tickets`)
    );

    return channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// ═══════════════════════════════════════════
// COMMANDE +ticket
// ═══════════════════════════════════════════
module.exports = {
    name: 'ticket',
    description: 'Gestion du système de tickets',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour configurer les tickets.');
        }

        const sub    = args[0]?.toLowerCase();
        const guildId = message.guild.id;
        const cfg    = guildConfig.getAll(guildId);
        const tc     = cfg.ticketConfig;
        const prefix = cfg.prefix || '+';

        // ── panel ──
        if (sub === 'panel') {
            const targetChannel = message.mentions.channels.first() || message.channel;
            try {
                await sendPanel(targetChannel, message.guild);
                if (targetChannel.id !== message.channel.id) {
                    message.reply(`✅ Panneau de tickets envoyé dans ${targetChannel}.`);
                }
            } catch (err) {
                message.reply(`❌ ${err.message}`);
            }
            return;
        }

        // ── addcat ──
        if (sub === 'addcat') {
            const name = args[1];
            if (!name) return message.reply(`❌ Utilisez : \`${prefix}ticket addcat <nom> [emoji] [description]\``);
            if (getCat(tc.categories, name)) return message.reply('❌ Cette catégorie existe déjà.');

            let emoji = null;
            let description = '';
            const possibleEmoji = args[2];

            if (possibleEmoji && (/^<a?:\w+:\d+>$/.test(possibleEmoji) || /\p{Extended_Pictographic}/u.test(possibleEmoji))) {
                emoji = possibleEmoji;
                description = args.slice(3).join(' ');
            } else {
                description = args.slice(2).join(' ');
            }

            const newCat = {
                id: randomUUID().slice(0, 8),
                name,
                emoji,
                description: description || 'Ouvrir un ticket pour cette catégorie.',
                staffRoles: [],
                discordCategoryId: null,
            };

            tc.categories.push(newCat);
            guildConfig.setNested(guildId, 'ticketConfig', 'categories', tc.categories);
            return message.reply(
                `✅ Catégorie **${name}** créée.\nConfigurez-la avec :\n` +
                `- \`${prefix}ticket setrole ${name} @Role\` — accès staff\n` +
                `- \`${prefix}ticket setcategory ${name} <ID>\` — catégorie Discord\n` +
                `- \`${prefix}ticket setdesc ${name} <texte>\` — description`
            );
        }

        // ── removecat ──
        if (sub === 'removecat') {
            const name = args.slice(1).join(' ');
            if (!name) return message.reply(`❌ Utilisez : \`${prefix}ticket removecat <nom>\``);
            const idx = tc.categories.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
            if (idx === -1) return message.reply('❌ Catégorie introuvable.');
            tc.categories.splice(idx, 1);
            guildConfig.setNested(guildId, 'ticketConfig', 'categories', tc.categories);
            return message.reply(`✅ Catégorie **${name}** supprimée.`);
        }

        // ── setrole ──
        if (sub === 'setrole') {
            const role    = message.mentions.roles.first();
            const catName = args.slice(1, -1).join(' ') || args[1];
            if (!role) return message.reply(`❌ Utilisez : \`${prefix}ticket setrole <catégorie> @Role\``);
            const cat = getCat(tc.categories, catName);
            if (!cat) return message.reply('❌ Catégorie introuvable. Vérifiez avec `+ticket config`.');
            if (!cat.staffRoles.includes(role.id)) cat.staffRoles.push(role.id);
            guildConfig.setNested(guildId, 'ticketConfig', 'categories', tc.categories);
            return message.reply(`✅ ${role} peut maintenant accéder aux tickets **${cat.name}**.`);
        }

        // ── removerole ──
        if (sub === 'removerole') {
            const role    = message.mentions.roles.first();
            const catName = args.slice(1, -1).join(' ') || args[1];
            if (!role) return message.reply(`❌ Utilisez : \`${prefix}ticket removerole <catégorie> @Role\``);
            const cat = getCat(tc.categories, catName);
            if (!cat) return message.reply('❌ Catégorie introuvable.');
            cat.staffRoles = cat.staffRoles.filter(id => id !== role.id);
            guildConfig.setNested(guildId, 'ticketConfig', 'categories', tc.categories);
            return message.reply(`✅ ${role} n'a plus accès aux tickets **${cat.name}**.`);
        }

        // ── setcategory ──
        if (sub === 'setcategory') {
            const catName      = args[1];
            const discordCatId = args[2];
            if (!catName || !discordCatId) return message.reply(`❌ Utilisez : \`${prefix}ticket setcategory <nom> <ID-catégorie-Discord>\``);
            const cat = getCat(tc.categories, catName);
            if (!cat) return message.reply('❌ Catégorie de ticket introuvable.');
            const discordCat = message.guild.channels.cache.get(discordCatId);
            if (!discordCat || discordCat.type !== 4) return message.reply('❌ ID de catégorie Discord invalide.');
            cat.discordCategoryId = discordCatId;
            guildConfig.setNested(guildId, 'ticketConfig', 'categories', tc.categories);
            return message.reply(`✅ Les tickets **${cat.name}** seront créés dans **${discordCat.name}**.`);
        }

        // ── setdesc ──
        if (sub === 'setdesc') {
            const second = args[1];
            const cat    = second ? getCat(tc.categories, second) : null;
            if (cat) {
                const desc = args.slice(2).join(' ');
                if (!desc) return message.reply(`❌ Fournissez une description.`);
                cat.description = desc;
                guildConfig.setNested(guildId, 'ticketConfig', 'categories', tc.categories);
                return message.reply(`✅ Description de **${cat.name}** mise à jour.`);
            }
            const desc = args.slice(1).join(' ');
            if (!desc) return message.reply(`❌ Fournissez une description.`);
            guildConfig.setNested(guildId, 'ticketConfig', 'panelDescription', desc);
            return message.reply('✅ Description du panneau mise à jour.');
        }

        // ── setcolor ──
        if (sub === 'setcolor') {
            const color = args[1];
            if (!color || !color.match(/^#[0-9a-fA-F]{6}$/)) return message.reply(`❌ Ex : \`${prefix}ticket setcolor #5865F2\``);
            guildConfig.setNested(guildId, 'ticketConfig', 'panelColor', color);
            return message.reply(`✅ Couleur définie sur \`${color}\`.`);
        }

        // ── setlog ──
        if (sub === 'setlog') {
            const channel = message.mentions.channels.first();
            if (!channel) return message.reply(`❌ Mentionnez un salon. Ex : \`${prefix}ticket setlog #logs-tickets\``);
            guildConfig.setNested(guildId, 'ticketConfig', 'logChannelId', channel.id);
            return message.reply(`✅ Logs des tickets définis sur ${channel}.`);
        }

        // ── config — Components V2 ──
        if (sub === 'config') {
            const logCh   = tc.logChannelId ? `<#${tc.logChannelId}>` : '*Non configuré*';
            const accent  = parseInt((tc.panelColor || '#5865F2').replace('#', ''), 16);

            const container = new ContainerBuilder().setAccentColor(isNaN(accent) ? 0x5865F2 : accent);

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## 🎫 Configuration des Tickets')
            );
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `📋 **Logs :** ${logCh}\n` +
                    `🎨 **Couleur :** \`${tc.panelColor || '#5865F2'}\`\n` +
                    `📝 **Description :** ${tc.panelDescription?.slice(0, 200) || '*Aucune*'}`
                )
            );

            if (tc.categories.length > 0) {
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`### 📂 Catégories (${tc.categories.length})`)
                );
                for (const cat of tc.categories) {
                    const roles      = cat.staffRoles.length > 0 ? cat.staffRoles.map(r => `<@&${r}>`).join(' ') : '*Aucun*';
                    const discordCat = cat.discordCategoryId ? `<#${cat.discordCategoryId}>` : '*Non définie*';
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `**${cat.emoji || '🎫'} ${cat.name}** · \`${cat.id}\`\n` +
                            `Rôles staff : ${roles}\n` +
                            `Catégorie Discord : ${discordCat}\n` +
                            `Description : *${cat.description || 'Aucune'}*`
                        )
                    );
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1));
                }
            } else {
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('*Aucune catégorie configurée.*')
                );
            }

            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# \`${prefix}ticket panel\` — envoyer le panneau dans un salon`)
            );

            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        // ── aide ──
        return message.reply(
            `**🎫 Système de Tickets — Commandes :**\n` +
            `\`${prefix}ticket panel [#salon]\` — Envoyer le panneau\n` +
            `\`${prefix}ticket addcat <nom> [emoji] [desc]\` — Créer une catégorie\n` +
            `\`${prefix}ticket removecat <nom>\` — Supprimer une catégorie\n` +
            `\`${prefix}ticket setrole <cat> @Role\` — Accès staff\n` +
            `\`${prefix}ticket removerole <cat> @Role\` — Retirer un rôle staff\n` +
            `\`${prefix}ticket setcategory <cat> <ID>\` — Catégorie Discord\n` +
            `\`${prefix}ticket setdesc [cat] <texte>\` — Description\n` +
            `\`${prefix}ticket setcolor <#hex>\` — Couleur\n` +
            `\`${prefix}ticket setlog #salon\` — Logs\n` +
            `\`${prefix}ticket config\` — Voir la configuration`
        );
    },
};
