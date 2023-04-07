<template>
    <article>
        <p>This is a note!</p>
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
