import { useState, useEffect } from 'react';
import { songsCollection } from '../services/firebase';
import { onSnapshot, query, orderBy, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import type { Song, Vote } from '../types';

export const useSongs = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(songsCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Song[];
            setSongs(data);
            setLoading(false);
        }, (err) => {
            console.error("Firebase Error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addSongs = async (newSongs: Omit<Song, 'id'>[]) => {
        for (const song of newSongs) {
            await addDoc(songsCollection, song);
        }
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
