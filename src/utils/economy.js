const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/economy.json");

function loadData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8") || "{}");
  } catch (error) {
    console.error("Impossible de lire economy.json :", error);
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Impossible de sauvegarder economy.json :", error);
  }
}

function getUser(userId) {
  const data = loadData();

  if (!data[userId]) {
    data[userId] = {
      cash: 0,
      bank: 0,
      totalEarned: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0,
      inventory: [],
      stats: {
        workCount: 0,
        dailyCount: 0,
        robSuccess: 0,
        robFailed: 0
      }
    };
    saveData(data);
  }

  return data[userId];
}

function updateUser(userId, changes) {
  const data = loadData();
  data[userId] = {
    ...getUser(userId),
    ...changes,
  };
  saveData(data);
  return data[userId];
}

function addCash(userId, amount) {
  const user = getUser(userId);
  user.cash += amount;
  user.totalEarned += Math.max(0, amount);
  updateUser(userId, user);
  return user;
}

function removeCash(userId, amount) {
  const user = getUser(userId);
  if (user.cash < amount) return false;
  user.cash -= amount;
  updateUser(userId, user);
  return user;
}

function deposit(userId, amount) {
  const user = getUser(userId);
  if (user.cash < amount) return false;
  user.cash -= amount;
  user.bank += amount;
  updateUser(userId, user);
  return user;
}

function withdraw(userId, amount) {
  const user = getUser(userId);
  if (user.bank < amount) return false;
  user.bank -= amount;
  user.cash += amount;
  updateUser(userId, user);
  return user;
}

function transfer(fromId, toId, amount) {
  const fromUser = getUser(fromId);
  if (fromUser.cash < amount) return false;

  fromUser.cash -= amount;
  updateUser(fromId, fromUser);

  const toUser = getUser(toId);
  toUser.cash += amount;
  updateUser(toId, toUser);

  return true;
}

function getLeaderboard(limit = 10) {
  const data = loadData();
  return Object.entries(data)
    .map(([id, user]) => ({
      id,
      total: (user.cash || 0) + (user.bank || 0),
      cash: user.cash || 0,
      bank: user.bank || 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

function getUserData(userId) {
  return getUser(userId);
}

function updateStats(userId, statName, increment = 1) {
  const user = getUser(userId);
  if (!user.stats) user.stats = {};
  user.stats[statName] = (user.stats[statName] || 0) + increment;
  updateUser(userId, user);
  return user;
}

function getStats(userId) {
  const user = getUser(userId);
  return {
    cash: user.cash,
    bank: user.bank,
    total: user.cash + user.bank,
    totalEarned: user.totalEarned || 0,
    workCount: user.stats?.workCount || 0,
    dailyCount: user.stats?.dailyCount || 0,
    robSuccess: user.stats?.robSuccess || 0,
    robFailed: user.stats?.robFailed || 0
  };
}

function getUserStats(userId) {
  const user = getUser(userId);
  return {
    level: Math.floor((user.stats?.workCount || 0) / 10) + 1,
    workCount: user.stats?.workCount || 0,
    dailyCount: user.stats?.dailyCount || 0,
    successfulRobberies: user.stats?.successfulRobberies || 0,
    failedRobberies: user.stats?.failedRobberies || 0,
    timesRobbed: user.stats?.timesRobbed || 0,
    slotsWins: user.stats?.slotsWins || 0,
    slotsLosses: user.stats?.slotsLosses || 0,
    coinflipWins: user.stats?.coinflipWins || 0,
    coinflipLosses: user.stats?.coinflipLosses || 0,
    total: user.cash + user.bank,
    totalEarned: user.totalEarned || 0
  };
}

module.exports = {
  getUser,
  updateUser,
  addCash,
  removeCash,
  deposit,
  withdraw,
  transfer,
  getLeaderboard,
  getStats,
  getUserData,
  updateStats,
  getUserStats,
  loadData,
  saveData
};
