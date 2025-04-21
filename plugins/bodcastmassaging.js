const { zokou } = require('../../framework/zokou');
const { getContacts } = require('./_utils/ownerUtils');

module.exports = zokou({
    nomCom: "broadcast",
    categorie: "Owner",
    reaction: "📢",
    description: "Send message to all contacts/groups"
}, async (dest, zk, { ms, repondre, arg, superUser }) => {
    if (!superUser) return repondre("❌ Owner only command");

    const message = arg.join(' ');
    if (!message) return repondre(`Usage: ${config.PREFIX}broadcast <message>`);

    try {
        const { contacts, groups } = await getContacts(zk);
        let success = 0, failed = 0;

        await repondre(`📤 Sending to ${contacts.length} contacts & ${groups.length} groups...`);

        // Send to contacts
        for (const contact of contacts) {
            try {
                await zk.sendMessage(contact, { text: message });
                success++;
            } catch {
                failed++;
            }
        }

        // Send to groups
        for (const group of groups) {
            try {
                await zk.sendMessage(group, { text: message });
                success++;
            } catch {
                failed++;
            }
        }

        await repondre(`✅ Broadcast complete\n\n📤 Sent: ${success}\n❌ Failed: ${failed}`);
    } catch (e) {
        await repondre(`❌ Broadcast failed: ${e.message}`);
    }
});
