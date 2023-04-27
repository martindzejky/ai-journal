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

                New note
            </div>
        </button>

        <p
            v-if="notes.notes.length === 0"
            class="text-center text-gray-500 px-10 md:px-6 md:text-left text-sm"
        >
            You don't have any notes yet. Click on the button above to create a new one.
        </p>

        <NotePreview
            v-for="note in notes.notes"
            :key="note.id"
            :note="note"
        />
    </div>
</template>

<script setup lang="ts">
const notes = useNotes();
const { createNote } = useNote();
const router = useRouter();

const loading = ref(false);

async function create() {
    if (loading.value) return;

    loading.value = true;
    const id = await createNote();
    await router.push(`/notes/${id}`);
    loading.value = false;
}
</script>
