const { createCanvas, loadImage } = require('canvas');
const path = require('path');
module.exports = {
  name: 'wiiu',

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
        path.join(__dirname, '../../assets/images/WiiU.png')
      );

      const fetchRes = await fetch(avatarURL);
      const avatarBuffer = Buffer.from(await fetchRes.arrayBuffer());
      const avatar = await loadImage(avatarBuffer);
      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      // effet gris (remplacé proprement)
      ctx.drawImage(base, 0, 0);

      ctx.drawImage(avatar, 4, 56, 682, 923);

      return message.channel.send({
        files: [{
          attachment: canvas.toBuffer(),
          name: 'WiiU.png'
        }]
      });

    } catch (err) {
      console.error(err);
      message.reply("Erreur génération image.");
    }
  }
};

