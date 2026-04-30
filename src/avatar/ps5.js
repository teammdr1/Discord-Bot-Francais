const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'ps5',

  async execute(client, message, args) {
    try {
      const member =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.author;

      const avatarURL = member.displayAvatarURL({
        extension: 'png',
        size: 512
      });

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/ps5.png')
      );
      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // avatar (ajusté comme ton original)
      ctx.drawImage(avatar, 6, 147, 810, 893);

      // overlay UI PS5
      ctx.drawImage(base, 0, 0);

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024)
        return message.reply("Image trop lourde.");

      return message.channel.send({
        files: [{ attachment: buffer, name: 'ps5.png' }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur génération PS5.");
    }
  }
};

