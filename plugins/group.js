const { zokou } = require('../framework/zokou');
const config = require('../config');

module.exports = zokou({
    nomCom: "group",
    categorie: "Group",
    reaction: "👥"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, superUser } = commandeOptions;
    const subCommand = arg[0]?.toLowerCase();

    // Only allow in groups
    if (!dest.includes('@g.us')) {
        return repondre("❌ This command only works in groups");
    }

    try {
        const groupInfo = await zk.groupMetadata(dest);
        const participants = groupInfo.participants;
        const isAdmin = participants.find(p => p.id === ms.participant)?.admin || false;
        const isBotAdmin = participants.find(p => p.id === zk.user.id)?.admin || false;

        // Help menu
        if (!subCommand) {
            return showGroupHelp(zk, dest, ms, isAdmin);
        }

        // Admin-only commands
        if (!isAdmin && !superUser) {
            return repondre("❌ You need to be admin to use this command");
        }

        switch (subCommand) {
            case 'open':
                await zk.groupSettingUpdate(dest, 'not_announcement');
                return repondre("🔓 Group is now open to all members");
                
            case 'close':
                await zk.groupSettingUpdate(dest, 'announcement');
                return repondre("🔒 Group is now closed (only admins can send messages)");

            case 'promote':
                if (!isBotAdmin) return repondre("❌ Bot needs to be admin");
                const userToPromote = ms.quoted?.participant || arg[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await zk.groupParticipantsUpdate(dest, [userToPromote], 'promote');
                return repondre(`👑 Promoted @${userToPromote.split('@')[0]}`);

            case 'demote':
                if (!isBotAdmin) return repondre("❌ Bot needs to be admin");
                const userToDemote = ms.quoted?.participant || arg[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await zk.groupParticipantsUpdate(dest, [userToDemote], 'demote');
                return repondre(`🔻 Demoted @${userToDemote.split('@')[0]}`);

            case 'kick':
                if (!isBotAdmin) return repondre("❌ Bot needs to be admin");
                const userToKick = ms.quoted?.participant || arg[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                await zk.groupParticipantsUpdate(dest, [userToKick], 'remove');
                return repondre(`🚪 Kicked @${userToKick.split('@')[0]}`);

            case 'invite':
                const inviteCode = await zk.groupInviteCode(dest);
                return repondre(`📩 Group invite link:\nhttps://chat.whatsapp.com/${inviteCode}`);

            case 'tagall':
                if (!isBotAdmin) return repondre("❌ Bot needs to be admin");
                const members = participants.map(p => `@${p.id.split('@')[0]}`).join(' ');
                return repondre(`📢 Mentioning all members:\n\n${members}`, { mentions: participants.map(p => p.id) });

            case 'info':
                const groupAdmins = participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`).join(' ');
                return repondre(
                    `📌 *Group Info*\n\n` +
                    `🔹 *Name:* ${groupInfo.subject}\n` +
                    `👥 *Members:* ${participants.length}\n` +
                    `👑 *Admins:* ${groupAdmins}\n` +
                    `🆔 *ID:* ${groupInfo.id}\n` +
                    `📅 *Created:* ${new Date(groupInfo.creation * 1000).toLocaleDateString()}`,
                    { mentions: participants.filter(p => p.admin).map(p => p.id) }
                );

            default:
                return repondre(`❌ Invalid subcommand. Use ${config.PREFIX}group for help`);
        }

    } catch (error) {
        console.error("Group Command Error:", error);
        return repondre("❌ An error occurred while processing the command");
    }
});

// Show help menu
async function showGroupHelp(zk, dest, ms, isAdmin) {
    const basicCommands = [
        `📌 *Group Commands*\n`,
        `🔹 ${config.PREFIX}group info - Show group info`,
        `🔹 ${config.PREFIX}group invite - Get invite link`
    ];

    const adminCommands = isAdmin ? [
        `\n👑 *Admin Commands*`,
        `🔹 ${config.PREFIX}group open - Open group chat`,
        `🔹 ${config.PREFIX}group close - Close group chat`,
        `🔹 ${config.PREFIX}group promote @user - Make admin`,
        `🔹 ${config.PREFIX}group demote @user - Remove admin`,
        `🔹 ${config.PREFIX}group kick @user - Remove member`,
        `🔹 ${config.PREFIX}group tagall - Mention all members`
    ] : [];

    await zk.sendMessage(dest, {
        text: [...basicCommands, ...adminCommands].join('\n'),
        footer: config.BOT_NAME
    }, { quoted: ms });
        }
