import { defineStore } from 'pinia';
import { collection, query, where } from '@firebase/firestore';
import { Note } from '~/types/note';

export const useNotes = defineStore('notes', () => {
    const user = useCurrentUser();
    const db = useFirestore();

    const notesCollection = collection(db, 'notes');
    const notesQuery = query(notesCollection, where('owner', '==', user.value?.uid));

    const notes = useCollection<Note>(notesQuery);

    return { notes };
});
