<template>
    <NuxtLink
        :href="`/notes/${note.id}`"
        class="mx-6 md:mx-0 md:border-t md:last:border-b md:border-stone-200"
    >
        <article class="bg-white px-6 rounded-xl py-4 md:rounded-none">
            <p class="mb-1 text-sm text-slate-400">
                {{ date }}
            </p>
            <Editor
                class="max-h-40 overflow-hidden text-ellipsis"
                :model-value="note.content"
                readonly
                variant="minimal"
            />
        </article>
    </NuxtLink>
</template>

<script setup lang="ts">
import { Note } from '~/types/note';
import { PropType } from '@vue/runtime-core';
import { formatRelative } from 'date-fns';
import { capitalize } from 'lodash-es';

const props = defineProps({
    note: {
        type: Object as PropType<Note>,
        required: true,
    },
});

const { note } = toRefs(props);

const date = computed(() => {
    const formatted = formatRelative(note.value.timestamp.toDate(), new Date());
    const split = formatted.split(' at ');
    return capitalize(split[0]);
});
</script>
