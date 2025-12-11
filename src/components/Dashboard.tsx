import React, { useState, useMemo } from 'react';
import { useSongs } from '../hooks/useSongs';
import { SongCard } from './SongCard';
import { ImportUpload } from './ImportUpload';
import type { Vote } from '../types';
import { LayoutGrid, Table as TableIcon, Download, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import type { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';

interface DashboardProps {
    user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const { songs, loading, voteSong, updateStatus } = useSongs();
    const { logout } = useAuth();
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

        // Auto update status if strictly screening (optional rule)
        updateStatus(songId, type === 'approve' ? 'approved' : 'rejected');
    };

    const exportData = () => {
        const ws = XLSX.utils.json_to_sheet(songs.map(s => ({
            Artist: s.artistName,
            URL: s.url,
            Platform: s.platform,
            Status: s.status,
            Votes: s.votes.length
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Songs");
        XLSX.writeFile(wb, "Filtered_Songs.xlsx");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen p-8 space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Music Screener
                    </h1>
                    <p className="text-white/50">Collaborative filtering dashboard</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                        <UserIcon size={14} />
                        <span>{user.displayName || user.email}</span>
                    </div>
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

            {/* Import Section (Collapsible or just visible if empty) */}
            {songs.length === 0 && (
                <section className="max-w-xl mx-auto">
                    <ImportUpload />
                </section>
            )}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-colors ${filterStatus === status
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        {status} {status !== 'all' && `(${songs.filter(s => s.status === status).length})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredSongs.map(song => (
                            <motion.div
                                key={song.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SongCard
                                    song={song}
                                    onApprove={() => handleVote(song.id, 'approve')}
                                    onReject={() => handleVote(song.id, 'reject')}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-white/80">
                        <thead className="bg-white/5 text-xs uppercase font-bold text-white/50">
                            <tr>
                                <th className="p-4">Artist</th>
                                <th className="p-4">Platform</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSongs.map(song => (
                                <tr key={song.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium">{song.artistName}</td>
                                    <td className="p-4 capitalize">{song.platform}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs lowercase ${song.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                            song.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>{song.status}</span>
                                    </td>
                                    <td className="p-4">
                                        <a href={song.url} target="_blank" className="text-primary hover:underline">Open</a>
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
