import { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

const SUPER_ADMIN = 'ARIESWU001@GMAIL.COM';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            setError(null);

            if (currentUser) {
                const email = currentUser.email?.toUpperCase();

                // 1. Check if Super Admin
                if (email === SUPER_ADMIN) {
                    // Ensure super admin exists in DB so they can verify others later
                    const adminRef = doc(db, 'admins', email);
                    const adminSnap = await getDoc(adminRef);
                    if (!adminSnap.exists()) {
                        await setDoc(adminRef, {
                            email: email,
                            addedBy: 'SYSTEM',
                            createdAt: Date.now()
                        });
                    }

                    setUser(currentUser);
                    setIsAdmin(true);
                } else {
                    // 2. Check Whitelist
                    if (currentUser.email) {
                        const adminRef = doc(db, 'admins', currentUser.email.toUpperCase());
                        const adminSnap = await getDoc(adminRef);

                        if (adminSnap.exists()) {
                            setUser(currentUser);
                            setIsAdmin(true);
                        } else {
                            // User authorized by Google but not in our whitelist
                            await signOut(auth);
                            setUser(null);
                            setIsAdmin(false);
                            setError('Access Denied: You are not an authorized administrator.');
                        }
                    } else {
                        // No email? Weird, but denial
                        await signOut(auth);
                        setError('No email found.');
                    }
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = () => signOut(auth);

    return { user, loading, isAdmin, error, logout };
};
