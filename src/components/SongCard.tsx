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
    onInfoClick?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onApprove, onReject, onInfoClick }) => {
    const { url, platform, artistName, status } = song;
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
            console.log('Resolving generic platform:', platform, url);
            setResolvedUrl(getEmbedUrl(url, platform));
        }
    }, [url, platform]);

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col h-[340px] rounded-[32px] overflow-hidden bg-zinc-900 border border-white/5 shadow-xl transition-all duration-300"
        >
            {/* Header / Info Area (Clickable) */}
            <div
                onClick={onInfoClick}
                className="absolute top-0 left-0 w-full p-6 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent cursor-pointer"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                {platform}
                            </span>
                            {status !== 'pending' && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status === 'approved' ? 'bg-green-500/20 border-green-500/20 text-green-400' :
                                        'bg-red-500/20 border-red-500/20 text-red-400'
                                    }`}>
                                    {status}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-2xl text-white truncate drop-shadow-md group-hover:text-primary transition-colors">
                            {artistName}
                        </h3>
                    </div>
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100">
                        <Info size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content (Player/Embed) */}
            <div className="absolute inset-0 z-0 bg-zinc-900">
                {resolving ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium tracking-wide uppercase">Loading...</span>
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
                    <AudioPlayer
                        src={resolvedUrl || url}
                        artistName={metadata.artist || artistName}
                        songName={metadata.title}
                        coverUrl={metadata.cover}
                    />
                )}
            </div>

            {/* Action Bar (Glassmorphism) */}
            <div className="mt-auto relative z-20 p-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onReject(); }}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-black/40 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/30 backdrop-blur-md transition-all font-medium"
                    >
                        <X size={18} /> <span className="text-sm">Reject</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onApprove(); }}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 hover:bg-green-500/20 text-white hover:text-green-400 border border-white/20 hover:border-green-500/30 backdrop-blur-md transition-all font-medium"
                    >
                        <Check size={18} /> <span className="text-sm">Approve</span>
                    </button>
                </div>
                <div className="flex justify-center mt-3">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-white/30 hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        Open Original <ExternalLink size={10} />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};
