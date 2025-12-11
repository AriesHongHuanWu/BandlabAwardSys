import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Song } from '../types';

interface SongDetailModalProps {
    song: Song | null;
    isOpen: boolean;
    onClose: () => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({ song, isOpen, onClose }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !song) return null;

    // Filter out internal fields to show only relevant Excel data
    const displayData = Object.entries(song.originalRowData || {}).filter(([key]) => {
        return !['url', 'status', 'extractedUrl', 'votes', 'notes'].includes(key);
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-surface w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-material-lg overflow-hidden flex flex-col"
                            layoutId={`song-card-${song.id}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-border bg-surfaceHighlight">
                                <div>
                                    <h2 className="text-xl font-bold text-text truncate max-w-md" title={song.artistName}>
                                        {song.artistName}
                                    </h2>
                                    <p className="text-sm text-textSecondary uppercase tracking-wider font-medium">Submission Details</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-black/5 text-textSecondary hover:text-text transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Raw Data Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {displayData.map(([key, value]) => (
                                        <div key={key} className="space-y-1">
                                            <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wide opacity-80">
                                                {key.replace(/_/g, ' ')}
                                            </h4>
                                            <p className="text-text font-medium break-words bg-surfaceHighlight/50 p-2 rounded-lg border border-border/50">
                                                {String(value)}
                                            </p>
                                        </div>
                                    ))}

                                    {/* Fallback if no data */}
                                    {displayData.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-textSecondary italic">
                                            No additional details provided.
                                        </div>
                                    )}
                                </div>

                                {/* Link Section */}
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <h4 className="text-xs font-bold text-primary uppercase mb-2">Source Link</h4>
                                    <a
                                        href={song.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline break-all font-medium"
                                    >
                                        {song.url}
                                    </a>
                                </div>
                            </div>

                            {/* Footer Actions (Optional integration for voting inside modal later) */}
                            {/* <div className="p-4 border-t border-border bg-surfaceHighlight flex justify-end">
                                <button onClick={onClose} className="material-btn bg-white border border-border hover:bg-gray-50 text-text">
                                    Close
                                </button>
                            </div> */}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
