<template>
    <div class="flex gap-4 md:gap-0 flex-col">
        <button
            class="mx-6 md:mx-0"
            @click="create"
        >
            <div class="bg-white px-6 rounded-xl flex items-center gap-2 py-4">
                <Icon
                    v-if="loading"
                    name="svg-spinners:270-ring"
                />
                <Icon
                    v-else
                    name="material-symbols:add"
                />

                New chat
            </div>
        </button>

        <p
            v-if="chats.chats.length === 0"
            class="text-center text-gray-500 px-10 md:px-6 md:text-left text-sm"
        >
            You don't have any conversations with the AI yet.
        </p>

        <ChatPreview
            v-for="chat in chats.chats"
            :key="chat.id"
            :chat="chat"
        />
    </div>
</template>

<script setup lang="ts">
const chats = useChats();
const { createChat } = useChat();
const router = useRouter();

const loading = ref(false);

async function create() {
    if (loading.value) return;

    loading.value = true;
    const id = await createChat();
    await router.push(`/chats/${id}`);
    loading.value = false;
}
</script>
