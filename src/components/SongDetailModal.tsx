import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MessageCircle, Tag, Share2 } from 'lucide-react';
import { Song } from '../types';

interface SongDetailModalProps {
    song: Song | null;
    onClose: () => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({ song, onClose }) => {
    if (!song) return null;

    return (
        <AnimatePresence>
            {song && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            layoutId={`song-card-${song.id}`}
                            className="bg-zinc-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Header Section */}
                            <div className="p-8 pb-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

                                <motion.h2 layoutId={`title-${song.id}`} className="text-3xl font-bold text-white mb-2 relative z-10">
                                    {song.artistName}
                                </motion.h2>
                                <div className="text-zinc-400 text-sm flex items-center gap-2 mb-6 relative z-10">
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/5 uppercase text-xs font-bold tracking-wider">
                                        {song.platform}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(song.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Main Data Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Submitter Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white/70">Submitter</h4>
                                                <p className="text-white">{song.submitterEmail || 'N/A'}</p>
                                                {song.socialHandles && (
                                                    <p className="text-sm text-blue-400 mt-1">{song.socialHandles}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                                <Tag size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white/70">Category</h4>
                                                <p className="text-white capitalize">{song.submissionCategory || 'General'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Permissions & Misc */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
                                                <Share2 size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-white/70">Feature Permission</h4>
                                                <p className="text-white text-sm">{song.featurePermission || 'Not Specified'}</p>
                                            </div>
                                        </div>

                                        {song.nominations && (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                                                    <Tag size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-white/70">Nominations</h4>
                                                    <p className="text-white text-sm">{song.nominations}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Full Text Sections */}
                            <div className="p-8 pt-0 space-y-6">
                                {song.submissionReason && (
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3 text-white/80 font-medium">
                                            <MessageCircle size={16} />
                                            <h3>Why did you write this song?</h3>
                                        </div>
                                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {song.submissionReason}
                                        </p>
                                    </div>
                                )}

                                {song.notes && (
                                    <div className="bg-yellow-500/5 rounded-2xl p-5 border border-yellow-500/10">
                                        <h3 className="text-yellow-200/80 font-medium mb-2 text-sm uppercase tracking-wide">Internal Notes</h3>
                                        <p className="text-yellow-100/80 text-sm leading-relaxed whitespace-pre-wrap">
                                            {song.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3 rounded-b-3xl">
                                <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
