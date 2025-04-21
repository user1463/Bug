const { zokou } = require('../../framework/zokou');
const { exec } = require('child_process');

module.exports = zokou({
    nomCom: "exec",
    categorie: "Owner",
    reaction: "🖥️",
    description: "Execute shell commands (Owner only)"
}, async (dest, zk, { ms, repondre, arg, superUser }) => {
    if (!superUser) return repondre("❌ Owner only command");

    const command = arg.join(' ');
    if (!command) return repondre(`Usage: ${config.PREFIX}exec <command>`);

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            return repondre(`❌ Error:\n${error.message}`);
        }
        if (stderr) {
            return repondre(`⚠️ Stderr:\n${stderr}`);
        }
        await repondre(`🖥️ Output:\n${stdout || "No output"}`);
    });
});
