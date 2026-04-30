const { createCanvas, loadImage } = require('canvas');

module.exports = {
  name: 'pixel',

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

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext('2d');

      // important pour effet pixel
      ctx.imageSmoothingEnabled = false;

      const size = 16;

      // downscale puis upscale (effet pixel)
      ctx.drawImage(avatar, 0, 0, size, size);
      ctx.drawImage(
        canvas,
        0,
        0,
        size,
        size,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'pixel.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

