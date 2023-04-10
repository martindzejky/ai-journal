<template>
    <nav class="px-4 flex">
        <NuxtLink
            href="/notes"
            class="text-slate-400 text-2xl block p-2 pt-4"
        >
            <Icon name="material-symbols:arrow-back" />
        </NuxtLink>

        <button
            class="text-slate-400 text-2xl block p-2 pt-4"
            @click="deleteNote"
        >
            <Icon name="material-symbols:delete" />
        </button>
    </nav>

    <article class="p-6">
        <p class="mb-4 text-slate-400">
            <span>
                {{ date }}

                <button
                    v-if="state === TimestampState.Hidden"
                    class="hover:underline"
                    @click="editTimestamp"
                >
                    (edit)
                </button>
            </span>

            <span v-if="updatedAgo">&nbsp;&middot;&nbsp;</span>
            <span v-if="updatedAgo">Updated {{ updatedAgo }} ago</span>
        </p>

        <form
            v-if="state !== TimestampState.Hidden"
            class="flex gap-2 mb-4"
            @submit.prevent="saveTimestamp"
        >
            <Input
                type="date"
                :model-value="timestampFormatted"
                @update:model-value="setTimestampValue"
            />

            <Button
                type="submit"
                :loading="state === TimestampState.Saving"
            >
                Save
            </Button>
        </form>

        <Editor
            variant="full"
            :model-value="note?.content"
            @update:model-value="setContent"
        />
    </article>
</template>

<script setup lang="ts">
import { format, formatDistanceToNow, formatRelative, parse } from 'date-fns';
import { capitalize } from 'lodash-es';

definePageMeta({
    name: 'note',
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    disableDarkBackground: true,
    disableCenterLayout: true,
});

enum TimestampState {
    Hidden,
    Visible,
    Saving,
}

const state = ref(TimestampState.Hidden);
const timestamp = ref(new Date());
const timestampFormatted = computed(() => format(timestamp.value, 'yyyy-MM-dd'));

const noteStore = useNote();
const { flushSetContent, setContent, setTimestamp, deleteNote } = noteStore;
const { note } = storeToRefs(noteStore);

const date = computed(() => {
    const formatted = formatRelative(note.value?.timestamp.toDate() ?? new Date(), new Date());
    const split = formatted.split(' at ');
    return capitalize(split[0]);
});

const updatedAgo = computed(() => {
    if (!note.value?.lastUpdate) return;
    return formatDistanceToNow(note.value.lastUpdate.toDate());
});

onBeforeRouteLeave(async () => {
    await flushSetContent();
});

function editTimestamp() {
    state.value = TimestampState.Visible;
    timestamp.value = note.value?.timestamp.toDate() ?? new Date();
}

function setTimestampValue(value: string) {
    timestamp.value = parse(value, 'yyyy-MM-dd', new Date());
}

async function saveTimestamp() {
    state.value = TimestampState.Saving;
    await setTimestamp(timestamp.value);
    state.value = TimestampState.Hidden;
}
</script>
