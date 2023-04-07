<template>
    <div class="flex flex-col gap-4">
        <p v-if="notes.notes.length === 0">No notes yet. Create one!</p>

        <NotePreview
            v-for="note in notes.notes"
            :key="note.id"
            :note="note"
        />
    </div>
</template>

<script setup lang="ts">
import { useNotes } from '~/store/notes';

const notes = useNotes();
</script>
