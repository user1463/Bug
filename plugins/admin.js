const { zokou } = require('../../framework/zokou');
const { isAdmin, isBotAdmin } = require('./_utils/groupUtils');

module.exports = zokou({
    nomCom: "admin",
    categorie: "Group",
    reaction: "👑",
    description: "Admin management tools"
}, async (dest, zk, { ms, repondre, arg }) => {
    if (!dest.endsWith('@g.us')) return repondre("❌ Group command only");
    
    const [action, user] = arg;
    const botAdmin = await isBotAdmin(zk, dest);
    const userAdmin = await isAdmin(zk, dest, ms.participant);

    if (!botAdmin) return repondre("❌ Bot needs admin rights");
    if (!userAdmin) return repondre("❌ You're not admin");

    try {
        const userId = user?.replace('@', '') + '@s.whatsapp.net' || 
                      ms.quoted?.participant;

        switch(action?.toLowerCase()) {
            case 'add':
                await zk.groupParticipantsUpdate(dest, [userId], 'add');
                return repondre(`✅ Added @${userId.split('@')[0]}`);
                
            case 'promote':
                await zk.groupParticipantsUpdate(dest, [userId], 'promote');
                return repondre(`👑 Promoted @${userId.split('@')[0]}`);
                
            case 'demote':
                await zk.groupParticipantsUpdate(dest, [userId], 'demote');
                return repondre(`🔻 Demoted @${userId.split('@')[0]}`);
                
            default:
                return repondre(`Usage:\n${config.PREFIX}admin add @user\n${config.PREFIX}admin promote @user`);
        }
    } catch (e) {
        repondre(`❌ Error: ${e.message}`);
    }
});
