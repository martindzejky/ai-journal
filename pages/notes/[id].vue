<template>
    <nav class="px-4 flex">
        <NuxtLink
            href="/notes"
            class="text-slate-400 text-2xl block p-2 pt-4"
        >
            <Icon name="material-symbols:arrow-back" />
        </NuxtLink>

        <button
            class="text-slate-400 text-2xl block p-2 pt-4"
            @click="deleteNote"
        >
            <Icon name="material-symbols:delete" />
        </button>
    </nav>

    <article class="p-6">
        <Editor
            variant="full"
            :model-value="note?.content"
            @update:model-value="setContent"
        />
    </article>
</template>

<script setup lang="ts">
import { useNote } from '~/store/note';
import { storeToRefs } from 'pinia';

definePageMeta({
    name: 'note',
    middleware: ['logged-in'],
    layout: 'app',
    disableDarkBackground: true,
    disableCenterLayout: true,
});

const noteStore = useNote();
const { flushSetContent, setContent, deleteNote } = noteStore;
const { note } = storeToRefs(noteStore);

onBeforeRouteLeave(async () => {
    await flushSetContent();
});
</script>
