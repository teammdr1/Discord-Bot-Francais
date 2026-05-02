const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getAutomod, isWhitelisted } = require('../utils/automodConfig');
const { sendLog } = require('../utils/logHelper');

// ─── Regex ───
const INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:discord(?:app)?\.(?:gg|com\/invite)\/[a-zA-Z0-9-]+)/gi;
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>\"]{2,}/gi;

// ─── Warnings ───
const WARNINGS_FILE = path.join(__dirname, '../../data/warnings.json');

function addWarning(guildId, userId, reason) {
    let data = {};
    if (fs.existsSync(WARNINGS_FILE)) {
        try { data = JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8')); } catch {}
    }
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][userId]) data[guildId][userId] = [];
    data[guildId][userId].push({ reason, moderator: 'AutoMod', timestamp: Date.now() });
    try { fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2)); } catch {}
}

// ─── Labels ───
const ACTION_COLORS = {
    delete: 0x99AAB5,
    warn:   0xFEE75C,
    mute:   0xF04747,
    kick:   0xED4245,
    ban:    0x36393F
};
const ACTION_LABELS = {
    delete: '🗑️ Message supprimé',
    warn:   '⚠️ Averti',
    mute:   '🔇 Muté 10 min',
    kick:   '👢 Expulsé',
    ban:    '🔨 Banni'
};
const MODULE_LABELS = {
    antiinvite: '🔗 Anti-Invitations',
    antilink:   '🌐 Anti-Liens',
    antiwords:  '🚫 Anti-Mots'
};

// ─── Action principale ───
async function takeAction(message, mod, moduleName, reason) {
    const { action } = mod;
    const member = message.member;
    const guild = message.guild;

    // Suppression du message
    try { await message.delete(); } catch {}

    // Sanction
    if (member) {
        if (action === 'warn') {
            addWarning(guild.id, member.id, `AutoMod (${moduleName}): ${reason}`);
            try { await member.send(`⚠️ Avertissement sur **${guild.name}**\n**Raison :** ${reason}`); } catch {}
        } else if (action === 'mute') {
            if (member.moderatable) {
                try {
                    await member.timeout(10 * 60 * 1000, `AutoMod: ${reason}`);
                    try { await member.send(`🔇 Vous avez été muté 10 min sur **${guild.name}**\n**Raison :** ${reason}`); } catch {}
                } catch {}
            }
        } else if (action === 'kick') {
            if (member.kickable) {
                try { await member.send(`👢 Vous avez été expulsé de **${guild.name}**\n**Raison :** ${reason}`); } catch {}
                try { await member.kick(`AutoMod: ${reason}`); } catch {}
            }
        } else if (action === 'ban') {
            if (member.bannable) {
                try { await member.send(`🔨 Vous avez été banni de **${guild.name}**\n**Raison :** ${reason}`); } catch {}
                try { await guild.members.ban(member.id, { reason: `AutoMod: ${reason}`, deleteMessageSeconds: 60 }); } catch {}
            }
        }
    }

    // ─── Container de log ───
    const container = new ContainerBuilder().setAccentColor(ACTION_COLORS[action] || 0x99AAB5);
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🛡️ AutoMod — ${MODULE_LABELS[moduleName]}`)
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

    const preview = (message.content || '*Vide*').slice(0, 400);
    const section = new SectionBuilder();
    section.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**👤 Membre :** ${message.author.tag} \`${message.author.id}\`\n` +
            `**📌 Salon :** <#${message.channel.id}>\n` +
            `**⚡ Action :** ${ACTION_LABELS[action] || action}\n` +
            `**🔍 Raison :** ${reason}\n\n` +
            `**📝 Message :**\n> ${preview}`
        )
    );
    section.setThumbnailAccessory(
        new ThumbnailBuilder().setURL(message.author.displayAvatarURL({ dynamic: true }))
    );
    container.addSectionComponents(section);
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`)
    );

    // Log dans le salon dédié du module
    if (mod.logChannelId) {
        const logCh = guild.channels.cache.get(mod.logChannelId);
        if (logCh) logCh.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

    // Log global modération
    await sendLog(guild, 'moderation', container);
}

// ─── Gestionnaire ───
module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (!message.guild || message.author?.bot) return;
        if (!message.content?.trim()) return;
        if (!message.member) return;

        const automod = getAutomod(message.guild.id);
        const content = message.content;

        // 1. Anti-Invitations
        const inv = automod.antiinvite;
        if (inv?.enabled && !isWhitelisted(message, inv)) {
            INVITE_REGEX.lastIndex = 0;
            if (INVITE_REGEX.test(content)) {
                await takeAction(message, inv, 'antiinvite', 'Invitation Discord détectée');
                return;
            }
        }

        // 2. Anti-Liens (après anti-invitations pour éviter double-déclenchement)
        const al = automod.antilink;
        if (al?.enabled && !isWhitelisted(message, al)) {
            URL_REGEX.lastIndex = 0;
            if (URL_REGEX.test(content)) {
                await takeAction(message, al, 'antilink', 'Lien URL détecté');
                return;
            }
        }

        // 3. Anti-Mots
        const aw = automod.antiwords;
        if (aw?.enabled && aw.words?.length > 0 && !isWhitelisted(message, aw)) {
            const lower = content.toLowerCase();
            const found = aw.words.find(w => lower.includes(w.toLowerCase()));
            if (found) {
                await takeAction(message, aw, 'antiwords', `Mot banni : "${found}"`);
                return;
            }
        }
    }
};
