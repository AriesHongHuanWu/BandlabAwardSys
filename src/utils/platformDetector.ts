export type Platform = 'youtube' | 'spotify' | 'soundcloud' | 'bandlab' | 'other';

export const detectPlatform = (url: string): Platform => {
    if (!url) return 'other';
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('spotify.com')) return 'spotify';
    if (lowerUrl.includes('soundcloud.com')) return 'soundcloud';
    if (lowerUrl.includes('bandlab.com')) return 'bandlab';

    return 'other';
};

export const getEmbedUrl = (url: string, platform: Platform): string => {
    if (platform === 'spotify') {
        // Convert https://open.spotify.com/track/ID to embed URL
        // e.g. https://open.spotify.com/embed/track/ID
        try {
            const urlObj = new URL(url);
            return `https://open.spotify.com/embed${urlObj.pathname}`;
        } catch (e) {
            return url;
        }
    }

    if (platform === 'bandlab') {
        try {
            // 1. Already an embed URL?
            if (url.includes('/embed/')) return url;

            const urlObj = new URL(url);

            // 2. Check for explicit 'revId' parameter (Common in /track/ URLs)
            const revId = urlObj.searchParams.get('revId');
            if (revId) {
                return `https://www.bandlab.com/embed/?id=${revId}`;
            }

            // 3. Handle /post/UUID or /track/UUID format
            // Regex to catch the ID after /post/ or /track/
            const match = urlObj.pathname.match(/\/(post|track)\/([a-zA-Z0-9-]+)/);
            if (match && match[2]) {
                let id = match[2];
                // User-observed pattern: ID 'c4...' maps to Embed ID 'c1...'
                if (id.startsWith('c4')) {
                    id = 'c1' + id.substring(2);
                }
                return `https://www.bandlab.com/embed/?id=${id}`;
            }
        } catch (e) {
            return url;
        }
    }

    // For others, we might return null if handled by ReactPlayer, or specific embed logic
    return url;
};
