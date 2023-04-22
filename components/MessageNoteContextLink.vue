<template>
    <NuxtLink :href="`/notes/${noteId}`">
        {{ noteTitle }}
    </NuxtLink>
</template>

<script setup lang="ts">
import { generateText } from '@tiptap/core';

const props = defineProps({
    noteId: {
        type: String,
        required: true,
    },
});

const notesStore = useNotes();
const { notes } = storeToRefs(notesStore);

const note = computed(() => {
    return notes.value.find((note) => note.id === props.noteId);
});

const noteTitle = computed(() => {
    if (!note.value) return;

    const parsedContent = JSON.parse(note.value.content);
    const text = generateText(parsedContent, editorExtensions(), { blockSeparator: '\n' });
    return text.split('\n')[0];
});
</script>
