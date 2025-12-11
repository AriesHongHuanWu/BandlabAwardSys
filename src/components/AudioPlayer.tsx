import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    artistName: string;
    songName?: string;
    coverUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, artistName, songName, coverUrl }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            if (audioRef.current.duration) setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3 shadow-lg">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                loop={false}
            />

            <div className="relative group">
                <div className={`absolute -inset-1 rounded-full opacity-20 blur-sm transition-all duration-300 ${isPlaying ? 'bg-primary animate-pulse' : 'bg-transparent'}`}></div>
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 relative flex-shrink-0 flex items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700 hover:scale-105 transition-all overflow-hidden"
                >
                    {coverUrl ? (
                        <>
                            <img src={coverUrl} alt="Cover" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-30' : 'opacity-100'}`} />
                            <div className={`relative z-10 ${!isPlaying && 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                            </div>
                        </>
                    ) : (
                        isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-end text-xs text-secondary font-medium px-1">
                    <span className="truncate max-w-[200px] text-white/90">
                        <span className="text-primary font-bold">{artistName}</span>
                        {songName && <span className="text-zinc-400"> - {songName}</span>}
                    </span>
                    <span>{formatTime(progress)} / {formatTime(duration)}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary hover:bg-white/30 transition-colors"
                />
            </div>

            {/* Volume (simulated for simplicity, or could implement fully) */}
            {/*  <div className="w-8 h-8 flex items-center justify-center text-white/50">
               <Volume2 size={16} />
            </div> */}
        </div>
    );
};
