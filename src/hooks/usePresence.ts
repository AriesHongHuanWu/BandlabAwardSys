import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface PresenceUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    currentProjectId: string | null;
    lastActive: any;
}

export const usePresence = (projectId: string | null, user: any) => {
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

    // 1. Update my own presence
    useEffect(() => {
        if (!user || !projectId) return;

        const { uid, email, displayName, photoURL } = user;
        const userRef = doc(db, 'presence', uid);

        const updatePresence = () => {
            setDoc(userRef, {
                uid,
                email,
                displayName,
                photoURL,
                currentProjectId: projectId,
                lastActive: serverTimestamp()
            }, { merge: true });
        };

        updatePresence();

        // Heartbeat or activity listener can go here if needed
        // For now, just setting it on mount/project change

        const handleUnload = () => deleteDoc(userRef);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            handleUnload();
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [projectId, user]);

    // 2. Listen to other users
    useEffect(() => {
        if (!projectId) return;

        const unsubscribe = onSnapshot(collection(db, 'presence'), (snapshot) => {
            const users = snapshot.docs
                .map(d => d.data() as PresenceUser)
                .filter(u => u.currentProjectId === projectId); // Client-side filter for simplicity

            // Filter out stale users > 5 mins (optional, if we had a heartbeat)
            setActiveUsers(users);
        });

        return () => unsubscribe();
    }, [projectId]);

    return { activeUsers };
};
