const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

registerFont(
  path.join(__dirname, '../../assets/fonts/CoffinStone-vmmZL.otf'),
  { family: 'Coffin Stone' }
);

module.exports = {
  name: 'rip',

  async execute(client, message, args) {
    try {
      const member =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.author;

      const cause = args.slice(1).join(' ') || '';

      const avatarURL = member.displayAvatarURL({
        extension: 'png',
        size: 512
      });

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/rip.png')
      );

      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // background + avatar
      ctx.drawImage(base, 0, 0);
      ctx.drawImage(avatar, 194, 399, 500, 500);

      // noir & blanc (manuel simple)
      const imageData = ctx.getImageData(194, 399, 500, 500);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 194, 399);

      // text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      ctx.fillStyle = 'black';
      ctx.font = '62px Coffin Stone';
      ctx.fillText(member.username, 438, 330, 500);

      ctx.fillStyle = 'white';
      ctx.font = '37px Coffin Stone';
      ctx.fillText('A la mémoire de', 438, 292);

      if (cause) {
        ctx.fillText(cause, 438, 910, 500);
      }

      const buffer = canvas.toBuffer();

      if (buffer.length > 8 * 1024 * 1024)
        return message.reply("Image trop lourde.");

      return message.channel.send({
        files: [{ attachment: buffer, name: 'rip.png' }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur génération RIP.");
    }
  }
};

