const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Dit bonjour !'),
  
  async execute(interaction, client) {
    await interaction.reply('Bonjour !');
  }
};
