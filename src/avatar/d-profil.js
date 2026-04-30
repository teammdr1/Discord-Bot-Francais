const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

registerFont(
  path.join(__dirname, '../../assets/fonts/arial.ttf'),
  { family: 'arial' }
);

module.exports = {
  name: 'd-profil',

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
      const base = await loadImage(
        path.join(__dirname, '../../assets/images/d-profil.png')
      );

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // Avatar (petit carré)
      ctx.drawImage(avatar, 20, 20, 92, 92);

      // Background
      ctx.drawImage(base, 0, 0);

      // --- Texte username ---
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.font = 'bold 11pt arial';
      ctx.fillStyle = 'white';

      ctx.fillText(user.tag, 190, 40, 305);

      // --- Texte "cause" optionnel ---
      const cause = args.slice(1).join(' ');
      if (cause) {
        ctx.fillText(cause, 438, 910, 500);
      }

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      await message.channel.send({
        files: [{
          attachment: buffer,
          name: 'd-profil.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

