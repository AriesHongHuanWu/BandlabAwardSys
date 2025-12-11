const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// -------------------------------------------------------------
// [UPDATE 1] Enhanced downloadFile function with Headers support
// Replace your existing downloadFile function with this one.
// -------------------------------------------------------------
async function downloadFile(url, filename, headers = {}) {
    try {
        const filePath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) return filePath;
        const writer = fs.createWriteStream(filePath);

        // Ensure User-Agent is present if not provided
        const finalHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            ...headers
        };

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: finalHeaders
        });

        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    } catch (e) {
        console.error(`[Download Error] ${e.message}`);
        return null;
    }
}

// -------------------------------------------------------------
// [UPDATE 2] New BandLab Logic inside getStream
// Replace the existing "BandLab" block inside your getStream function
// with this improved version that matches the Web Player logic.
// -------------------------------------------------------------

// BandLab
if (url.includes('bandlab.com') || url.includes('revision')) {
    try {
        // STEP 1: Try to find UUID directly in the URL
        let uuidMatch = url.match(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/i);
        let postId = uuidMatch ? uuidMatch[0] : null;

        // STEP 2: If no UUID in URL, scrape the HTML to find it (handles redirected URLs, short links, complex params)
        if (!postId) {
            // Fetch page with browser UA to avoid bot detection
            const pageRes = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            });
            const html = pageRes.data;
            // Look for bandlab://posts/UUID scheme often found in meta tags
            const alMatch = html.match(/bandlab:\/\/posts\/([a-fA-F0-9-]+)/);
            if (alMatch) postId = alMatch[1];
        }

        if (postId) {
            // STEP 3: API Call with the correct Post ID
            const { data } = await axios.get(`https://www.bandlab.com/api/v1.3/posts/${postId}`);

            let m4a = null;
            // Helper to get highest quality audio source
            if (data.revision && data.revision.mixdown && data.revision.mixdown.file) {
                m4a = data.revision.mixdown.file;
            } else if (data.waveformUrl) {
                m4a = data.waveformUrl.replace('.json', '.m4a');
            }

            // STEP 4: Robust Metadata Extraction
            // Title Priority: Song Name -> Caption -> Default
            let songName = "BandLab Track";
            if (data.revision && data.revision.song && data.revision.song.name) {
                songName = data.revision.song.name;
            } else if (data.caption) {
                songName = data.caption;
            }

            // Artist Priority: Creator Name -> Creator Username -> Author Name
            let username = "Unknown Artist";
            if (data.creator && data.creator.name) username = data.creator.name;
            else if (data.creator && data.creator.username) username = data.creator.username;
            else if (data.author && data.author.name) username = data.author.name;

            // Artwork Priority: Picture -> Song Picture -> Creator Picture
            let art = null;
            if (data.picture && data.picture.url) art = data.picture.url;
            else if (data.revision && data.revision.song && data.revision.song.picture && data.revision.song.picture.url) art = data.revision.song.picture.url;
            else if (data.creator && data.creator.picture && data.creator.picture.url) art = data.creator.picture.url;

            if (m4a) {
                const filename = `${guildId}_bl_${Date.now()}_${postId}.m4a`;
                // Download with Headers to verify we are a browser (fixes M4A playback/hotlink issues)
                const localPath = await downloadFile(m4a, filename, {
                    'Referer': 'https://www.bandlab.com/',
                    'Origin': 'https://www.bandlab.com'
                });

                if (localPath) {
                    const realDuration = await getMediaDuration(localPath);
                    if (realDuration > MAX_SONG_DURATION) {
                        fs.unlinkSync(localPath);
                        throw new Error(`File too long (> ${MAX_SONG_DURATION / 60}m).`);
                    }

                    return {
                        url: localPath,
                        type: 'file',
                        title: songName,
                        artist: `${username}${subTag}`,
                        source: 'BandLab',
                        originalUrl: url,
                        isFile: true,
                        id: trackId,
                        duration: realDuration || data.duration || 0,
                        art: art,
                        persist: true,
                        requester: requesterId,
                        rating: null,
                        ratingReason: null,
                        startAt: startAt
                    };
                }
            }
        }
    } catch (e) {
        console.error("BandLab Error", e.message);
    }
}
