const { EmbedBuilder } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'setantiraid',
    description: "Configure le système anti-raid du serveur",
    async execute(client, message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }

        const sub = args[0]?.toLowerCase();
        const guildId = message.guild.id;

        if (!sub || sub === 'help') {
            const prefix = guildConfig.get(guildId, 'prefix') || '+';
            return message.reply(
                `**📋 Sous-commandes disponibles :**\n` +
                `\`${prefix}setantiraid on/off\` — Activer/désactiver\n` +
                `\`${prefix}setantiraid config\` — Afficher la configuration\n` +
                `\`${prefix}setantiraid limit <n>\` — Nbre de messages avant sanction (défaut: 5)\n` +
                `\`${prefix}setantiraid interval <ms>\` — Fenêtre de temps en ms (défaut: 2000)\n` +
                `\`${prefix}setantiraid mute <minutes>\` — Durée du mute pallier 1 (défaut: 5)\n` +
                `\`${prefix}setantiraid joins <n>\` — Joins avant mode raid (défaut: 10)\n` +
                `\`${prefix}setantiraid invites on/off\` — Supprimer les invitations en mode raid\n` +
                `\`${prefix}setantiraid recovery <minutes>\` — Rétablissement automatique du niveau de vérification (défaut: 10)\n` +
                `\`${prefix}setantiraid unlock\` — Rétablir les permissions @everyone\n\n` +
                `**Gestion whitelist anti-raid :**\n` +
                `\`${prefix}addwhitelist @user|@role\` — Ajouter un membre ou un rôle à la whitelist\n` +
                `\`${prefix}suppwhitelist @user|@role\` — Retirer un membre ou un rôle de la whitelist\n` +
                `\`${prefix}whitelist\` — Afficher la whitelist actuelle\n\n` +
                `**Palliers de sanction (spam messages) :**\n` +
                `🔇 1ère violation → Mute\n` +
                `👢 2ème violation → Kick\n` +
                `🔨 3ème violation+ → Ban\n\n` +
                `**Détection raid de joins :**\n` +
                `Si trop de membres rejoignent en peu de temps → élévation du niveau de vérification + suppression des invitations + restriction des permissions @everyone`
            );
        }

        if (sub === 'on' || sub === 'off') {
            const enabled = sub === 'on';
            guildConfig.set(guildId, 'antiraidEnabled', enabled);
            return message.reply(`✅ Anti-Raid ${enabled ? '**activé**' : '**désactivé**'} sur ce serveur.`);
        }

        if (sub === 'config') {
            const cfg = guildConfig.getAll(guildId);
            const ar = cfg.antiraidConfig;
            const embed = new EmbedBuilder()
                .setTitle('🛡️ Configuration Anti-Raid')
                .setColor(cfg.antiraidEnabled ? '#00ff00' : '#ff0000')
                .addFields(
                    { name: 'État', value: cfg.antiraidEnabled ? '✅ Activé' : '❌ Désactivé', inline: true },
                    { name: '💬 Limite de messages', value: `${ar.spamLimit} messages`, inline: true },
                    { name: '⏱️ Fenêtre de temps', value: `${ar.spamInterval}ms`, inline: true },
                    { name: '🔇 Durée mute (pallier 1)', value: `${ar.muteDuration} min`, inline: true },
                    { name: '👢 Kick (pallier 2)', value: '2ème violation', inline: true },
                    { name: '🔨 Ban (pallier 3)', value: '3ème violation+', inline: true },
                        { name: '👥 Limite de joins (raid)', value: `${ar.joinLimit} membres`, inline: true },
                    { name: '⏱️ Fenêtre joins', value: `${ar.joinInterval / 1000}s`, inline: true },
                    { name: '🚫 Supprimer invitations', value: ar.disableInvites ? '✅ Oui' : '❌ Non', inline: true },
                    { name: '⏳ Restauration vérification', value: `${ar.raidRecovery} minutes`, inline: true },
                    { name: '🛡️ Whitelist anti-raid', value: `${(cfg.antiraidWhitelist?.users?.length || 0)} utilisateurs & ${(cfg.antiraidWhitelist?.roles?.length || 0)} rôles`, inline: true },
                )
                .setFooter({ text: `Utilisez ${guildConfig.get(guildId, 'prefix') || '+'}setantiraid help pour la liste des commandes` });
            return message.channel.send({ embeds: [embed] });
        }

        if (sub === 'limit') {
            const n = parseInt(args[1]);
            if (isNaN(n) || n < 2 || n > 50) return message.reply('❌ Valeur invalide (entre 2 et 50).');
            guildConfig.setNested(guildId, 'antiraidConfig', 'spamLimit', n);
            return message.reply(`✅ Limite de messages définie à **${n}**.`);
        }

        if (sub === 'interval') {
            const ms = parseInt(args[1]);
            if (isNaN(ms) || ms < 500 || ms > 30000) return message.reply('❌ Valeur invalide (entre 500 et 30000 ms).');
            guildConfig.setNested(guildId, 'antiraidConfig', 'spamInterval', ms);
            return message.reply(`✅ Fenêtre de temps définie à **${ms}ms**.`);
        }

        if (sub === 'mute') {
            const minutes = parseInt(args[1]);
            if (isNaN(minutes) || minutes < 1 || minutes > 1440) return message.reply('❌ Valeur invalide (entre 1 et 1440 minutes).');
            guildConfig.setNested(guildId, 'antiraidConfig', 'muteDuration', minutes);
            return message.reply(`✅ Durée du mute (pallier 1) définie à **${minutes} minutes**.`);
        }

        if (sub === 'joins') {
            const n = parseInt(args[1]);
            if (isNaN(n) || n < 2 || n > 100) return message.reply('❌ Valeur invalide (entre 2 et 100).');
            guildConfig.setNested(guildId, 'antiraidConfig', 'joinLimit', n);
            return message.reply(`✅ Limite de joins définie à **${n} membres**.`);
        }

        if (sub === 'invites') {
            const action = args[1]?.toLowerCase();
            if (!['on', 'off'].includes(action)) return message.reply('❌ Utilisez `invites on` ou `invites off`.');
            guildConfig.setNested(guildId, 'antiraidConfig', 'disableInvites', action === 'on');
            return message.reply(`✅ Suppression des invitations en mode raid : **${action === 'on' ? 'activée' : 'désactivée'}**.`);
        }

        if (sub === 'recovery') {
            const minutes = parseInt(args[1]);
            if (isNaN(minutes) || minutes < 1 || minutes > 180) return message.reply('❌ Valeur invalide (entre 1 et 180 minutes).');
            guildConfig.setNested(guildId, 'antiraidConfig', 'raidRecovery', minutes);
            return message.reply(`✅ Restauration automatique du niveau de vérification définie à **${minutes} minutes**.`);
        }

        if (sub === 'unlock') {
            try {
                const everyone = message.guild.roles.everyone;
                const channels = message.guild.channels.cache.filter(c => c.type === 0);
                let count = 0;
                for (const channel of channels.values()) {
                    await channel.permissionOverwrites.edit(everyone, {
                        SendMessages: null
                    }).catch(() => {});
                    count++;
                }
                return message.reply(`✅ Permissions @everyone rétablies sur **${count} salons**.`);
            } catch (err) {
                return message.reply(`❌ Erreur lors du rétablissement des permissions : ${err.message}`);
            }
        }

        message.reply(`❌ Sous-commande inconnue. Utilisez \`+setantiraid help\` pour la liste.`);
    }
};
