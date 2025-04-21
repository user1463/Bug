const { zokou } = require('../../framework/zokou');

module.exports = zokou({
    nomCom: "gaction",
    categorie: "Group",
    reaction: "👤",
    description: "Member management"
}, async (dest, zk, { ms, repondre, arg }) => {
    if (!dest.endsWith('@g.us')) return repondre("❌ Group command only");
    if (!await isBotAdmin(zk, dest)) return repondre("❌ Bot needs admin");

    try {
        const user = arg[1]?.replace('@', '') + '@s.whatsapp.net' || 
                    ms.quoted?.participant;
        
        switch(arg[0]?.toLowerCase()) {
            case 'kick':
                await zk.groupParticipantsUpdate(dest, [user], 'remove');
                return repondre(`🚪 Kicked @${user.split('@')[0]}`);
                
            case 'mute':
                await zk.groupParticipantsUpdate(dest, [user], 'mute', 8*60*60*1000); // 8 hours
                return repondre(`🔇 Muted @${user.split('@')[0]}`);
                
            case 'unmute':
                await zk.groupParticipantsUpdate(dest, [user], 'unmute');
                return repondre(`🔊 Unmuted @${user.split('@')[0]}`);
                
            default:
                return repondre(`Usage:\n${config.PREFIX}gaction kick @user\n${config.PREFIX}gaction mute @user`);
        }
    } catch (e) {
        repondre(`❌ Error: ${e.message}`);
    }
});
