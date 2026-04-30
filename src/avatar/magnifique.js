const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'magnifique',

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
        path.join(__dirname, '../../assets/images/magnifique.png')
      );
      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // fond blanc (comme original)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // avatars (positions fixes style template)
      ctx.drawImage(avatar, 249, 24, 105, 105);
      ctx.drawImage(avatar, 249, 223, 105, 105);

      // overlay final
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'magnifique.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

