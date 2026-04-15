const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const slashFiles = fs.readdirSync(path.join(__dirname, '../slashCommands')).filter(file => file.endsWith('.js'));

  for (const file of slashFiles) {
    const command = require(`../slashCommands/${file}`);
    if (command.data && command.data.name) {
      client.slashCommands.set(command.data.name, command);
      console.log(`Slash command loaded: ${command.data.name}`);
    } else {
      console.log(`❌ Slash command invalid in file ${file}`);
    }
  }
};
