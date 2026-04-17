const { 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "aventure",
    description: "Commence une aventure interactive",
    async execute(message) {
        const userId = message.author.id;
        const scenes = {
            start: {
                text: "Tu te réveilles dans une forêt sombre. Deux chemins s'offrent à toi.",
                choices: [
                    { label: "Aller à gauche", next: "loups" },
                    { label: "Aller à droite", next: "village" }
                ]
            },
            loups: {
                text: "Tu entends des loups approcher dans les buissons.",
                choices: [
                    { label: "Courir", next: "fuite" },
                    { label: "Se cacher", next: "cachette" }
                ]
            },
            village: {
                text: "Tu trouves un petit village abandonné.",
                choices: [
                    { label: "Entrer dans une maison", next: "maison" },
                    { label: "Fouiller la place", next: "place" }
                ]
            },
            fuite: {
                text: "Tu cours aussi vite que possible et réussis à t'échapper. Tu as survécu.",
                end: true
            },
            cachette: {
                text: "Les loups te trouvent. L'aventure se termine mal pour toi.",
                end: true
            },
            maison: {
                text: "Dans la maison, tu trouves un coffre rempli d'or.",
                end: true
            },
            place: {
                text: "La place est vide... mais tu trouves une carte menant à un trésor.",
                end: true
            }
        };
        let currentScene = "start";
        function createMessage(sceneKey) {
            const scene = scenes[sceneKey];
            const embed = new EmbedBuilder()
                .setTitle("Aventure")
                .setDescription(scene.text);
            if (scene.end) {
                return { embeds: [embed], components: [] };
            }
            const row = new ActionRowBuilder();
            scene.choices.forEach((choice, index) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`adv_${index}`)
                        .setLabel(choice.label)
                        .setStyle(ButtonStyle.Primary)
                );
            });
            return {
                embeds: [embed],
                components: [row]
            };
        }
        const gameMessage = await message.channel.send(createMessage(currentScene));
        const collector = gameMessage.createMessageComponentCollector({
            time: 300000
        });
        collector.on("collect", async interaction => {
            if (interaction.user.id !== userId) {
                return interaction.reply({
                    content: "Ce n'est pas ton aventure.",
                    ephemeral: true
                });
            }
            const choiceIndex = parseInt(interaction.customId.split("_")[1]);
            const nextScene = scenes[currentScene].choices[choiceIndex].next;
            currentScene = nextScene;
            const scene = scenes[currentScene];
            if (scene.end) {
                collector.stop();
            }
            await interaction.update(createMessage(currentScene));
        });
    }
};
