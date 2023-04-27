import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
    updateDoc,
} from '@firebase/firestore';
import { Note } from '~/types/note';
import { debounce } from 'lodash-es';

export const useNote = defineStore('note', () => {
    const app = useNuxtApp();
    const route = app.$router.currentRoute;
    const router = app.$router;

    const user = useCurrentUser();
    const db = useFirestore();

    const noteId = computed(() => {
        if (route.value.name !== 'note') return undefined;
        if (typeof route.value.params.id !== 'string') return undefined;
        return route.value.params.id;
    });

    const noteSource = computed(() => {
        if (!noteId.value) return undefined;
        return doc(db, 'notes', noteId.value);
    });

    const { data: note, pending, error } = useDocument<Note>(noteSource);

    // reset error when note changes
    watch(noteId, () => (error.value = undefined));

    const debouncedSetContent = debounce(setContent, 1000);

    async function setContent(content: string) {
        if (!noteSource.value) return;

        await updateDoc(noteSource.value, {
            content,
            lastUpdate: serverTimestamp(),
        } as Partial<Note>);
    }

    async function setTimestamp(timestamp: Date) {
        if (!noteSource.value) return;

        await updateDoc(noteSource.value, {
            timestamp: Timestamp.fromDate(timestamp),
            lastUpdate: serverTimestamp(),
        } as Partial<Note>);
    }

    async function createNote() {
        if (!user.value) return;

        const noteRef = await addDoc(collection(db, 'notes'), {
            owner: user.value.uid,
            content: '',
            timestamp: serverTimestamp(),
            lastUpdate: serverTimestamp(),
        } as Omit<Note, 'id'>);

        return noteRef.id;
    }

    async function deleteNote() {
        if (!noteSource.value) return;

        debouncedSetContent.cancel();

        if (note.value) {
            await deleteDoc(noteSource.value);
        }

        await router.push('/notes');
    }

    return {
        note: readonly(note),
        pending: readonly(pending),
        error: readonly(error),
        setContent: debouncedSetContent,
        flushSetContent: debouncedSetContent.flush,
        setTimestamp,
        createNote,
        deleteNote,
    };
});
