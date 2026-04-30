const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

registerFont(path.join(__dirname, '../../assets/fonts/Noto-Regular.ttf'), { family: 'Noto' });

module.exports = {
  name: 'steam-carte',
  aliases: ['valve-carte'],

  async execute(client, message, args) {
    try {
      const user =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0])?.user ||
        message.author;

      const avatarURL = user.displayAvatarURL({
        extension: 'png',
        size: 256
      });

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/steam-carte.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // fond
      ctx.fillStyle = '#feb2c1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // avatar
      ctx.drawImage(avatar, 12, 19, 205, 205);

      // overlay
      ctx.drawImage(base, 0, 0);

      // pseudo (effet double texte)
      ctx.font = '14px Noto';
      ctx.fillStyle = 'black';
      ctx.fillText(user.username, 16, 25);

      ctx.fillStyle = 'white';
      ctx.fillText(user.username, 15, 24);

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      return message.channel.send({
        files: [{
          attachment: buffer,
          name: 'steam-carte.png'
        }]
      });

    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

