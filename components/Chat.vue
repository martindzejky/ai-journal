<template>
    <div class="flex flex-col gap-4">
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
</script>
