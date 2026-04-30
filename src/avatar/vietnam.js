const { createCanvas, loadImage } = require('canvas');
const path = require('path');
module.exports = {
  name: 'vietnam',

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
        path.join(__dirname, '../../assets/images/vietnam.png')
      );

      const fetchRes = await fetch(avatarURL);
      const avatarBuffer = Buffer.from(await fetchRes.arrayBuffer());
      const avatar = await loadImage(avatarBuffer);
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // effet overlay vietnam
      const ratio = base.width / base.height;
      const width = Math.round(avatar.height * ratio);

      ctx.drawImage(base, (canvas.width / 2) - (width / 2), 0, width, canvas.height);

      ctx.globalAlpha = 0.675;
      ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

      return message.channel.send({
        files: [{
          attachment: canvas.toBuffer(),
          name: 'vietnam.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur génération image.");
    }
  }
};

