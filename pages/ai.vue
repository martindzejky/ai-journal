<template>
    <section class="flex max-h-full flex-col grow">
        <Chat />

        <ChatPrompt
            class="flex-none"
            v-model="prompt"
            @keydown.enter="confirm"
        />
    </section>
</template>

<script setup lang="ts">
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

async function confirm(e: KeyboardEvent) {
    // shift+enter to add a new line
    if (e.shiftKey) return;

    e.preventDefault();
    e.stopPropagation();

    await submitPrompt(prompt.value);
    prompt.value = '';
}
</script>
