const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

registerFont(
  path.join(__dirname, '../../assets/fonts/arial.ttf'),
  { family: 'Arial' }
);

module.exports = {
  name: 'tf1',

  async execute(client, message, args) {
    try {
      const user =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0])?.user ||
        message.author;

      const cause = args.slice(1).join(' ');

      const avatarURL = user.displayAvatarURL({
        extension: 'png',
        size: 512
      });

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/tf1.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(base, 0, 0);

      // avatar
      ctx.drawImage(avatar, 254, 13, 122, 122);

      // texte
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.font = 'bold 10pt Arial';
      ctx.fillStyle = 'white';

      ctx.fillText(user.tag, 230, 166, 305);

      // cause optionnelle
      if (cause) {
        ctx.font = '9pt Arial';
        ctx.fillText(cause, 230, 190, 300);
      }

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      return message.channel.send({
        files: [{
          attachment: buffer,
          name: 'tf1.png'
        }]
      });

    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

