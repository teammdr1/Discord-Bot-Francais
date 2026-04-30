const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'kyon-flingue',

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
        path.join(__dirname, '../../assets/images/kyon-flingue.png')
      );
      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // fond noir
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- avatar centré avec ratio ---
      const ratio = avatar.width / avatar.height;
      const width = Math.round(canvas.height * ratio);
      const x = (canvas.width / 2) - (width / 2);

      ctx.drawImage(avatar, x, 0, width, canvas.height);

      // overlay (Kyon + flingue)
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'kyon-flingue.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

