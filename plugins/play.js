const { zokou } = require('../framework/zokou');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');
const config = require('../config');

// Music queue system
const queues = new Map();

module.exports = zokou({
    nomCom: "play",
    categorie: "Music",
    reaction: "🎵",
    description: "Music player with queue system"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    const groupId = dest;
    const searchQuery = arg.join(' ');

    try {
        if (!searchQuery) {
            return showPlayerControls(zk, dest, ms);
        }

        // Check if voice notes are supported in the chat
        if (!(await checkVoiceSupport(zk, dest))) {
            return repondre("❌ Voice messages not supported in this chat");
        }

        await repondre("🔍 Searching music...");

        // Extract YouTube URL or search
        const videoInfo = await getVideoInfo(searchQuery);
        if (!videoInfo) {
            return repondre("❌ No results found");
        }

        // Add to queue
        if (!queues.has(groupId)) {
            queues.set(groupId, []);
        }
        queues.get(groupId).push(videoInfo);

        await repondre(`🎧 Added to queue:\n${videoInfo.title}\n\nPosition: ${queues.get(groupId).length}`);

        // Start playback if first song
        if (queues.get(groupId).length === 1) {
            await playNextSong(zk, dest, ms, groupId);
        }

    } catch (error) {
        console.error("Play Command Error:", error);
        await repondre(`❌ Error: ${error.message}`);
    }
});

// Player control commands
zokou({ nomCom: "skip", categorie: "Music" }, async (dest, zk, { ms }) => {
    await skipCurrentSong(zk, dest, ms);
});

zokou({ nomCom: "queue", categorie: "Music" }, async (dest, zk, { ms, repondre }) => {
    await showQueue(zk, dest, ms, repondre);
});

// Core music functions
async function getVideoInfo(query) {
    const isUrl = ytdl.validateURL(query);
    let videoInfo;

    if (isUrl) {
        videoInfo = await ytdl.getInfo(query);
    } else {
        const searchResults = await ytsr(query, { limit: 1 });
        if (!searchResults.items.length) return null;
        videoInfo = await ytdl.getInfo(searchResults.items[0].url);
    }

    return {
        title: videoInfo.videoDetails.title,
        url: videoInfo.videoDetails.video_url,
        duration: formatDuration(videoInfo.videoDetails.lengthSeconds),
        thumbnail: videoInfo.videoDetails.thumbnails[0].url
    };
}

async function playNextSong(zk, dest, ms, groupId) {
    const queue = queues.get(groupId);
    if (!queue?.length) {
        queues.delete(groupId);
        return;
    }

    const song = queue[0];
    await sendNowPlayingMessage(zk, dest, ms, song);

    // Audio processing pipeline
    const audioStream = ytdl(song.url, { 
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25 
    });

    const ffmpegCommand = ffmpeg(audioStream)
        .audioBitrate(128)
        .format('mp3')
        .on('error', (err) => {
            console.error('FFmpeg Error:', err);
            skipCurrentSong(zk, dest, ms);
        });

    const audioBuffer = await streamToBuffer(ffmpegCommand);
    await zk.sendMessage(dest, { 
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false 
    }, { quoted: ms });

    // Proceed to next song
    queue.shift();
    if (queue.length > 0) {
        setTimeout(() => playNextSong(zk, dest, ms, groupId), 1000);
    } else {
        queues.delete(groupId);
        await zk.sendMessage(dest, { text: "🎶 Queue finished" }, { quoted: ms });
    }
}

// Helper functions
async function checkVoiceSupport(zk, chatId) {
    try {
        const chat = await zk.groupMetadata(chatId);
        return chat?.ephemeralDuration !== undefined;
    } catch {
        return false;
    }
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function sendNowPlayingMessage(zk, dest, ms, song) {
    await zk.sendMessage(dest, {
        text: `🎶 Now Playing:\n${song.title}\n⏳ ${song.duration}`,
        thumbnail: (await axios.get(song.thumbnail, { responseType: 'arraybuffer' })).data
    }, { quoted: ms });
}

async function skipCurrentSong(zk, dest, ms) {
    const groupId = dest;
    if (queues.has(groupId) {
        queues.get(groupId).shift();
        await zk.sendMessage(dest, { text: "⏭️ Song skipped" }, { quoted: ms });
        if (queues.get(groupId).length > 0) {
            await playNextSong(zk, dest, ms, groupId);
        }
    }
}

async function showQueue(zk, dest, ms, repondre) {
    const groupId = dest;
    if (!queues.has(groupId) {
        return repondre("❌ No active queue");
    }

    const queue = queues.get(groupId);
    let message = "🎧 Current Queue:\n";
    queue.forEach((song, index) => {
        message += `${index + 1}. ${song.title} (${song.duration})\n`;
    });

    await repondre(message);
}

async function showPlayerControls(zk, dest, ms) {
    await zk.sendMessage(dest, {
        text: `🎛️ *Music Player Controls*\n\n` +
              `• ${config.PREFIX}play <query> - Play music\n` +
              `• ${config.PREFIX}skip - Skip current song\n` +
              `• ${config.PREFIX}queue - Show queue\n` +
              `• ${config.PREFIX}pause - Pause (coming soon)\n` +
              `• ${config.PREFIX}resume - Resume (coming soon)`,
        footer: config.BOT_NAME
    }, { quoted: ms });
  }
