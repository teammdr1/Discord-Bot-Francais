const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  name: 'roi-lion',
  description: "Dessine l'avatar d'un utilisateur sur la scène du Roi Lion.",

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
        path.join(__dirname, '../../assets/images/roi-lion.png')
      );

      const fetchRes = await fetch(avatarURL);
      const avatarBuffer = Buffer.from(await fetchRes.arrayBuffer());
      const avatar = await loadImage(avatarBuffer);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(base, 0, 0);

      // rotation contrôlée
      ctx.save();
      ctx.translate(180, 200);
      ctx.rotate(-24 * Math.PI / 180);
      ctx.drawImage(avatar, -65, -75, 130, 150);
      ctx.restore();

      return message.channel.send({
        files: [{
          attachment: canvas.toBuffer(),
          name: 'roi-lion.png'
        }]
      });

    } catch (err) {
      console.error(err);
      return message.reply("Erreur lors de la génération de l'image.");
    }
  }
};

