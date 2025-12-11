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
        <div className="w-full h-full relative flex flex-col justify-end p-4 group overflow-hidden">
            {/* Background Blur */}
            {coverUrl && (
                <div className="absolute inset-0 z-0">
                    <img src={coverUrl} alt="bg" className="w-full h-full object-cover blur-xl opacity-50 scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                </div>
            )}

            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                loop={false}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`absolute -inset-2 rounded-full opacity-20 blur-md transition-all duration-300 ${isPlaying ? 'bg-primary animate-pulse' : 'bg-transparent'}`}></div>
                        <button
                            onClick={togglePlay}
                            className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:scale-105 transition-all backdrop-blur-md overflow-hidden"
                        >
                            {coverUrl && (
                                <img src={coverUrl} alt="Cover" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-40' : 'opacity-80'}`} />
                            )}
                            <div className="relative z-10 drop-shadow-lg">
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-lg leading-tight truncate drop-shadow-md">
                            {artistName}
                        </div>
                        {songName && (
                            <div className="text-white/70 text-sm truncate font-medium">
                                {songName}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50 font-medium px-0.5">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full bg-primary transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={progress}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
