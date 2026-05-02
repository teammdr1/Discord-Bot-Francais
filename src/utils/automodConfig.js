const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require('discord.js');
const guildConfig = require('./guildConfig');

const ACTIONS = ['delete', 'warn', 'mute', 'kick', 'ban'];

const MODULE_INFO = {
    antiinvite: { emoji: '🔗', label: 'Anti-Invitations', desc: 'Bloque les liens d\'invitation Discord' },
    antilink:   { emoji: '🌐', label: 'Anti-Liens',       desc: 'Bloque tous les liens URL' },
    antiwords:  { emoji: '🚫', label: 'Anti-Mots',        desc: 'Bloque les mots/phrases bannis' }
};

const ACTION_LABELS = {
    delete: '🗑️ Suppression seule',
    warn:   '⚠️ Suppression + Avertissement',
    mute:   '🔇 Suppression + Mute (10 min)',
    kick:   '👢 Suppression + Expulsion',
    ban:    '🔨 Suppression + Bannissement'
};

const DEFAULT_MODULE = {
    enabled: false,
    action: 'delete',
    logChannelId: null,
    whitelistRoles: [],
    whitelistChannels: [],
    whitelistUsers: [],
    managerRoles: []
};

function getAutomod(guildId) {
    const cfg = guildConfig.getAll(guildId);
    const am = cfg.automod || {};
    return {
        antiinvite: { ...DEFAULT_MODULE, ...(am.antiinvite || {}) },
        antilink:   { ...DEFAULT_MODULE, ...(am.antilink   || {}) },
        antiwords:  { ...DEFAULT_MODULE, words: [], ...(am.antiwords || {}) }
    };
}

function getModule(guildId, moduleName) {
    return getAutomod(guildId)[moduleName];
}

function setModule(guildId, moduleName, data) {
    const am = getAutomod(guildId);
    am[moduleName] = data;
    guildConfig.set(guildId, 'automod', am);
}

function setModuleField(guildId, moduleName, field, value) {
    const mod = getModule(guildId, moduleName);
    mod[field] = value;
    setModule(guildId, moduleName, mod);
}

function isManager(member, mod) {
    const cfg = guildConfig.getAll(member.guild.id);
    if (member.permissions.has('Administrator')) return true;
    if (member.permissions.has('ManageGuild')) return true;
    if ((cfg.botOwners || []).includes(member.id)) return true;
    if (mod?.managerRoles?.some(r => member.roles.cache.has(r))) return true;
    return false;
}

function isWhitelisted(message, mod) {
    if (!mod) return false;
    const roles = message.member?.roles?.cache?.map(r => r.id) || [];
    if (mod.whitelistRoles?.some(id => roles.includes(id))) return true;
    if (mod.whitelistChannels?.includes(message.channel.id)) return true;
    if (mod.whitelistUsers?.includes(message.author.id)) return true;
    return false;
}

function buildConfigContainer(moduleName, mod, guild) {
    const info = MODULE_INFO[moduleName];
    const container = new ContainerBuilder().setAccentColor(mod.enabled ? 0x57F287 : 0xED4245);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## ${info.emoji} ${info.label} — Configuration`)
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

    const logCh = mod.logChannelId ? `<#${mod.logChannelId}>` : '*Non configuré*';
    const wlRoles = mod.whitelistRoles?.length
        ? mod.whitelistRoles.map(id => `<@&${id}>`).join(', ') : '*Aucun*';
    const wlChannels = mod.whitelistChannels?.length
        ? mod.whitelistChannels.map(id => `<#${id}>`).join(', ') : '*Aucun*';
    const wlUsers = mod.whitelistUsers?.length
        ? mod.whitelistUsers.map(id => `<@${id}>`).join(', ') : '*Aucun*';
    const mgrs = mod.managerRoles?.length
        ? mod.managerRoles.map(id => `<@&${id}>`).join(', ')
        : '*Aucun (Gérer le serveur requis)*';

    let content =
        `**Statut :** ${mod.enabled ? '✅ Activé' : '❌ Désactivé'}\n` +
        `**Action :** ${ACTION_LABELS[mod.action] || mod.action}\n` +
        `**Salon de log :** ${logCh}\n\n` +
        `**🛡️ Exemptions**\n` +
        `• Rôles : ${wlRoles}\n` +
        `• Salons : ${wlChannels}\n` +
        `• Membres : ${wlUsers}\n\n` +
        `**⚙️ Rôles gestionnaires :** ${mgrs}`;

    if (moduleName === 'antiwords') {
        const words = mod.words?.length
            ? mod.words.map(w => `\`${w}\``).join(', ')
            : '*Aucun*';
        content += `\n\n**🚫 Mots bannis (${mod.words?.length || 0}) :**\n${words}`;
    }

    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));

    const cmd = `+${moduleName}`;
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `-# \`${cmd} on/off\` · \`${cmd} action <delete|warn|mute|kick|ban>\` · \`${cmd} whitelist role add @role\``
        )
    );
    return container;
}

module.exports = {
    getAutomod, getModule, setModule, setModuleField,
    isManager, isWhitelisted, buildConfigContainer,
    ACTIONS, MODULE_INFO, ACTION_LABELS
};
