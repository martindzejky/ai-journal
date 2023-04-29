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

        <p class="px-4 flex gap-2 items-center text-slate-400">
            <Icon
                name="material-symbols:info"
                class="flex-none text-base"
            />

            <em class="text-sm leading-tight">
                This is a technical preview and an experiment. It is not (yet) intended for general
                use. The AI may generate incorrect or made-up responses. Right now, the AI can use
                your journal notes and up to 10 last chat messages for context.
            </em>
        </p>
    </div>
</template>

<script setup lang="ts">
const chatStore = useChat();
const { messages } = storeToRefs(chatStore);

const container = ref<HTMLElement>();
</script>
