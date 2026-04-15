const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const guildConfig = require('../utils/guildConfig');

module.exports = {
    name: 'owner',
    description: 'Gère les propriétaires du bot sur ce serveur (accès total aux commandes).',
    async execute(client, message, args) {
        const guildId = message.guild.id;
        const cfg = guildConfig.getAll(guildId);
        const botOwners = cfg.botOwners || [];
        const prefix = cfg.prefix || '+';

        const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
        const isBotOwner = botOwners.includes(message.author.id);

        if (!isAdmin && !isBotOwner) {
            return message.reply('❌ Réservé aux administrateurs ou aux owners du bot.');
        }

        const sub = args[0]?.toLowerCase();

        // ── +owner (liste) ──
        if (!sub || sub === 'list') {
            if (botOwners.length === 0) {
                return message.reply(`ℹ️ Aucun owner configuré.\nUtilisez \`${prefix}owner add @user\` pour en ajouter.`);
            }
            const embed = new EmbedBuilder()
                .setTitle('👑 Owners du Bot — ' + message.guild.name)
                .setColor('#F1C40F')
                .setDescription(
                    botOwners.map((id, i) => {
                        const member = message.guild.members.cache.get(id);
                        return `**${i + 1}.** ${member ? `${member}` : `<@${id}>`} \`${id}\``;
                    }).join('\n')
                )
                .addFields({
                    name: '📋 Droits accordés',
                    value: 'Les owners du bot ont accès à **toutes les commandes** (setup, tickets, giveaways, modération, logs, etc.) sans besoin de permissions Discord spécifiques.'
                })
                .setFooter({ text: `${botOwners.length} owner(s)` })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        // ── +owner add @user ──
        if (sub === 'add') {
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!target) return message.reply('❌ Mentionnez un membre ou donnez son ID.');
            if (target.user.bot) return message.reply('❌ Un bot ne peut pas être owner.');
            if (botOwners.includes(target.id)) return message.reply(`❌ ${target} est déjà owner.`);

            botOwners.push(target.id);
            guildConfig.set(guildId, 'botOwners', botOwners);

            const embed = new EmbedBuilder()
                .setTitle('👑 Owner Ajouté')
                .setColor('#57F287')
                .setDescription(`${target} est maintenant **owner du bot** sur ce serveur.`)
                .addFields({ name: '✅ Accès accordés', value: 'Toutes les commandes du bot sont débloquées pour ce membre.' })
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Par ${message.author.tag}` })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        // ── +owner remove @user ──
        if (sub === 'remove') {
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!target) return message.reply('❌ Mentionnez un membre ou donnez son ID.');
            if (!botOwners.includes(target.id)) return message.reply(`❌ ${target} n'est pas owner.`);
            if (target.id === message.author.id && !isAdmin)
                return message.reply('❌ Seul un admin peut vous retirer.');

            guildConfig.set(guildId, 'botOwners', botOwners.filter(id => id !== target.id));
            return message.reply(`✅ ${target} retiré des owners du bot.`);
        }

        // ── +owner clear ──
        if (sub === 'clear') {
            if (!isAdmin) return message.reply('❌ Seul un administrateur peut effacer tous les owners.');
            guildConfig.set(guildId, 'botOwners', []);
            return message.reply('✅ Tous les owners ont été supprimés.');
        }

        return message.reply(
            `**👑 Commandes Owner :**\n` +
            `\`${prefix}owner\` — Lister les owners\n` +
            `\`${prefix}owner add @user\` — Ajouter un owner\n` +
            `\`${prefix}owner remove @user\` — Retirer un owner\n` +
            `\`${prefix}owner clear\` — Tout effacer (admin uniquement)`
        );
    }
};
