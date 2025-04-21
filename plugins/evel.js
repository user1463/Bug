const { zokou } = require('../../framework/zokou');

module.exports = zokou({
    nomCom: "eval",
    categorie: "Owner",
    reaction: "💻",
    description: "Execute JavaScript code (Owner only)"
}, async (dest, zk, { ms, repondre, arg, superUser }) => {
    if (!superUser) return repondre("❌ Owner only command");

    try {
        const code = arg.join(' ');
        let result = eval(code);
        
        if (typeof result === 'object') {
            result = require('util').inspect(result, { depth: 1 });
        }

        await repondre(`💻 Output:\n${result}`);
    } catch (e) {
        await repondre(`❌ Error:\n${e.stack}`);
    }
});
