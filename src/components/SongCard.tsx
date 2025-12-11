import React, { useState, useEffect } from 'react';
import type { Song } from '../types';
import { getEmbedUrl } from '../utils/platformDetector';
import { Check, X, ExternalLink, Info } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { motion } from 'framer-motion';

interface SongCardProps {
    song: Song;
    onApprove: () => void;
    onReject: () => void;
    onOpenDetails: () => void; // New prop for modal
}

export const SongCard: React.FC<SongCardProps> = ({ song, onApprove, onReject, onOpenDetails }) => {
    const { url, platform, artistName, status, id } = song;
    const isSpotify = platform === 'spotify';

    const [resolvedUrl, setResolvedUrl] = useState<string>('');
    const [resolving, setResolving] = useState(false);
    const [metadata, setMetadata] = useState<{ title?: string; artist?: string; cover?: string }>({});

    useEffect(() => {
        if (platform === 'bandlab' && url) {
            setResolving(true);
            const embedUrl = getEmbedUrl(url, platform);

            fetch(`/api/resolve-bandlab?url=${encodeURIComponent(url)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.audioUrl) {
                        const proxyUrl = `/api/stream-audio?url=${encodeURIComponent(data.audioUrl)}`;
                        setResolvedUrl(proxyUrl);
                        setMetadata({
                            title: data.title,
                            artist: data.artist,
                            cover: data.cover
                        });
                    } else if (data.id) {
                        setResolvedUrl(`https://www.bandlab.com/embed/?id=${data.id}`);
                    } else {
                        setResolvedUrl(embedUrl);
                    }
                })
                .catch(() => setResolvedUrl(embedUrl))
                .finally(() => setResolving(false));
        } else {
            setResolvedUrl(getEmbedUrl(url, platform));
        }
    }, [url, platform]);

    return (
        <motion.div
            layoutId={`song-card-${id}`}
            className="material-card p-0 flex flex-col gap-0 group overflow-hidden bg-surface relative"
        >
            {/* Header / Info Bar */}
            <div className="p-4 flex justify-between items-start bg-surface border-b border-border/50">
                <div className="flex-1 min-w-0 mr-4 cursor-pointer" onClick={onOpenDetails}>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-text truncate hover:text-primary transition-colors duration-200" title={artistName}>
                            {artistName}
                        </h3>
                        <Info size={14} className="text-textSecondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-textSecondary hover:text-primary flex items-center gap-1 w-fit px-2 py-0.5 rounded-full bg-surfaceHighlight border border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {platform.toUpperCase()} <ExternalLink size={10} />
                    </a>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                    {status}
                </div>
            </div>

            {/* Media Area */}
            <div className="aspect-video w-full bg-black relative z-0">
                {resolving ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50 animate-pulse bg-gray-900">
                        <span className="text-sm font-medium tracking-wide">Resolving...</span>
                    </div>
                ) : (isSpotify || (platform === 'bandlab' && resolvedUrl.includes('/embed/')) || platform === 'youtube') ? (
                    <iframe
                        src={resolvedUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="encrypted-media; fullscreen; accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture"
                        allowTransparency
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900">
                        <AudioPlayer
                            src={resolvedUrl || url}
                            artistName={metadata.artist || artistName}
                            songName={metadata.title}
                            coverUrl={metadata.cover}
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border mt-auto">
                <button
                    onClick={onReject}
                    className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-textSecondary hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                    <X size={18} /> Reject
                </button>
                <button
                    onClick={onApprove}
                    className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-textSecondary hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                    <Check size={18} /> Approve
                </button>
            </div>
        </motion.div>
    );
};
