const {
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');

const activeEmbeds = new Map();

module.exports = {
  name: 'embed',
  description: 'Créer un embed personnalisé via interaction avec boutons',
  async execute(client, message, args) {
    if (activeEmbeds.has(message.author.id)) {
      return message.channel.send("Vous avez déjà une commande en cours. Veuillez la terminer ou attendre qu'elle expire.");
    }

    const panelContainer = new ContainerBuilder().setAccentColor(0x0099ff);
    panelContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "## Création d'embed\nCliquez sur un des boutons ci-dessous pour commencer."
      )
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('createEmbed').setLabel('Créer un embed').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('cancelEmbed').setLabel('Annuler').setStyle(ButtonStyle.Danger)
    );

    const embedMessage = await message.channel.send({
      components: [panelContainer, row],
      flags: MessageFlags.IsComponentsV2
    });

    activeEmbeds.set(message.author.id, { message: embedMessage });

    const collector = embedMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction.", ephemeral: true });
      }

      if (interaction.customId === 'createEmbed') {
        await interaction.deferReply({ ephemeral: true });

        let embedData = {};

        const askQuestion = async (question) => {
          await interaction.followUp({ content: question, ephemeral: true });
          const filter = msg => msg.author.id === message.author.id;
          try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            return collected.first().content;
          } catch {
            return null;
          }
        };

        try {
          embedData.title = await askQuestion('Quel titre voulez-vous pour votre embed ?');
          if (!embedData.title) throw new Error('Commande annulée ou temps écoulé.');

          embedData.description = await askQuestion('Quelle sera la description de l\'embed ?');
          embedData.color = await askQuestion('Quelle sera la couleur de l\'embed ? (hex code ex: #ff0000)');

          const addImage = await askQuestion('Voulez-vous ajouter une image ? (Oui / Non)');
          if (addImage?.toLowerCase() === 'oui') {
            embedData.image = await askQuestion('Veuillez entrer l\'URL de l\'image.');
          }

          const addThumbnail = await askQuestion('Voulez-vous ajouter un thumbnail (miniature) ? (Oui / Non)');
          if (addThumbnail?.toLowerCase() === 'oui') {
            embedData.thumbnail = await askQuestion('Veuillez entrer l\'URL du thumbnail.');
          }

          const addFooter = await askQuestion('Voulez-vous ajouter un footer ? (Oui / Non)');
          if (addFooter?.toLowerCase() === 'oui') {
            embedData.footer = await askQuestion('Veuillez entrer le texte du footer.');
          }

          let hexColor = 0x0099ff;
          if (embedData.color) {
            const parsed = parseInt(embedData.color.replace('#', ''), 16);
            if (!isNaN(parsed)) hexColor = parsed;
          }

          const finalContainer = new ContainerBuilder().setAccentColor(hexColor);
          if (embedData.title) {
            finalContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`## ${embedData.title}`)
            );
          }
          if (embedData.description || embedData.thumbnail) {
            finalContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
          }
          if (embedData.description) {
            finalContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(embedData.description)
            );
          }
          if (embedData.image) {
            finalContainer.addMediaGalleryComponents(
              new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(embedData.image))
            );
          }
          if (embedData.footer) {
            finalContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            finalContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`-# ${embedData.footer}`)
            );
          }

          await message.channel.send({ components: [finalContainer], flags: MessageFlags.IsComponentsV2 });
          await interaction.editReply({ content: 'Embed créé avec succès !', ephemeral: true });

        } catch (error) {
          await interaction.followUp({ content: 'Commande annulée ou temps écoulé.', ephemeral: true });
        } finally {
          activeEmbeds.delete(message.author.id);
        }

      } else if (interaction.customId === 'cancelEmbed') {
        await interaction.update({ content: 'Commande annulée.', components: [] });
        embedMessage.delete().catch(() => {});
        collector.stop();
        activeEmbeds.delete(message.author.id);
      }
    });

    collector.on('end', () => {
      if (activeEmbeds.has(message.author.id)) {
        embedMessage.edit({ content: 'Commande expirée.', components: [] }).catch(() => {});
        activeEmbeds.delete(message.author.id);
      }
    });
  },
};
