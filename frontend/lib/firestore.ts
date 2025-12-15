import { collection, addDoc, query, where, orderBy, limit, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Generation {
    id?: string;
    userId: string;
    type: 'image' | 'video';

    // Image specific
    imageUrl?: string;
    prompt?: string;
    structuredPrompt?: object;
    aspectRatio?: string;
    mode?: 'quick' | 'pro';

    // Video specific
    videoUrl?: string;
    videoTool?: 'upscale' | 'remove_bg' | 'foreground_mask';

    // Image edit specific
    editTool?: 'remove_bg' | 'replace_bg' | 'erase' | 'gen_fill' | 'upscale';

    createdAt?: any;
}

/**
 * Save a generation to Firestore
 */
export async function saveGeneration(userId: string, generation: Omit<Generation, 'userId' | 'createdAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'generations'), {
            ...generation,
            userId,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving generation:', error);
        throw error;
    }
}

/**
 * Get user's generation history
 */
export async function getUserGenerations(userId: string, maxResults: number = 50): Promise<Generation[]> {
    try {
        const q = query(
            collection(db, 'generations'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );

        const querySnapshot = await getDocs(q);
        const generations: Generation[] = [];

        querySnapshot.forEach((doc) => {
            generations.push({
                id: doc.id,
                ...doc.data()
            } as Generation);
        });

        return generations;
    } catch (error) {
        console.error('Error fetching generations:', error);
        throw error;
    }
}

/**
 * Delete a generation
 */
export async function deleteGeneration(generationId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'generations', generationId));
    } catch (error) {
        console.error('Error deleting generation:', error);
        throw error;
    }
}

/**
 * Get generations by type
 */
export async function getUserGenerationsByType(userId: string, type: 'image' | 'video', maxResults: number = 50): Promise<Generation[]> {
    try {
        const q = query(
            collection(db, 'generations'),
            where('userId', '==', userId),
            where('type', '==', type),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );

        const querySnapshot = await getDocs(q);
        const generations: Generation[] = [];

        querySnapshot.forEach((doc) => {
            generations.push({
                id: doc.id,
                ...doc.data()
            } as Generation);
        });

        return generations;
    } catch (error) {
        console.error('Error fetching generations by type:', error);
        throw error;
    }
}
