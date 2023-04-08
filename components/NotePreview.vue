<template>
    <NuxtLink
        :href="`/notes/${note.id}`"
        class="mx-6"
    >
        <article class="bg-white px-6 rounded-xl py-4">
            <Editor
                class="line-clamp-3 text-ellipsis"
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

defineProps({
    note: {
        type: Object as PropType<Note>,
        required: true,
    },
});
</script>
