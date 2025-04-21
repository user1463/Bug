const { zokou } = require('../../framework/zokou');

module.exports = zokou({
    nomCom: "gset",
    categorie: "Group",
    reaction: "⚙️",
    description: "Group settings management"
}, async (dest, zk, { ms, repondre, arg }) => {
    if (!dest.endsWith('@g.us')) return repondre("❌ Group command only");
    if (!await isAdmin(zk, dest, ms.participant)) return repondre("❌ Admin only");

    try {
        switch(arg[0]?.toLowerCase()) {
            case 'open':
                await zk.groupSettingUpdate(dest, 'not_announcement');
                return repondre("🔓 Group opened (all can send messages)");
                
            case 'close':
                await zk.groupSettingUpdate(dest, 'announcement');
                return repondre("🔒 Group closed (admins only)");
                
            case 'name':
                const newName = arg.slice(1).join(' ');
                await zk.groupUpdateSubject(dest, newName);
                return repondre(`📛 Group renamed to: ${newName}`);
                
            default:
                return repondre(`Usage:\n${config.PREFIX}gset open/close\n${config.PREFIX}gset name NewName`);
        }
    } catch (e) {
        repondre(`❌ Error: ${e.message}`);
    }
});
