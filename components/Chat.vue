<template>
    <div
        class="flex grow p-6 min-h-0 overflow-auto flex-col gap-4"
        ref="container"
    >
        <Message
            v-for="message in messages"
            :key="message.id"
            :message="message"
        />
    </div>
</template>

<script setup lang="ts">
const chatStore = useChat();
const { messages } = storeToRefs(chatStore);

const container = ref<HTMLElement>();
</script>
