<template>
    <div
        class="rounded-lg bg-white px-4 py-2"
        :class="{
            'self-start': message.author === 'ai',
            'self-end': message.author === 'user',
        }"
    >
        <div class="mb-1 text-xs italic text-slate-400">
            <span
                v-if="message.author === 'user'"
                class="flex items-center gap-0.5"
            >
                <Icon name="material-symbols:person" />
                You
            </span>

            <span
                v-else
                class="flex items-center gap-0.5"
            >
                <Icon name="material-symbols:robot" />
                AI
            </span>
        </div>

        <p>
            {{ message.content }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { PropType } from '@vue/runtime-core';
import { Message } from '~/types/message';

defineProps({
    message: {
        type: Object as PropType<Message>,
        required: true,
    },
});
</script>
