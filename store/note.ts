import { deleteDoc, doc, setDoc, updateDoc } from '@firebase/firestore';
import { Note } from '~/types/note';
import { debounce } from 'lodash-es';
import { serverTimestamp } from '@firebase/database';

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

    const note = useDocument<Note>(noteSource);

    const debouncedSetContent = debounce(setContent, 1000);

    async function setContent(content: string) {
        if (!user.value) return;
        if (!noteSource.value) return;

        if (note.value) {
            await updateDoc(noteSource.value, { content, updatedAt: serverTimestamp() });
        } else {
            await setDoc(noteSource.value, {
                owner: user.value.uid,
                content,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            } as Omit<Note, 'id'>);
        }
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
        setContent: debouncedSetContent,
        flushSetContent: debouncedSetContent.flush,
        deleteNote,
    };
});
