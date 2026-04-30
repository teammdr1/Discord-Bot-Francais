const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'panneaupub',

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
        path.join(__dirname, '../../assets/images/panneaupub.png')
      );
      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // background
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      // avatar dans le panneau
      ctx.drawImage(avatar, 28, 57, 227, 156);

      // (optionnel) texte si tu veux réactiver
      /*
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.font = 'bold 10pt Arial';
      ctx.fillStyle = 'white';
      */

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'panneaupub.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

