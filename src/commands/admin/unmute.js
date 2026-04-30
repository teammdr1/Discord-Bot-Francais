// src/commands/unmute.js
module.exports = {
    name: 'unmute',
    description: 'Unmute un membre du serveur',
    async execute(client, message, args) {
        // Vérifie si l'utilisateur a la permission de unmute des membres
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.channel.send("Vous n'avez pas la permission de unmute des membres.");
        }
        // Vérifie si un membre a été mentionné
        const member = message.mentions.members.first();
        if (!member) {
            return message.channel.send("Veuillez mentionner un membre à unmute.");
        }
        // Vérifie si le membre peut être unmuté
        if (!member.manageable) {
            return message.channel.send("Je ne peux pas unmute ce membre.");
        }
        // Récupère la raison du unmute
        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
        // Unmute le membre
        try {
            await member.timeout(null, reason); // Enlève le mute
            message.channel.send(`${member.user.tag} a été unmuté. Raison : ${reason}`);
        } catch (error) {
            console.error(error);
            message.channel.send("Une erreur est survenue lors du unmute du membre.");
        }
    },
};
