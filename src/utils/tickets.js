const fs = require('fs');
const path = require('path');

const TICKETS_FILE = path.join(__dirname, '../../data/tickets.json');

function load() {
  if (!fs.existsSync(TICKETS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8')); } catch { return {}; }
}

function save(data) {
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(data, null, 2));
}

function get(channelId) {
  return load()[channelId] || null;
}

function create(channelId, data) {
  const all = load();
  all[channelId] = data;
  save(all);
}

function update(channelId, fields) {
  const all = load();
  if (!all[channelId]) return;
  Object.assign(all[channelId], fields);
  save(all);
}

function remove(channelId) {
  const all = load();
  delete all[channelId];
  save(all);
}

function getAll() {
  return load();
}

module.exports = { get, create, update, remove, getAll };
