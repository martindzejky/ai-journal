<template>
    <section class="flex max-h-full flex-col grow">
        <Chat />

        <p class="px-4 flex gap-2 items-center my-1 text-slate-400">
            <Icon
                name="material-symbols:info"
                class="flex-none text-base"
            />

            <em class="text-sm leading-tight">
                This is a technical preview and an experiment. It is not (yet) intended for general
                use. The AI may generate incorrect or made-up responses.
            </em>
        </p>

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
