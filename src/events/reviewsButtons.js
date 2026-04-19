const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/reviews.json');

module.exports = {
  name: 'interactionCreate',
  once: false,

  async execute(interaction) {

    // On filtre UNIQUEMENT les boutons
    if (!interaction.isButton()) return;

    // On filtre UNIQUEMENT les boutons review
    if (!interaction.customId.startsWith('review_delete_')) return;

    const userId = interaction.customId.split('_')[2];

    // Permission
    if (
      interaction.user.id !== userId &&
      !interaction.member.permissions.has('ManageMessages')
    ) {
      return interaction.reply({
        content: "Tu ne peux pas supprimer cet avis.",
        ephemeral: true
      });
    }

    // Charger JSON
    let data = {};
    if (fs.existsSync(DATA_PATH)) {
      data = JSON.parse(fs.readFileSync(DATA_PATH));
    }

    // Supprimer
    delete data[userId];
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    await interaction.message.delete();
  }
};
