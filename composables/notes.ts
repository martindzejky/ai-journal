import { collection, orderBy, query, where } from '@firebase/firestore';
import { Note } from '~/types/note';

export const useNotes = defineStore('notes', () => {
    const user = useCurrentUser();
    const db = useFirestore();

    const notesCollection = collection(db, 'notes');

    const notesQuery = computed(() => {
        if (!user.value) return undefined;
        return query(
            notesCollection,
            where('owner', '==', user.value.uid),
            orderBy('createdAt', 'desc'),
        );
    });

    const notes = useCollection<Note>(notesQuery);

    return {
        notes: readonly(notes),
    };
});
