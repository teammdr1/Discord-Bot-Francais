const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'thug-life',

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
        path.join(__dirname, '../../assets/images/thug-life.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(avatar, 0, 0);

      // grayscale (manuel, sans util externe)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imgData, 0, 0);

      // overlay thug life
      const ratio = base.width / base.height;
      const width = canvas.width / 2;
      const height = Math.round(width / ratio);

      ctx.drawImage(
        base,
        (canvas.width / 2) - (width / 2),
        canvas.height - height,
        width,
        height
      );

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      return message.channel.send({
        files: [{
          attachment: buffer,
          name: 'thug-life.png'
        }]
      });

    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

