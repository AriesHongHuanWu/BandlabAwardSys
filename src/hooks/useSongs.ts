import { useState, useEffect } from 'react';
import { db, songsCollection } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, query, where, addDoc } from 'firebase/firestore';
import type { Song, Vote } from '../types';

export const useSongs = (projectId: string | null = null) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) {
            setSongs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Using simple query for now. Requires index for compound query with orderBy.
        // If sorting is critical, we might need to create the index or sort client side.
        const q = query(
            collection(db, 'songs'),
            where('projectId', '==', projectId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const songsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Song[];

            // Client-side sort to avoid index issues for now
            songsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            setSongs(songsList);
            setLoading(false);
        }, (err) => {
            console.error("Firebase Error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [projectId]);

    const addSongs = async (newSongs: Omit<Song, 'id'>[]) => {
        // Run in parallel or batch if too many
        const promises = newSongs.map(song => addDoc(songsCollection, song));
        await Promise.all(promises);
    };

    const voteSong = async (songId: string, vote: Vote) => {
        const songRef = doc(songsCollection, songId);
        await updateDoc(songRef, {
            votes: arrayUnion(vote)
        });
    };

    const updateStatus = async (songId: string, status: Song['status']) => {
        const songRef = doc(songsCollection, songId);
        await updateDoc(songRef, { status });
    };

    return { songs, loading, addSongs, voteSong, updateStatus };
};
