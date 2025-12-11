import React, { useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Music, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error(err);
            setError('Failed to sign in. Please check your connection or Firebase config.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/20 rounded-full text-primary ring-1 ring-primary/50">
                        <Music size={48} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Music Screener
                    </h1>
                    <p className="text-white/50">Administrative Access Only</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm border border-red-500/20">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
                >
                    <LogIn size={20} />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};
