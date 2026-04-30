const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'approuver',

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
        path.join(__dirname, '../../assets/images/approuver.png')
      );

      // Canvas
      const canvas = createCanvas(avatar.width, avatar.height);
      const ctx = canvas.getContext('2d');

      // Avatar
      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

      // --- Centrer l'overlay (remplace centerImage) ---
      const scale = Math.min(
        canvas.width / base.width,
        canvas.height / base.height
      );

      const width = base.width * scale;
      const height = base.height * scale;

      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      ctx.drawImage(base, x, y, width, height);

      // Buffer
      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'approuver.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

