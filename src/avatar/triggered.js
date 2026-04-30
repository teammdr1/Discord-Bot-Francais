const { createCanvas, loadImage } = require('canvas');
const coord1 = [-25, -33, -42, -14];
const coord2 = [-25, -13, -34, -10];

module.exports = {
  name: 'triggered',

  async execute(client, message, args) {
    return message.reply("Commande temporairement indisponible : dépendance GIF non installée.");
  }
};

