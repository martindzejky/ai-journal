<template>
    <article>
        <Editor
            :model-value="note.content"
            readonly
        />
    </article>
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
