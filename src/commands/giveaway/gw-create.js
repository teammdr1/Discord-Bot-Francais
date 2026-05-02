const { PermissionsBitField } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const gw = require('../../utils/giveawayManager');

function isManager(member, gcfg) {
    if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
    const mgr = gcfg.giveawayConfig?.managerRoles || [];
    return mgr.some(r => member.roles.cache.has(r));
}

module.exports = {
    name: 'gw-create',
    description: 'Crée un giveaway de façon interactive ou rapide.',
    async execute(client, message, args) {
        const gcfg = guildConfig.getAll(message.guild.id);
        if (!isManager(message.member, gcfg)) {
            return message.reply('❌ Vous devez avoir la permission **Gérer le serveur** ou être gestionnaire de giveaways.');
        }

        // Mode rapide : +gw-create <durée> <gagnants> <prix>
        if (args.length >= 3) {
            const durationMs = gw.parseDuration(args[0]);
            const winnersCount = parseInt(args[1]);
            const prize = args.slice(2).join(' ');

            if (!durationMs) return message.reply('❌ Durée invalide. Exemples : `1h`, `30m`, `2d`, `1j12h`');
            if (isNaN(winnersCount) || winnersCount < 1) return message.reply('❌ Nombre de gagnants invalide.');
            if (!prize) return message.reply('❌ Spécifiez un prix.');

            const endTime = Date.now() + durationMs;
            const gwcfg = gcfg.giveawayConfig || {};
            const targetChannel = gwcfg.defaultChannelId
                ? message.guild.channels.cache.get(gwcfg.defaultChannelId) || message.channel
                : message.channel;

            const giveaway = {
                guildId: message.guild.id,
                channelId: targetChannel.id,
                messageId: null,
                prize,
                description: null,
                hostId: message.author.id,
                winners: winnersCount,
                entries: [],
                requiredRoleId: null,
                notifRole: null,
                endTime,
                ended: false,
                winnerIds: [],
                color: gwcfg.defaultColor || '#F1C40F',
                image: null,
                thumbnail: null,
                createdAt: Date.now()
            };

            const embed = gw.buildGiveawayEmbed(giveaway);
            const row = gw.buildEntryRow(giveaway);

            const gwMsg = await targetChannel.send({ embeds: [embed], components: [row] });
            giveaway.messageId = gwMsg.id;
            gw.create(giveaway);

            if (gwcfg.notifRole) {
                const notif = gwcfg.notifRole === 'everyone' ? '@everyone' :
                              gwcfg.notifRole === 'here' ? '@here' : `<@&${gwcfg.notifRole}>`;
                gwMsg.channel.send({ content: `${notif} — 🎉 Un nouveau giveaway vient d'être lancé !`, allowedMentions: { parse: ['everyone', 'roles'] } }).catch(() => {});
            }

            if (targetChannel.id !== message.channel.id) {
                message.reply(`✅ Giveaway lancé dans ${targetChannel} !`);
            }
            return;
        }

        // Mode interactif : wizard
        const existing = gw.getDraft(message.guild.id, message.author.id);
        if (existing) {
            return message.reply('❌ Vous avez déjà un wizard de giveaway en cours. Terminez-le ou annulez-le d\'abord.');
        }

        const draft = gw.createDraft(message.guild.id, message.author.id, gcfg.giveawayConfig);
        const embed = gw.buildWizardEmbed(draft);
        const rows = gw.buildWizardRows(draft);

        const wizardMsg = await message.channel.send({ embeds: [embed], components: rows });
        draft.wizardMessageId = wizardMsg.id;
        draft.wizardChannelId = message.channel.id;
        gw.setDraft(message.guild.id, message.author.id, draft);

        await message.delete().catch(() => {});
    }
};
