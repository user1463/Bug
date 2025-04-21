const { zokou } = require('../framework/zokou');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const config = require('../config');

module.exports = zokou({
    nomCom: "ytmp4",
    categorie: "Media",
    reaction: "🎬",
    description: "Download YouTube videos in MP4 format"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const [youtubeUrl, qualityFlag] = arg;

    if (!youtubeUrl) {
        return repondre(`📌 Usage: ${config.PREFIX}ytmp4 <youtube-url> [quality]\n\n` +
                      `Quality options:\n` +
                      `- hd (720p)\n` +
                      `- fhd (1080p)\n` +
                      `- 4k (2160p)\n` +
                      `Example: ${config.PREFIX}ytmp4 https://youtu.be/example hd`);
    }

    if (!ytdl.validateURL(youtubeUrl)) {
        return repondre("❌ Invalid YouTube URL");
    }

    try {
        await repondre("⏳ Fetching video info...");

        // Get video info
        const info = await ytdl.getInfo(youtubeUrl);
        const title = sanitizeFilename(info.videoDetails.title);
        const tempDir = config.TEMP_DIR || './temp';
        const tempFile = path.join(tempDir, `${Date.now()}_${title}.mp4`);

        // Create temp directory if not exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Determine quality
        let quality = 'highest';
        let itag = null;
        
        if (qualityFlag) {
            const formats = info.formats
                .filter(f => f.hasVideo && f.hasAudio)
                .sort((a, b) => b.height - a.height);

            switch (qualityFlag.toLowerCase()) {
                case 'hd':
                    itag = formats.find(f => f.height === 720)?.itag;
                    break;
                case 'fhd':
                    itag = formats.find(f => f.height === 1080)?.itag;
                    break;
                case '4k':
                    itag = formats.find(f => f.height === 2160)?.itag;
                    break;
            }
        }

        await repondre("📥 Downloading video...");

        // Download video stream
        const videoStream = ytdl(youtubeUrl, {
            quality: itag || 'highest',
            filter: format => format.hasVideo && format.hasAudio
        });

        // Progress tracking
        let progress = 0;
        videoStream.on('progress', (_, downloaded, total) => {
            const newProgress = Math.round((downloaded / total) * 100);
            if (newProgress > progress + 5) { // Update every 5% to avoid spamming
                progress = newProgress;
                repondre(`⬇️ Downloading... ${progress}%`).catch(console.error);
            }
        });

        // Convert and save
        await new Promise((resolve, reject) => {
            ffmpeg(videoStream)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-preset fast',
                    '-crf 23',
                    '-movflags faststart'
                ])
                .on('error', reject)
                .on('end', resolve)
                .save(tempFile);
        });

        // Check file size
        const fileSize = fs.statSync(tempFile).size / (1024 * 1024);
        const maxSize = config.MAX_FILE_SIZE || 50;
        
        if (fileSize > maxSize) {
            fs.unlinkSync(tempFile);
            return repondre(`❌ File too large (${fileSize.toFixed(2)}MB > ${maxSize}MB limit)`);
        }

        await repondre("📤 Sending video...");
        await zk.sendMessage(dest, {
            video: fs.readFileSync(tempFile),
            caption: `📹 *${title}*`,
            mimetype: 'video/mp4'
        }, { quoted: ms });

        // Cleanup
        fs.unlinkSync(tempFile);

    } catch (error) {
        console.error("YTMP4 Error:", error);
        await repondre(`❌ Download failed: ${error.message}`);
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    }
});

// Helper function to sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9\-_]/gi, '_')
        .substring(0, 50);
              }
