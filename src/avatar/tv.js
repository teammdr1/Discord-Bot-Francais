const { createCanvas, loadImage } = require('canvas');
const path = require('path');
module.exports = {
  name: 'tv',

  async execute(client, message, args) {
    try {
      const member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.member;

      const avatarURL = member.user.displayAvatarURL({
        extension: 'png',
        size: 512
      });

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/tv.png')
      );

      const fetchRes = await fetch(avatarURL);
      const avatarBuffer = Buffer.from(await fetchRes.arrayBuffer());
      const avatar = await loadImage(avatarBuffer);
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // fond + overlay
      ctx.drawImage(base, 0, 0);

      // avatar dans la TV
      ctx.drawImage(avatar, 164, 56, 503, 295);

      return message.channel.send({
        files: [{
          attachment: canvas.toBuffer(),
          name: 'tv.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur génération image.");
    }
  }
};

