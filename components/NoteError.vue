<template>
    <div class="flex p-4 grow items-center justify-center flex-col gap-4">
        <Icon
            name="material-symbols:error"
            class="text-slate-300 text-[160px]"
        />

        <p class="text-slate-400 text-lg text-center">
            <template v-if="error instanceof FirebaseError">
                Oops! It looks like the note you're looking for doesn't exist, or you don't have
                permission to view it.
            </template>

            <template v-else>
                Oops! Something went terribly wrong while trying to load this note.
            </template>
        </p>

        <div class="flex gap-4">
            <Button
                :is="NuxtLink"
                href="/notes"
            >
                Back to notes
            </Button>

            <Button
                :loading="loading"
                @click="create"
            >
                New note
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

const { createNote } = useNote();

async function create() {
    if (loading.value) return;

    loading.value = true;
    const id = await createNote();
    await router.push(`/notes/${id}`);
    loading.value = false;
}
</script>
