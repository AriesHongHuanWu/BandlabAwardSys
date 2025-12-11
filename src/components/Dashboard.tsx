import React, { useState, useMemo } from 'react';
import { useSongs } from '../hooks/useSongs';
import { SongCard } from './SongCard';
import { ImportUpload } from './ImportUpload';
import { AdminPanel } from './AdminPanel';
import { SongDetailModal } from './SongDetailModal';
import type { Vote, Song } from '../types';
import { LayoutGrid, Table as TableIcon, Download, LogOut, User as UserIcon, Shield, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import type { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { usePresence } from '../hooks/usePresence';

interface DashboardProps {
    user: User;
    projectId: string;
    onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, projectId, onBack }) => {
    const { songs, loading, voteSong, updateStatus } = useSongs(projectId);
    const { activeUsers } = usePresence(projectId);
    const { logout } = useAuth();
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);

    const filteredSongs = useMemo(() => {
        return songs.filter(s => filterStatus === 'all' ? true : s.status === filterStatus);
    }, [songs, filterStatus]);

    const handleVote = (songId: string, type: 'approve' | 'reject') => {
        const vote: Vote = {
            userId: user.uid,
            userName: user.displayName || user.email || 'Anonymous Screener',
            vote: type,
            timestamp: Date.now()
        };
        voteSong(songId, vote);
        updateStatus(songId, type === 'approve' ? 'approved' : 'rejected');
    };

    const exportData = () => {
        const ws = XLSX.utils.json_to_sheet(songs.map(s => ({
            Artist: s.artistName,
            URL: s.url,
            Platform: s.platform,
            Status: s.status,
            Votes: s.votes.length,
            Category: s.submissionCategory,
            Submitter: s.submitterEmail
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Songs");
        XLSX.writeFile(wb, "Filtered_Songs.xlsx");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen p-8 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                        title="Back to Projects"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Music Screener
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-white/50">Project ID: {projectId.slice(0, 8)}...</p>
                            {activeUsers.length > 0 && (
                                <div className="flex -space-x-2">
                                    {activeUsers.map(u => (
                                        <div key={u.uid} className="relative group" title={u.displayName || u.email || 'User'}>
                                            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                                                {u.photoURL ? <img src={u.photoURL} alt="avi" /> : (u.displayName?.[0] || 'U')}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                        <UserIcon size={14} />
                        <span>{user.displayName || user.email}</span>
                    </div>

                    <button
                        onClick={() => setShowAdminPanel(true)}
                        className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                        title="Admin Management"
                    >
                        <Shield size={20} />
                    </button>

                    <button
                        onClick={logout}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        <LayoutGrid />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        <TableIcon />
                    </button>
                    <button
                        onClick={exportData}
                        className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        title="Export to Excel"
                    >
                        <Download />
                    </button>
                </div>
            </header>

            {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

            <SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />

            {songs.length === 0 && (
                <section className="max-w-xl mx-auto">
                    <ImportUpload projectId={projectId} />
                </section>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2.5 rounded-full capitalize text-sm font-medium transition-all duration-300 ${filterStatus === status
                            ? 'bg-primary text-black shadow-primary/20 shadow-lg scale-105'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {status} {status !== 'all' && `(${songs.filter(s => s.status === status).length})`}
                    </button>
                ))}
            </div>

            {viewMode === 'grid' ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredSongs.map(song => (
                            <motion.div
                                key={song.id}
                                layoutId={`song-card-${song.id}`}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <SongCard
                                    song={song}
                                    onApprove={() => handleVote(song.id, 'approve')}
                                    onReject={() => handleVote(song.id, 'reject')}
                                    onInfoClick={() => setSelectedSong(song)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="glass rounded-xl overflow-hidden p-1">
                    <table className="w-full text-left text-sm text-white/80">
                        <thead className="bg-white/5 text-xs uppercase font-bold text-white/50">
                            <tr>
                                <th className="p-4 rounded-tl-lg">Artist</th>
                                <th className="p-4">Platform</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSongs.map(song => (
                                <tr key={song.id}
                                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedSong(song)}
                                >
                                    <td className="p-4 font-medium text-white group-hover:text-primary transition-colors">{song.artistName}</td>
                                    <td className="p-4 capitalize">{song.platform}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs lowercase border ${song.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                            song.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                            }`}>{song.status}</span>
                                    </td>
                                    <td className="p-4 text-white/40 group-hover:text-white transition-colors">
                                        View Details
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
