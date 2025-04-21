const { delay } = require('@whiskeysockets/baileys');

module.exports = {
    name: "ping",
    description: "Check if the bot is alive and measure latency",
    category: "utility",
    async execute(client, message, args) {
        // Start time (for latency calculation)
        const start = Date.now();

        // Send "Pinging..." message
        await client.sendMessage(message.chat, { text: "🏓 *Pinging...*" });

        // Simulate processing delay (optional)
        await delay(500); 

        // Calculate latency (end time - start time)
        const latency = Date.now() - start;

        // Reply with latency
        await client.sendMessage(
            message.chat,
            { 
                text: `🚀 *PONG!*\n` +
                      `⏳ *Latency:* ${latency}ms\n` +
                      `💻 *Server:* ${process.platform}`
            },
            { quoted: message }
        );
    }
};
