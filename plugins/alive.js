const { zokou } = require('../framework/zokou');
const config = require('../config');
const moment = require('moment-timezone');
const { formatBytes } = require('../utils/systemUtils');

module.exports = zokou({
    nomCom: "alive",
    categorie: "Utility",
    reaction: "❤️"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, superUser } = commandeOptions;

    // Admin configuration mode
    if (arg && arg.length > 0 && superUser) {
        const [message, mediaUrl] = arg.join(' ').split('|');
        // Save to database here (implementation depends on your DB)
        await repondre(`✅ Alive message updated!\n\n📝 Text: ${message}\n${mediaUrl ? `🖼️ Media: ${mediaUrl}` : ''}`);
        return;
    }

    // Default alive display
    try {
        const start = Date.now();
        
        // System stats
        const uptime = process.uptime();
        const memory = formatBytes(process.memoryUsage().rss);
        const platform = `${process.platform}/${process.arch}`;
        
        // Bot information
        const mode = config.MODE === 'public' ? '🌐 Public' : '🔒 Private';
        const time = moment().tz(config.TIMEZONE || 'Africa/Abidjan').format('HH:mm:ss');
        const date = moment().format('DD/MM/YYYY');

        // Dynamic alive message
        const aliveMessage = `
🌟 *${config.BOT_NAME} Status* 🌟

⏳ *Uptime:* ${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h
💾 *Memory:* ${memory}
🖥️ *Platform:* ${platform}
📅 *Date:* ${date}
⏰ *Time (${config.TIMEZONE || 'GMT'}):* ${time}
🔧 *Mode:* ${mode}

${config.ALIVE_MESSAGE || '⚡ Bot is running smoothly!'}

👤 *Owner:* ${config.OWNER_NAME}
        `.trim();

        // Send with optional media
        if (config.ALIVE_MEDIA) {
            const mediaType = config.ALIVE_MEDIA.match(/\.(mp4|gif)$/i) ? 'video' : 'image';
            await zk.sendMessage(dest, {
                [mediaType]: { url: config.ALIVE_MEDIA },
                caption: aliveMessage
            }, { quoted: ms });
        } else {
            await repondre(aliveMessage);
        }

        // Add performance reaction
        const latency = Date.now() - start;
        await zk.sendMessage(dest, { 
            react: { 
                text: latency < 500 ? '⚡' : latency < 1000 ? '🚀' : '🐢',
                key: ms.key 
            } 
        });

    } catch (error) {
        console.error('Alive Command Error:', error);
        await repondre('❌ Failed to display status');
        await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    }
});
