const { createCanvas, loadImage } = require('canvas');
const path = require('path');
module.exports = {
  name: 'sora-selfie',

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
        path.join(__dirname, '../../assets/images/sora-selfie.png')
      );

      const fetchRes = await fetch(avatarURL);
      const avatarBuffer = Buffer.from(await fetchRes.arrayBuffer());
      const avatar = await loadImage(avatarBuffer);
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // fond noir
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // centrage avatar (même logique que ton code original)
      const ratio = avatar.width / avatar.height;
      const width = Math.round(base.height * ratio);

      ctx.drawImage(
        avatar,
        (canvas.width / 2) - (width / 2),
        0,
        width,
        canvas.height
      );

      ctx.drawImage(base, 0, 0);

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024) {
        return message.reply("L'image dépasse 8 Mo.");
      }

      return message.channel.send({
        files: [{
          attachment: buffer,
          name: 'sora-selfie.png'
        }]
      });

    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

