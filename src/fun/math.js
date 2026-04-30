module.exports = {
    name: "math",

    execute(message, args) {
        if (!message || !message.channel) return;

        // prend l'expression complète après le préfixe
        const expression = args.join("").trim();
        if (!expression) return message.channel.send("Usage : +math 2+2");

        // sécurité : chiffres, opérateurs et parenthèses seulement
        if (!/^[0-9+\-*/().]+$/.test(expression)) {
            return message.channel.send("Expression invalide");
        }

        let result;
        try {
            result = Function(`"use strict"; return (${expression})`)();
        } catch {
            return message.channel.send("Calcul invalide");
        }

        message.channel.send(`Résultat : ${result}`);
    }
};
