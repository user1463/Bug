const { zokou } = require('../../framework/zokou');
const { getGroupInfo } = require('./_utils/groupUtils');

module.exports = zokou({
    nomCom: "ginfo",
    categorie: "Group",
    reaction: "ℹ️",
    description: "Show group information"
}, async (dest, zk, { ms, repondre }) => {
    if (!dest.endsWith('@g.us')) return repondre("❌ Group command only");
    
    try {
        const { subject, creation, participants } = await getGroupInfo(zk, dest);
        const admins = participants.filter(p => p.admin).length;
        
        await repondre(
            `📌 *Group Info*\n\n` +
            `🔹 *Name:* ${subject}\n` +
            `👥 *Members:* ${participants.length}\n` +
            `👑 *Admins:* ${admins}\n` +
            `📅 *Created:* ${new Date(creation * 1000).toLocaleDateString()}`
        );
    } catch (e) {
        repondre(`❌ Error: ${e.message}`);
    }
});
