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
        <p class="mb-4 text-slate-400">{{ date }} &middot; Updated {{ updatedAgo }} ago</p>

        <Editor
            variant="full"
            :model-value="note?.content"
            @update:model-value="setContent"
        />
    </article>
</template>

<script setup lang="ts">
import { formatDistanceToNow, formatRelative } from 'date-fns';
import { capitalize } from 'lodash-es';

definePageMeta({
    name: 'note',
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    disableDarkBackground: true,
    disableCenterLayout: true,
});

const noteStore = useNote();
const { flushSetContent, setContent, deleteNote } = noteStore;
const { note } = storeToRefs(noteStore);

const date = computed(() => {
    const formatted = formatRelative(note.value?.timestamp.toDate() ?? new Date(), new Date());
    const split = formatted.split(' at ');
    return capitalize(split[0]);
});

const updatedAgo = computed(() => {
    return formatDistanceToNow(note.value?.timestamp.toDate() ?? new Date());
});

onBeforeRouteLeave(async () => {
    await flushSetContent();
});
</script>
