const { zokou } = require('../../framework/zokou');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

module.exports = zokou({
    nomCom: "ytdl",
    categorie: "Download",
    reaction: "🎬",
    description: "Download YouTube videos/audio"
}, async (dest, zk, { ms, repondre, arg }) => {
    const [url, quality] = arg;
    
    if (!url) return repondre(`Usage: ${config.PREFIX}ytdl <url> [hd|fhd|audio]`);

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        await repondre(`⬇️ Downloading: ${title}`);

        // Quality selection
        let format;
        if (quality === 'audio') {
            format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
            const stream = ytdl.downloadFromInfo(info, { format });
            await sendAudio(zk, dest, ms, stream, `${title}.mp3`);
        } else {
            format = ytdl.chooseFormat(info.formats, { 
                quality: quality === 'hd' ? '22' : quality === 'fhd' ? '137' : 'highest'
            });
            await sendVideo(zk, dest, ms, format.url, `${title}.mp4`);
        }

    } catch (e) {
        repondre(`❌ Error: ${e.message}`);
    }
});

async function sendVideo(zk, dest, ms, url, filename) {
    // Video download implementation
}
