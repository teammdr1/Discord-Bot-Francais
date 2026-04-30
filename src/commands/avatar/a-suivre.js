const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'a-suivre',

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
      const avatar = await loadImage(avatarURL);
      const base = await loadImage(
        path.join(__dirname, '../../assets/images/a-suivre.png')
      );

      // Canvas
      const canvas = createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext('2d');

      // Avatar
      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

      // Overlay "À suivre"
      const ratio = base.width / base.height;
      const width = canvas.width / 2;
      const height = Math.round(width / ratio);

      ctx.drawImage(
        base,
        0,
        canvas.height - height,
        width,
        height
      );

      // Buffer
      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'a-suivre.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

