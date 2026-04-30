const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'pokedex',

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
        path.join(__dirname, '../../assets/images/pokedex.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // fond
      ctx.drawImage(base, 0, 0);

      // IMPORTANT : rotation propre (sinon ça casse tout le canvas)
      const angle = -11 * (Math.PI / 180);

      const x = 234;
      const y = 274;
      const size = 225;

      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);
      ctx.rotate(angle);

      ctx.drawImage(avatar, -size / 2, -size / 2, size, size);

      ctx.restore();

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'pokedex.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

