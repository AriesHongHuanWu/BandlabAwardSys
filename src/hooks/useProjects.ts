import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, getDocs, where, writeBatch } from 'firebase/firestore';

export interface Project {
    id: string;
    name: string;
    createdAt: number;
    songCount: number;
}

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
            setProjects(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createProject = async (name: string) => {
        const docRef = await addDoc(collection(db, 'projects'), {
            name,
            createdAt: Date.now(),
            songCount: 0
        });
        return docRef.id;
    };

    const deleteProject = async (projectId: string) => {
        // 1. Delete project doc
        await deleteDoc(doc(db, 'projects', projectId));

        // 2. Delete all songs in project (Batch delete)
        const songsQ = query(collection(db, 'songs'), where('projectId', '==', projectId));
        const snapshot = await getDocs(songsQ);

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    };

    return { projects, loading, createProject, deleteProject };
};
