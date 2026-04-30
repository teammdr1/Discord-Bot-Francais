const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

registerFont(path.join(__dirname, '../../assets/fonts/arial.ttf'), {
  family: 'Arial'
});

module.exports = {
  name: '3ds',

  async execute(client, message, args) {
    try {
      const user =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0])?.user ||
        message.author;

      const avatarURL = user.displayAvatarURL({
        extension: 'png',
        size: 512
      });

      // Charger images
      const base = await loadImage(
        path.join(__dirname, '../../assets/images/3ds.png')
      );
      const avatar = await loadImage(avatarURL);

      // Canvas
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // Dessiner avatar (à adapter selon ton PNG)
      ctx.drawImage(avatar, 0, 0, 1387, 1365);

      // Overlay (le template 3ds)
      ctx.drawImage(base, 0, 0);

      // Envoyer
      await message.channel.send({
        files: [{
          attachment: canvas.toBuffer(),
          name: '3ds.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

