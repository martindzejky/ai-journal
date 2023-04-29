<template>
    <div class="flex p-4 grow items-center justify-center flex-col gap-4">
        <Icon
            name="material-symbols:error"
            class="text-slate-300 text-[160px]"
        />

        <p class="text-slate-400 text-lg text-center">
            <template v-if="error instanceof FirebaseError">
                Oops! It looks like the chat you're looking for doesn't exist, or you don't have
                permission to view it. 🧐 You can always create a new chat to start talking to the
                AI!
            </template>

            <template v-else>
                Oops! Something went terribly wrong while trying to load this chat 🙈. Maybe ask the
                AI for help in a new chat?
            </template>
        </p>

        <div class="flex gap-4">
            <Button
                :is="NuxtLink"
                href="/chats"
            >
                Back to chats
            </Button>

            <Button
                :loading="loading"
                @click="create"
            >
                New chat
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from '@vue/runtime-core';
import { FirebaseError } from '@firebase/util';
import { NuxtLink } from '#components';

defineProps({
    error: {
        type: Object as PropType<FirebaseError | Error>,
        required: true,
    },
});

const router = useRouter();
const loading = ref(false);

const { createChat } = useChat();

async function create() {
    if (loading.value) return;

    loading.value = true;
    const id = await createChat();
    await router.push(`/chats/${id}`);
    loading.value = false;
}
</script>
