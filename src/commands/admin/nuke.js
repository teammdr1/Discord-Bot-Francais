const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'nuke',
  description: 'Duplique un salon et supprime l’ancien.',
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('❌ Vous devez avoir la permission de gérer les salons pour utiliser cette commande.');
    }

    const target = message.mentions.channels.first() || message.channel;
    if (!target || target.guild.id !== message.guild.id) {
      return message.reply('❌ Salon introuvable. Mentionne un salon valide ou exécute la commande dans le salon à nuker.');
    }

    if (typeof target.clone !== 'function') {
      return message.reply('❌ Je ne peux pas dupliquer ce type de salon.');
    }

    const reason = args.slice(1).join(' ') || `Nuke demandé par ${message.author.tag}`;
    const replyMessage = await message.channel.send(`⏳ Duplication de ${target.name}...`);

    try {
      const cloned = await target.clone({ name: target.name, reason });
      if (target.parent) {
        await cloned.setParent(target.parent, { lockPermissions: false });
      }
      await cloned.setPosition(target.position).catch(() => {});

      const channelMention = `<#${cloned.id}>`;
      await replyMessage.edit(`✅ Salon nuked : ${channelMention}`);

      if (cloned.isTextBased()) {
        await cloned.send(`💥 Salon nuked. Nouveau salon : ${channelMention}`).catch(() => {});
      }

      await target.delete(`Nuke demandé par ${message.author.tag}`);
    } catch (error) {
      console.error(error);
      return replyMessage.edit('❌ Impossible de nuker ce salon. Vérifie mes permissions.');
    }
  }
};