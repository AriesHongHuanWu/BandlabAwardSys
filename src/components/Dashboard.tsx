import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSongs } from '../hooks/useSongs';
import { SongCard } from './SongCard';
import { ImportUpload } from './ImportUpload';
import { AdminPanel } from './AdminPanel';
import { SongDetailModal } from './SongDetailModal';
import { LogOut, LayoutGrid, List, Settings, ChevronLeft } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { usePresence } from '../hooks/usePresence';
import type { Song } from '../types';

interface DashboardProps {
    onLogout: () => void;
    projectId: string;
    onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, projectId, onBack }) => {
    const { user, isAdmin } = useAuth();
    const { songs, loading, updateStatus } = useSongs(projectId); // Removed unused addSongs, error
    const { activeUsers } = usePresence(projectId, user);

    // Project Info
    const { projects } = useProjects();
    const currentProject = projects.find(p => p.id === projectId);

    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [showAdmin, setShowAdmin] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);

    const filteredSongs = songs.filter(song => {
        if (filter === 'all') return true;
        return song.status === filter;
    });

    const stats = {
        total: songs.length,
        pending: songs.filter(s => s.status === 'pending').length,
        approved: songs.filter(s => s.status === 'approved').length,
        rejected: songs.filter(s => s.status === 'rejected').length
    };

    if (showAdmin) {
        return <AdminPanel onClose={() => setShowAdmin(false)} />;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surfaceHighlight text-textSecondary hover:text-text transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text flex items-center gap-2">
                            {currentProject?.name || 'Project Dashboard'}
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">Beta</span>
                        </h1>
                        <p className="text-xs text-textSecondary font-medium">Welcome back, {user?.displayName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Presence */}
                    <div className="flex -space-x-2 mr-4">
                        {activeUsers.slice(0, 5).map(u => (
                            <img key={u.uid} src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`}
                                className="w-8 h-8 rounded-full border-2 border-surface shadow-sm" title={u.displayName || undefined} />
                        ))}
                        {activeUsers.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-surfaceHighlight border-2 border-surface flex items-center justify-center text-xs font-bold text-textSecondary">
                                +{activeUsers.length - 5}
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <button onClick={() => setShowAdmin(true)} className="p-2 rounded-full text-textSecondary hover:text-primary hover:bg-surfaceHighlight transition-colors" title="Admin Settings">
                            <Settings size={20} />
                        </button>
                    )}
                    <button onClick={onLogout} className="p-2 rounded-full text-textSecondary hover:text-red-600 hover:bg-red-50 transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Stats Cards */}
                    <div className="material-card p-6 flex flex-col justify-between bg-white border-l-4 border-l-primary">
                        <span className="text-textSecondary text-sm font-medium uppercase tracking-wider">Total Songs</span>
                        <span className="text-3xl font-bold text-text mt-1">{stats.total}</span>
                    </div>
                    <div className="material-card p-6 flex flex-col justify-between bg-white border-l-4 border-l-yellow-400">
                        <span className="text-textSecondary text-sm font-medium uppercase tracking-wider">Pending</span>
                        <span className="text-3xl font-bold text-text mt-1">{stats.pending}</span>
                    </div>
                    <div className="material-card p-6 flex flex-col justify-between bg-white border-l-4 border-l-green-500">
                        <span className="text-textSecondary text-sm font-medium uppercase tracking-wider">Approved</span>
                        <span className="text-3xl font-bold text-text mt-1">{stats.approved}</span>
                    </div>

                    {/* Upload Action */}
                    <div className="h-full">
                        <ImportUpload projectId={projectId} />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === f
                                ? 'bg-text text-white shadow-material-md'
                                : 'bg-surface text-textSecondary hover:bg-surfaceHighlight border border-border'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <div className="ml-auto hidden md:flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
                        <button className="p-1.5 rounded hover:bg-surfaceHighlight text-text"><LayoutGrid size={18} /></button>
                        <button className="p-1.5 rounded hover:bg-surfaceHighlight text-textSecondary"><List size={18} /></button>
                    </div>
                </div>

                {/* Song Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : filteredSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-textSecondary space-y-4">
                        <div className="w-16 h-16 rounded-full bg-surfaceHighlight flex items-center justify-center">
                            <List size={32} className="opacity-50" />
                        </div>
                        <p className="text-lg font-medium">No songs found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSongs.map(song => (
                            <SongCard
                                key={song.id}
                                song={song}
                                onApprove={() => updateStatus(song.id!, 'approved')}
                                onReject={() => updateStatus(song.id!, 'rejected')}
                                onOpenDetails={() => setSelectedSong(song)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            <SongDetailModal
                song={selectedSong}
                isOpen={!!selectedSong}
                onClose={() => setSelectedSong(null)}
            />
        </div>
    );
};
