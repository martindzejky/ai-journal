<template>
    <section class="flex flex-col grow">
        <div class="grow p-6">
            <Chat />
        </div>

        <ChatPrompt
            class="flex-none"
            v-model="prompt"
            :disabled="lastMessageAuthor === 'user'"
            @keydown.enter="confirm"
        />
    </section>
</template>

<script setup lang="ts">
import { useChat } from '~/store/chat';
import { storeToRefs } from 'pinia';
import { last } from 'lodash-es';

definePageMeta({
    middleware: ['logged-in'],
    layout: 'app',
    name: 'ai',
    title: 'AI',
    disableCenterLayout: true,
});

const prompt = ref('');
const chatStore = useChat();
const { messages } = storeToRefs(chatStore);
const { submitPrompt } = chatStore;

const lastMessageAuthor = computed(() => {
    if (!messages.value) return;
    return last(messages.value)?.author;
});

async function confirm(e: KeyboardEvent) {
    // shift+enter to add a new line
    if (e.shiftKey) return;

    e.preventDefault();
    e.stopPropagation();

    await submitPrompt(prompt.value);
    prompt.value = '';
}
</script>
