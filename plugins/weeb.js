const axios = require('axios');

module.exports = {
    name: "weeb",
    description: "Get anime quotes, waifu pics, or husbando pics!",
    category: "fun",
    async execute(client, message, args) {
        const option = args[0]?.toLowerCase(); // e.g., "quote", "waifu", "husbando"
        
        if (!option) {
            return client.sendMessage(
                message.chat,
                { 
                    text: `🎌 *Usage:*\n` +
                          `• *!weeb quote* - Random anime quote\n` +
                          `• *!weeb waifu* - Random waifu pic\n` +
                          `• *!weeb husbando* - Random husbando pic`
                },
                { quoted: message }
            );
        }

        try {
            switch (option) {
                case "quote": {
                    const { data } = await axios.get('https://animechan.xyz/api/random');
                    await client.sendMessage(
                        message.chat,
                        { 
                            text: `📜 *${data.character}* (from *${data.anime}*):\n` +
                                  `_"${data.quote}"_`
                        },
                        { quoted: message }
                    );
                    break;
                }

                case "waifu":
                case "husbando": {
                    const { data } = await axios.get(`https://api.waifu.pics/sfw/${option}`);
                    await client.sendMessage(
                        message.chat,
                        { 
                            image: { url: data.url },
                            caption: `✨ Here's your ${option}!`
                        },
                        { quoted: message }
                    );
                    break;
                }

                default:
                    await client.sendMessage(
                        message.chat,
                        { text: `❌ Invalid option! Use *!weeb* for help.` },
                        { quoted: message }
                    );
            }
        } catch (error) {
            console.error(error);
            await client.sendMessage(
                message.chat,
                { text: "🚨 Failed to fetch weeb content. Try again later!" },
                { quoted: message }
            );
        }
    }
};
