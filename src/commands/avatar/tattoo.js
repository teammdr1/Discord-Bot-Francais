const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'tattoo',

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

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/tattoo.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(base, 0, 0);

      // rotation propre isolée
      ctx.save();
      ctx.translate(0, 0);
      ctx.rotate(-10 * Math.PI / 180);
      ctx.drawImage(avatar, 84, 690, 300, 300);
      ctx.restore();

      return message.channel.send({
        files: [{
          attachment: canvas.toBuffer(),
          name: 'tattoo.png'
        }]
      });

    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

