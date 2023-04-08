<template>
    <div class="flex gap-4 md:gap-0 flex-col">
        <NuxtLink
            class="mx-6 md:mx-0"
            :href="`/notes/${newId}`"
        >
            <div class="bg-white px-6 rounded-xl flex items-center gap-2 py-4">
                <Icon name="material-symbols:add" />
                New note
            </div>
        </NuxtLink>

        <p
            v-if="notes.notes.length === 0"
            class="text-center text-gray-500 px-10 md:px-6 md:text-left text-sm"
        >
            You don't have any notes yet. Click on the button above to create a new one.
        </p>

        <NotePreview
            v-for="note in notes.notes"
            :key="note.id"
            :note="note"
        />
    </div>
</template>

<script setup lang="ts">
import { useNotes } from '~/store/notes';
import { collection, doc } from '@firebase/firestore';

const notes = useNotes();

const db = useFirestore();
const newId = doc(collection(db, 'notes')).id;
</script>
