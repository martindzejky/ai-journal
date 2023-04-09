<template>
    <div
        class="rounded-lg bg-white lg:max-w-[80%] px-4 py-2"
        :class="{
            'self-start': message.author === 'ai',
            'self-end': message.author === 'user',
            '!bg-rose-400 !text-white':
                message.author === 'ai' && message.status === AIMessageStatus.Error,
        }"
    >
        <div
            class="mb-1 text-xs italic text-slate-400"
            :class="{
                '!text-white': message.author === 'ai' && message.status === AIMessageStatus.Error,
            }"
        >
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

        <template v-if="message.author === 'ai'">
            <p
                class="text-xs mb-1 italic text-slate-400 font-medium"
                v-if="
                    [AIMessageStatus.Pending, AIMessageStatus.Processing].includes(message.status)
                "
            >
                AI is thinking...
            </p>
        </template>

        <p v-if="message.author === 'ai' && message.status === AIMessageStatus.Error">
            Something went wrong 😢!
        </p>

        <p v-else>
            {{ message.content }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { PropType } from '@vue/runtime-core';
import { AIMessageStatus, Message } from '~/types/message';

defineProps({
    message: {
        type: Object as PropType<Message>,
        required: true,
    },
});
</script>
