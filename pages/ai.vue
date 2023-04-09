<template>
    <section class="flex max-h-full flex-col grow">
        <Chat />

        <ChatPrompt
            class="flex-none"
            v-model="prompt"
            :disabled="isLastMessageFromUser || !isLastMessageDone"
            @keydown.enter="confirm"
        />
    </section>
</template>

<script setup lang="ts">
import { last } from 'lodash-es';
import { AIMessageStatus } from '~/types/message';

definePageMeta({
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    name: 'ai',
    title: 'AI',
    disableCenterLayout: true,
});

const prompt = ref('');
const chatStore = useChat();
const { messages } = storeToRefs(chatStore);
const { submitPrompt } = chatStore;

const isLastMessageFromUser = computed(() => {
    const lastMessage = last(messages.value);
    return lastMessage?.author === 'user';
});

const isLastMessageDone = computed(() => {
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
