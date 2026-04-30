const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'ps1',

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
        path.join(__dirname, '../../assets/images/ps1.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // IMPORTANT : ordre correct (avatar avant overlay)
      ctx.drawImage(avatar, 0, 0, 639, 547);

      // effet gris sur zone spécifique (PS1 style)
      const imageData = ctx.getImageData(70, 399, 500, 500);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg =
          (imageData.data[i] +
            imageData.data[i + 1] +
            imageData.data[i + 2]) /
          3;

        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 70, 399);

      // overlay final
      ctx.drawImage(base, 0, 0);

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'ps1.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

