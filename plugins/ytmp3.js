const { zokou } = require('../framework/zokou');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config');

module.exports = zokou({
    nomCom: "ytmp3",
    categorie: "Media",
    reaction: "🎧",
    description: "Download YouTube audio as MP3"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const youtubeUrl = arg[0];

    if (!youtubeUrl) {
        return repondre(`📌 Usage: ${config.PREFIX}ytmp3 <youtube-url>\nExample: ${config.PREFIX}ytmp3 https://youtu.be/dQw4w9WgXcQ`);
    }

    if (!ytdl.validateURL(youtubeUrl)) {
        return repondre("❌ Invalid YouTube URL");
    }

    try {
        await repondre("⏳ Fetching video info...");

        // Get video info
        const info = await ytdl.getInfo(youtubeUrl);
        const title = sanitizeFilename(info.videoDetails.title);
        const tempFile = path.join(config.TEMP_DIR || './temp', `${Date.now()}_${title}.mp3`);

        // Create temp directory if not exists
        if (!fs.existsSync(config.TEMP_DIR || './temp')) {
            fs.mkdirSync(config.TEMP_DIR || './temp');
        }

        await repondre("🔧 Converting to MP3...");

        // Download and convert
        const audioStream = ytdl(youtubeUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });

        await new Promise((resolve, reject) => {
            ffmpeg(audioStream)
                .audioBitrate(320)
                .audioCodec('libmp3lame')
                .on('error', reject)
                .on('end', resolve)
                .save(tempFile);
        });

        // Check file size
        const fileSize = fs.statSync(tempFile).size / (1024 * 1024);
        if (fileSize > (config.MAX_FILE_SIZE || 50)) {
            fs.unlinkSync(tempFile);
            return repondre(`❌ File too large (${fileSize.toFixed(2)}MB > ${config.MAX_FILE_SIZE || 50}MB limit)`);
        }

        await repondre("📤 Sending audio...");
        await zk.sendMessage(dest, {
            audio: fs.readFileSync(tempFile),
            mimetype: 'audio/mpeg',
            filename: `${title}.mp3`,
            ptt: false
        }, { quoted: ms });

        // Cleanup
        fs.unlinkSync(tempFile);

    } catch (error) {
        console.error("YTMP3 Error:", error);
        await repondre(`❌ Conversion failed: ${error.message}`);
        // Cleanup temp file if exists
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }
});

// Helper function to sanitize filename
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9\-_]/gi, '_').substring(0, 50);
}
