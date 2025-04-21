const { zokou } = require('../framework/zokou');
const config = require('../config');

module.exports = zokou({
    nomCom: "ping",
    categorie: "Utility",
    reaction: "🏓"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    
    try {
        // Start timestamp
        const start = Date.now();
        
        // Send initial ping
        await repondre("📡 Measuring response time...");
        
        // Calculate latency
        const latency = Date.now() - start;
        
        // Get system stats
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        // Memory usage
        const usedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMB = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2);
        
        // Build response
        const responseMsg = `
⚡ *${config.BOT_NAME} Status*

• 🏓 Ping: ${latency}ms
• ⏳ Uptime: ${days}d ${hours}h ${minutes}m
• 💾 Memory: ${usedMB}MB / ${totalMB}MB
• 🖥️ Platform: ${process.platform}
• 🔋 Power: ${config.MODE.toUpperCase()} mode

${config.THEME === 'dark' ? '🌑' : '☀️'} ${config.OWNER_NAME}
        `.trim();
        
        // Send final response
        await zk.sendMessage(dest, {
            text: responseMsg,
            contextInfo: {
                externalAdReply: {
                    title: "BOT PERFORMANCE",
                    body: `${latency}ms response`,
                    thumbnail: await zk.getFileBuffer(config.BOT_LOGO || './assets/logo.jpg'),
                    mediaType: 1
                }
            }
        }, { quoted: ms });
        
        // Add success reaction
        await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });
        
    } catch (error) {
        console.error("Ping Command Error:", error);
        await repondre("❌ Failed to check bot status");
        await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    }
});
