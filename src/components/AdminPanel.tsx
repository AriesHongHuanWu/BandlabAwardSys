import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Trash2, UserPlus, Shield, Loader, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AdminUser {
    email: string;
    addedBy: string;
    createdAt: number;
}

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const adminList = snapshot.docs.map(doc => doc.data() as AdminUser);
            setAdmins(adminList);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) return;
        const email = newEmail.trim().toUpperCase();

        try {
            await setDoc(doc(db, 'admins', email), {
                email,
                addedBy: user?.email || 'Unknown',
                createdAt: Date.now()
            });
            setNewEmail('');
            fetchAdmins();
        } catch (err) {
            setError('Failed to add admin');
        }
    };

    const handleRemove = async (email: string) => {
        if (!confirm(`Remove ${email} from admins?`)) return;
        try {
            await deleteDoc(doc(db, 'admins', email));
            fetchAdmins();
        } catch (err) {
            setError('Failed to remove admin');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Admin Management</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} className="text-white/70" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Add Form */}
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new admin Google Email..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                            type="submit"
                            disabled={!newEmail}
                            className="bg-primary text-black font-bold px-4 rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <UserPlus size={18} />
                            Add
                        </button>
                    </form>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* List */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader className="animate-spin text-white/30" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase text-white/40 tracking-wider">
                                Current Admins ({admins.length})
                            </h3>
                            <div className="space-y-2">
                                {admins.map((admin) => (
                                    <div key={admin.email} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                                        <div>
                                            <div className="font-medium text-white">{admin.email}</div>
                                            <div className="text-xs text-white/30">
                                                Added by {admin.addedBy}
                                            </div>
                                        </div>
                                        {admin.email !== 'ARIESWU001@GMAIL.COM' && (
                                            <button
                                                onClick={() => handleRemove(admin.email)}
                                                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Remove Admin"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
