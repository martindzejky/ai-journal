<template>
    <article>
        <Editor
            :model-value="note?.content"
            @update:model-value="debouncedSetContent"
        />
    </article>
</template>

<script setup lang="ts">
import { doc, setDoc, updateDoc } from '@firebase/firestore';
import { Note } from '~/types/note';
import { debounce } from 'lodash-es';

definePageMeta({
    middleware: ['logged-in'],
    layout: 'app',
});

const db = useFirestore();
const route = useRoute();
const user = useCurrentUser();

const noteId = computed(() => {
    if (typeof route.params.id !== 'string') return undefined;
    return route.params.id;
});

const noteSource = computed(() => {
    if (!noteId.value) return undefined;
    return doc(db, 'notes', noteId.value);
});

const note = useDocument<Note>(noteSource.value);

const debouncedSetContent = debounce(setContent, 1000);
async function setContent(content: string) {
    if (!user.value) return;
    if (!noteSource.value) return;

    if (note.value) {
        await updateDoc(noteSource.value, { content });
    } else {
        await setDoc(noteSource.value, {
            owner: user.value.uid,
            content,
        } as Note);
    }
}

onBeforeUnmount(() => {
    debouncedSetContent.flush();
});
</script>
