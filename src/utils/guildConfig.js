const fs = require('fs');
const path = require('path');

const GUILDS_DIR = path.join(__dirname, '../../data/guilds');

function ensureDir() {
  if (!fs.existsSync(GUILDS_DIR)) {
    fs.mkdirSync(GUILDS_DIR, { recursive: true });
  }
}

function getDefault() {
  return {
    prefix: '+',
    welcomeChannelId: null,
    logChannelId: null,
    soutienRoleId: null,
    soutienStatut: null,
    captchaEnabled: false,
    antiraidEnabled: false,
    muteRoleId: null,
    warnRoles: [],
    backupLink: null,
    serverDescription: null,
    antiraidConfig: {
      spamLimit: 5,
      spamInterval: 2000,
      muteDuration: 5,
      joinLimit: 10,
      joinInterval: 10000,
      disableInvites: true
    },
    ticketConfig: {
      panelDescription: 'Cliquez sur le bouton ci-dessous pour créer un ticket. Notre équipe vous répondra dans les meilleurs délais.',
      panelColor: '#5865F2',
      logChannelId: null,
      ticketCount: 0,
      categories: []
    }
  };
}

function getAll(guildId) {
  ensureDir();
  const filePath = path.join(GUILDS_DIR, `${guildId}.json`);
  if (!fs.existsSync(filePath)) return getDefault();
  try {
    const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const defaults = getDefault();
    return {
      ...defaults,
      ...saved,
      antiraidConfig: { ...defaults.antiraidConfig, ...(saved.antiraidConfig || {}) },
      ticketConfig: { ...defaults.ticketConfig, ...(saved.ticketConfig || {}), categories: (saved.ticketConfig?.categories || []) }
    };
  } catch {
    return getDefault();
  }
}

function get(guildId, key) {
  return getAll(guildId)[key];
}

function set(guildId, key, value) {
  ensureDir();
  const config = getAll(guildId);
  config[key] = value;
  fs.writeFileSync(path.join(GUILDS_DIR, `${guildId}.json`), JSON.stringify(config, null, 2));
}

function setMany(guildId, values) {
  ensureDir();
  const config = getAll(guildId);
  Object.assign(config, values);
  fs.writeFileSync(path.join(GUILDS_DIR, `${guildId}.json`), JSON.stringify(config, null, 2));
}

function setNested(guildId, key, subKey, value) {
  ensureDir();
  const config = getAll(guildId);
  if (!config[key]) config[key] = {};
  config[key][subKey] = value;
  fs.writeFileSync(path.join(GUILDS_DIR, `${guildId}.json`), JSON.stringify(config, null, 2));
}

module.exports = { get, set, setMany, setNested, getAll };
