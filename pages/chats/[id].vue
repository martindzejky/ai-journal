<template>
    <template v-if="pending">
        <p class="text-slate-400">Loading...</p>
    </template>

    <template v-else-if="error">
        <ChatError :error="error" />
    </template>

    <section
        v-else
        class="flex max-h-full flex-col grow"
    >
        <Chat />

        <ChatPrompt
            class="flex-none"
            v-model="prompt"
            :disabled="isLastMessageFromUser || !isLastMessageDone"
            @keydown.capture.enter="confirm"
        />
    </section>
</template>

<script setup lang="ts">
import { last } from 'lodash-es';
import { AIMessageStatus } from '~/types/message';

definePageMeta({
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    name: 'chat',
    title: 'AI',
    disableCenterLayout: true,
});

const prompt = ref('');
const chatStore = useChat();
const { messages, pending, error } = storeToRefs(chatStore);
const { submitPrompt } = chatStore;

const isLastMessageFromUser = computed(() => {
    const lastMessage = last(messages.value);
    return lastMessage?.author === 'user';
});

const isLastMessageDone = computed(() => {
    if (!messages.value?.length) return true;

    const lastMessage = last(messages.value);
    return (
        lastMessage?.author === 'ai' &&
        [AIMessageStatus.Success, AIMessageStatus.Error].includes(lastMessage?.status)
    );
});

async function confirm(e: KeyboardEvent) {
    if (isLastMessageFromUser.value) return;
    if (!isLastMessageDone.value) return;

    // shift+enter to add a new line
    if (e.shiftKey) return;

    e.preventDefault();
    e.stopPropagation();

    await submitPrompt(prompt.value);
    prompt.value = '';
}
</script>
