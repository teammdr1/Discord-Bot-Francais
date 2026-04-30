const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'ps4',

  async execute(client, message, args) {
    try {
      const member =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.author;

      const avatarURL = member.displayAvatarURL({
        extension: 'png',
        size: 512
      });

      const base = await loadImage(
        path.join(__dirname, '../../assets/images/ps4.png')
      );
      const avatar = await loadImage(avatarURL);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(avatar, 0, 75, 410, 449);
      ctx.drawImage(base, 0, 0);

      const buffer = canvas.toBuffer();
      if (buffer.length > 8 * 1024 * 1024)
        return message.reply("Image trop lourde.");

      return message.channel.send({
        files: [{ attachment: buffer, name: 'ps4.png' }]
      });
    } catch (err) {
      console.error(err);
      message.reply("Erreur génération PS4.");
    }
  }
};

