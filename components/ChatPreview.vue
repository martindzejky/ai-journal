<template>
    <NuxtLink
        :href="`/chats/${chat.id}`"
        class="mx-6 md:mx-0 md:border-t md:last:border-b md:border-stone-200"
    >
        <article class="bg-white px-6 rounded-xl py-4 md:rounded-none">
            <p class="text-slate-400">Chat from {{ date }}</p>
        </article>
    </NuxtLink>
</template>

<script setup lang="ts">
import { Chat } from '~/types/chat';
import { formatRelative } from 'date-fns';
import { capitalize } from 'lodash-es';
import { PropType } from '@vue/runtime-core';

const props = defineProps({
    chat: {
        type: Object as PropType<Chat>,
        required: true,
    },
});

const { chat } = toRefs(props);

const date = computed(() => {
    const formatted = formatRelative(chat.value.timestamp.toDate(), new Date());
    const split = formatted.split(' at ');
    return capitalize(split[0]);
});
</script>
