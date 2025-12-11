import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import type { Song } from '../types';
import { getEmbedUrl } from '../utils/platformDetector';
import { Check, X, ExternalLink } from 'lucide-react';

interface SongCardProps {
    song: Song;
    onApprove: () => void;
    onReject: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onApprove, onReject }) => {
    const { url, platform, artistName, status } = song;
    const isSpotify = platform === 'spotify';

    const [resolvedUrl, setResolvedUrl] = useState<string>('');
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        if (platform === 'bandlab' && url) {
            // Only attempt resolution for posts and tracks
            if (!url.includes('/post/') && !url.includes('/track/')) {
                setResolvedUrl(getEmbedUrl(url, platform));
                return;
            }

            const embedUrl = getEmbedUrl(url, platform);

            // If the synchronous logic found a valid embed URL (has /embed/), use it.
            if (embedUrl.includes('/embed/')) {
                setResolvedUrl(embedUrl);
            } else {
                // Otherwise, try to resolve via our backend function
                setResolving(true);
                // Use a relative path for the API call, works in dev and prod if proxy/functions set up
                fetch(`/api/resolve-bandlab?url=${encodeURIComponent(url)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.id) {
                            setResolvedUrl(`https://www.bandlab.com/embed/?id=${data.id}`);
                        } else {
                            setResolvedUrl(embedUrl); // Fallback
                        }
                    })
                    .catch(() => setResolvedUrl(embedUrl))
                    .finally(() => setResolving(false));
            }
        } else {
            // For other platforms, just use the synchronous result
            setResolvedUrl(getEmbedUrl(url, platform));
        }
    }, [url, platform]);

    // Cast ReactPlayer to any to avoid strict type issues with 'url' prop in some TS configurations
    const Player = ReactPlayer as any;

    return (
        <div className="glass-card p-4 flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-white truncate max-w-[200px]" title={artistName}>{artistName}</h3>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        {platform.toUpperCase()} <ExternalLink size={10} />
                    </a>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="aspect-video w-full bg-black/50 rounded-lg overflow-hidden relative">
                {resolving ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 animate-pulse">
                        <span className="text-sm">Resolving Link...</span>
                    </div>
                ) : (isSpotify || (platform === 'bandlab' && resolvedUrl.includes('/embed/'))) ? (
                    <iframe
                        src={resolvedUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="encrypted-media; fullscreen"
                        allowTransparency
                    />
                ) : (
                    <div className="w-full h-full">
                        <Player
                            url={url}
                            width="100%"
                            height="100%"
                            controls
                            light
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <button
                    onClick={onReject}
                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-medium"
                >
                    <X size={18} /> Reject
                </button>
                <button
                    onClick={onApprove}
                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all font-medium"
                >
                    <Check size={18} /> Approve
                </button>
            </div>
        </div>
    );
};
