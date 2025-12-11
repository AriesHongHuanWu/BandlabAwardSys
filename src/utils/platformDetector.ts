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
    // For others, we might return null if handled by ReactPlayer, or specific embed logic
    return url;
};
