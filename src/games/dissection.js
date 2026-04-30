// src/commands/dissection.js
module.exports = {
  name: 'dissection',
  decription: 'Envoie un gif d\'une dissection de sukuna',
    async execute(client, message, args) {
    try {
        const gifUrl = 'https://media.tenor.com/8Yc7bX4p3mIAAAAM/sukuna-dissection.gif';
        message.channel.send({ files: [gifUrl] });
    } catch (error) {
        console.error(error);
        message.channel.send("Une erreur est survenue lors de l'envoi du gif.");
    }
    },
};
